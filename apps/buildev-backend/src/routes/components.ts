import { Router, Response } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../services/db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requireNonEmptySiteId } from "../middleware/activeSite";

export const componentsRouter = Router();

componentsRouter.use(requireAuth as any);

const CreateBodySchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    rootBlock: z.unknown(),
    designSystemId: z.string().min(1).nullable().optional(),
});

const PatchBodySchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    rootBlock: z.unknown().optional(),
    designSystemId: z.string().min(1).nullable().optional(),
});

function parseDesignSystemQuery(raw: unknown): "all" | "unassigned" | string {
    if (typeof raw !== "string" || raw.length === 0) return "all";
    if (raw === "__unassigned__") return "unassigned";
    return raw;
}

// ─── GET /api/components ─────────────────────────────────────────────────────
componentsRouter.get("/", async (req: AuthRequest, res: Response) => {
    try {
        const siteId = req.auth!.siteId;
        const mode = parseDesignSystemQuery(req.query["designSystemId"]);
        const where: Prisma.ComponentWhereInput = { siteId };
        if (mode === "unassigned") {
            where.designSystemId = null;
        } else if (mode !== "all") {
            where.designSystemId = mode;
        }
        const components = await prisma.component.findMany({
            where,
            orderBy: { updatedAt: "desc" },
        });
        res.json({ ok: true, data: components });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});

// ─── POST /api/components ────────────────────────────────────────────────────
componentsRouter.post("/", async (req: AuthRequest, res: Response) => {
    try {
        if (!requireNonEmptySiteId(req, res)) return;
        const parsed = CreateBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ ok: false, error: parsed.error.flatten() });
            return;
        }
        const siteId = req.auth!.siteId;
        const { name, description, rootBlock, designSystemId } = parsed.data;
        const component = await prisma.component.create({
            data: {
                siteId,
                name,
                description: description ?? null,
                rootBlockJson: JSON.stringify(rootBlock),
                designSystemId: designSystemId ?? null,
            },
        });
        res.status(201).json({ ok: true, data: component });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});

// ─── PATCH /api/components/:id ─────────────────────────────────────────────
componentsRouter.patch("/:id", async (req: AuthRequest, res: Response) => {
    try {
        if (!requireNonEmptySiteId(req, res)) return;
        const parsed = PatchBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ ok: false, error: parsed.error.flatten() });
            return;
        }
        const siteId = req.auth!.siteId;
        const existing = await prisma.component.findFirst({
            where: { id: req.params.id, siteId },
        });
        if (!existing) {
            res.status(404).json({ ok: false, error: "Component not found" });
            return;
        }
        const { name, description, rootBlock, designSystemId } = parsed.data;
        const data: Prisma.ComponentUpdateInput = {};
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (rootBlock !== undefined) data.rootBlockJson = JSON.stringify(rootBlock);
        if (designSystemId !== undefined) {
            data.designSystemId = designSystemId;
        }
        const component = await prisma.component.update({
            where: { id: req.params.id },
            data,
        });
        res.json({ ok: true, data: component });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});

// ─── DELETE /api/components/:id ────────────────────────────────────────────
componentsRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    try {
        if (!requireNonEmptySiteId(req, res)) return;
        const siteId = req.auth!.siteId;
        const removed = await prisma.component.deleteMany({
            where: { id: req.params.id, siteId },
        });
        if (removed.count === 0) {
            res.status(404).json({ ok: false, error: "Component not found" });
            return;
        }
        res.json({ ok: true });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});
