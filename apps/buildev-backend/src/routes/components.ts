import { Router, Response } from "express";
import { prisma } from "../services/db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requireNonEmptySiteId } from "../middleware/activeSite";

export const componentsRouter = Router();

componentsRouter.use(requireAuth as any);

// List components
componentsRouter.get("/", async (req: AuthRequest, res: Response) => {
    try {
        const siteId = req.auth!.siteId;
        const components = await prisma.component.findMany({
            where: { siteId },
            orderBy: { updatedAt: "desc" },
        });
        res.json({ ok: true, data: components });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});

// Create component from block
componentsRouter.post("/", async (req: AuthRequest, res: Response) => {
    try {
        if (!requireNonEmptySiteId(req, res)) return;
        const siteId = req.auth!.siteId;
        const { name, description, rootBlock } = req.body;

        const component = await prisma.component.create({
            data: {
                siteId,
                name,
                description,
                rootBlockJson: JSON.stringify(rootBlock),
            },
        });
        res.json({ ok: true, data: component });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});

// Delete component
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
