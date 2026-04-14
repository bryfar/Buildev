import { Router, Response } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { prisma } from "../services/db";
import { requireAuthHandler, AuthRequest } from "../middleware/auth";
import { requireNonEmptySiteId } from "../middleware/activeSite";
import type { BSBlock, BSVariant } from "@buildersite/domain";

export const pagesRouter = Router();

pagesRouter.use(requireAuthHandler);

// ─── GET /api/pages ───────────────────────────────────────────────────────────
pagesRouter.get("/", async (req: AuthRequest, res: Response) => {
    const pages = await prisma.page.findMany({
        where: { siteId: req.auth!.siteId },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true, name: true, urlPath: true,
            status: true, publishedAt: true, updatedAt: true,
        },
    });
    res.json({ ok: true, data: pages });
});

// ─── GET /api/pages/:id ───────────────────────────────────────────────────────
pagesRouter.get("/:id", async (req: AuthRequest, res: Response) => {
    const page = await prisma.page.findFirst({
        where: { id: req.params.id, siteId: req.auth!.siteId },
    });
    if (!page) { res.status(404).json({ ok: false, error: "Page not found" }); return; }
    res.json({ ok: true, data: deserializePage(page) });
});

// ─── POST /api/pages ──────────────────────────────────────────────────────────
const CreatePageSchema = z.object({
    name: z.string().min(1),
    urlPath: z.string().startsWith("/"),
    title: z.string().optional(),
    description: z.string().optional(),
});

pagesRouter.post("/", async (req: AuthRequest, res: Response) => {
    if (!requireNonEmptySiteId(req, res)) return;
    const parsed = CreatePageSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() }); return;
    }
    const page = await prisma.page.create({
        data: {
            ...parsed.data,
            siteId: req.auth!.siteId,
            status: "draft",
            blocksJson: "[]",
        },
    });
    res.status(201).json({ ok: true, data: deserializePage(page) });
});

// ─── PATCH /api/pages/:id ─────────────────────────────────────────────────────
const UpdatePageSchema = z.object({
    name: z.string().min(1).optional(),
    urlPath: z.string().startsWith("/").optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    script: z.string().optional(),
    blocks: z.array(z.unknown()).optional(),
    variants: z.array(z.unknown()).optional(),
});

pagesRouter.patch("/:id", async (req: AuthRequest, res: Response) => {
    if (!requireNonEmptySiteId(req, res)) return;
    const parsed = UpdatePageSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() }); return;
    }
    const existing = await prisma.page.findFirst({
        where: { id: req.params.id, siteId: req.auth!.siteId },
    });
    if (!existing) {
        res.status(404).json({ ok: false, error: "Page not found" });
        return;
    }
    const { blocks, variants, script, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (blocks !== undefined) data.blocksJson = JSON.stringify(blocks);
    if (variants !== undefined) data.variantsJson = JSON.stringify(variants);
    if (script !== undefined) data.script = script;

    const page = await prisma.page.update({
        where: { id: req.params.id },
        data,
    });
    res.json({ ok: true, data: deserializePage(page) });
});

// ─── DELETE /api/pages/:id ────────────────────────────────────────────────────
pagesRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    if (!requireNonEmptySiteId(req, res)) return;
    const result = await prisma.page.deleteMany({
        where: { id: req.params.id, siteId: req.auth!.siteId },
    });
    if (result.count === 0) {
        res.status(404).json({ ok: false, error: "Page not found" });
        return;
    }
    res.json({ ok: true, data: null });
});

// ─── POST /api/pages/:id/publish ─────────────────────────────────────────────
pagesRouter.post("/:id/publish", async (req: AuthRequest, res: Response) => {
    if (!requireNonEmptySiteId(req, res)) return;
    const page = await prisma.page.findFirst({
        where: { id: req.params.id, siteId: req.auth!.siteId },
    });
    if (!page) { res.status(404).json({ ok: false, error: "Page not found" }); return; }

    const now = new Date();
    const updated = await prisma.page.update({
        where: { id: req.params.id },
        data: { status: "published", publishedAt: now },
    });

    await prisma.publication.create({
        data: {
            pageId: page.id,
            siteId: req.auth!.siteId,
            publishedBy: req.auth!.userId,
            snapshotJson: JSON.stringify(deserializePage(updated)),
            publishedAt: now,
        },
    });

    res.json({ ok: true, data: deserializePage(updated) });
});

// ─── POST /api/pages/:id/duplicate ───────────────────────────────────────────
pagesRouter.post("/:id/duplicate", async (req: AuthRequest, res: Response) => {
    if (!requireNonEmptySiteId(req, res)) return;
    const original = await prisma.page.findFirst({
        where: { id: req.params.id, siteId: req.auth!.siteId },
    });
    if (!original) { res.status(404).json({ ok: false, error: "Page not found" }); return; }

    const duplicated = await prisma.page.create({
        data: {
            siteId: original.siteId,
            name: `${original.name} (Copy)`,
            urlPath: `${original.urlPath}-${uuid().slice(0, 4)}`,
            title: original.title,
            description: original.description,
            status: "draft",
            blocksJson: original.blocksJson,
            variantsJson: original.variantsJson,
        },
    });

    res.status(201).json({ ok: true, data: deserializePage(duplicated) });
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function deserializePage(row: {
    id: string; siteId: string; name: string; urlPath: string;
    title: string | null; description: string | null; status: string;
    blocksJson: string; variantsJson: string; script?: string | null; publishedAt: Date | null;
    createdAt: Date; updatedAt: Date;
}) {
    return {
        id: row.id,
        siteId: row.siteId,
        name: row.name,
        urlPath: row.urlPath,
        title: row.title ?? undefined,
        description: row.description ?? undefined,
        status: row.status,
        blocks: JSON.parse(row.blocksJson) as BSBlock[],
        variants: JSON.parse(row.variantsJson) as BSVariant[],
        script: row.script ?? undefined,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}
