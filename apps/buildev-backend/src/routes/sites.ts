import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../services/db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import {
    BuildevProjectSettingsStoredSchema,
    PROJECT_SETTINGS_VARIABLE_KEY,
} from "../services/buildevProjectSettings";

export const sitesRouter = Router();

sitesRouter.use(requireAuth as any);

// ─── GET /api/sites ───────────────────────────────────────────────────────────
sitesRouter.get("/", async (req: AuthRequest, res: Response) => {
    const sites = await prisma.site.findMany({
        where: { userId: req.auth!.userId },
        orderBy: { updatedAt: "desc" },
    });
    const siteIds = sites.map((s) => s.id);
    const settingsRows =
        siteIds.length === 0
            ? []
            : await prisma.variable.findMany({
                  where: { siteId: { in: siteIds }, key: PROJECT_SETTINGS_VARIABLE_KEY },
              });
    const settingsBySite = new Map<string, z.infer<typeof BuildevProjectSettingsStoredSchema>>();
    for (const row of settingsRows) {
        try {
            const parsed = BuildevProjectSettingsStoredSchema.safeParse(JSON.parse(row.valueJson));
            if (parsed.success) {
                settingsBySite.set(row.siteId, parsed.data);
            }
        } catch {
            continue;
        }
    }
    const data = sites.map((site) => {
        const ps = settingsBySite.get(site.id);
        if (!ps) {
            return site;
        }
        return {
            ...site,
            projectType: ps.projectType,
            stack: ps.stack,
            backend: ps.backend,
            cms: ps.cms,
        };
    });
    res.json({ ok: true, data });
});

// ─── POST /api/sites ──────────────────────────────────────────────────────────
const CreateSiteSchema = z.object({
    name: z.string().min(1),
    subdomain: z.string().optional(),
}).passthrough();

const WorkspacePayloadSchema = z.object({
    designSystems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        scope: z.enum(["site", "global"]),
        siteId: z.string(),
        colorPrimary: z.string(),
        colorSurface: z.string(),
        typography: z.string(),
    })).default([]),
    activeDesignSystemId: z.string().optional(),
    installedPlugins: z.array(z.string()).default([]),
});

sitesRouter.post("/", async (req: AuthRequest, res: Response) => {
    const parsed = CreateSiteSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() }); return;
    }

    // Check if user exists (since auth might be mocked)
    let userId = req.auth!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        // Create a default user if not exists for dev
        const newUser = await prisma.user.create({
            data: { id: userId, email: "dev@buildersite.com", name: "Dev User", passwordHash: "pwd_hash" }
        });
        userId = newUser.id;
    }

    const { name, subdomain } = parsed.data;
    const site = await prisma.site.create({
        data: {
            name,
            ...(typeof subdomain === "string" && subdomain.length > 0 ? { domain: subdomain } : {}),
            userId: userId,
        },
    });
    res.status(201).json({ ok: true, data: site });
});

// ─── DELETE /api/sites/:id ────────────────────────────────────────────────────
sitesRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    await prisma.site.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: null });
});

// ─── GET /api/sites/workspace ────────────────────────────────────────────────
sitesRouter.get("/workspace", async (req: AuthRequest, res: Response) => {
    const ownedSites = await prisma.site.findMany({
        where: { userId: req.auth!.userId },
        select: { id: true },
    });
    const siteIds = ownedSites.map((site) => site.id);
    if (siteIds.length === 0) {
        res.json({ ok: true, data: { bySite: {} } });
        return;
    }

    const variables = await prisma.variable.findMany({
        where: {
            siteId: { in: siteIds },
            key: {
                in: [
                    "workspace_design_systems",
                    "workspace_active_design_system",
                    "workspace_installed_plugins",
                ],
            },
        },
    });

    const bySite: Record<string, { designSystems: unknown[]; activeDesignSystemId: string; installedPlugins: string[] }> = {};
    for (const siteId of siteIds) {
        bySite[siteId] = { designSystems: [], activeDesignSystemId: "", installedPlugins: [] };
    }

    for (const variable of variables) {
        const bucket = bySite[variable.siteId];
        if (!bucket) continue;
        try {
            const parsed = JSON.parse(variable.valueJson);
            if (variable.key === "workspace_design_systems" && Array.isArray(parsed)) {
                bucket.designSystems = parsed;
            }
            if (variable.key === "workspace_active_design_system" && typeof parsed === "string") {
                bucket.activeDesignSystemId = parsed;
            }
            if (variable.key === "workspace_installed_plugins" && Array.isArray(parsed)) {
                bucket.installedPlugins = parsed.filter((item) => typeof item === "string");
            }
        } catch {
            continue;
        }
    }

    res.json({ ok: true, data: { bySite } });
});

// ─── PUT /api/sites/:id/workspace ────────────────────────────────────────────
sitesRouter.put("/:id/workspace", async (req: AuthRequest, res: Response) => {
    const siteId = req.params.id;
    const parsed = WorkspacePayloadSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }

    const site = await prisma.site.findFirst({
        where: { id: siteId, userId: req.auth!.userId },
        select: { id: true },
    });
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }

    const payload = parsed.data;

    await prisma.variable.upsert({
        where: { siteId_key: { siteId, key: "workspace_design_systems" } },
        create: {
            siteId,
            key: "workspace_design_systems",
            type: "json",
            valueJson: JSON.stringify(payload.designSystems),
            description: "Dashboard workspace design systems",
        },
        update: { valueJson: JSON.stringify(payload.designSystems) },
    });

    await prisma.variable.upsert({
        where: { siteId_key: { siteId, key: "workspace_active_design_system" } },
        create: {
            siteId,
            key: "workspace_active_design_system",
            type: "string",
            valueJson: JSON.stringify(payload.activeDesignSystemId ?? ""),
            description: "Active design system for project",
        },
        update: { valueJson: JSON.stringify(payload.activeDesignSystemId ?? "") },
    });

    await prisma.variable.upsert({
        where: { siteId_key: { siteId, key: "workspace_installed_plugins" } },
        create: {
            siteId,
            key: "workspace_installed_plugins",
            type: "json",
            valueJson: JSON.stringify(payload.installedPlugins),
            description: "Installed plugins for project",
        },
        update: { valueJson: JSON.stringify(payload.installedPlugins) },
    });

    res.json({ ok: true, data: payload });
});
