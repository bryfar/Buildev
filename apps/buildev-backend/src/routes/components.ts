import { Router, Response } from "express";
import { prisma } from "../services/db";
import { requireAuth, AuthRequest } from "../middleware/auth";

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
    } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Create component from block
componentsRouter.post("/", async (req: AuthRequest, res: Response) => {
    try {
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
    } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Delete component
componentsRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    try {
        const siteId = req.auth!.siteId;
        await prisma.component.delete({
            where: { id: req.params.id, siteId },
        });
        res.json({ ok: true });
    } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
