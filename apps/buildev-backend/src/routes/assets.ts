import { Router, Response } from "express";
import { prisma } from "../services/db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requireNonEmptySiteId } from "../middleware/activeSite";

export const assetsRouter = Router();

assetsRouter.use(requireAuth as any);

// List assets
assetsRouter.get("/", async (req: AuthRequest, res: Response) => {
    try {
        const siteId = req.auth!.siteId;
        const assets = await prisma.asset.findMany({
            where: { siteId },
            orderBy: { createdAt: "desc" },
        });
        res.json({ ok: true, data: assets });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});

// Upload asset (Simplified)
assetsRouter.post("/", async (req: AuthRequest, res: Response) => {
    try {
        if (!requireNonEmptySiteId(req, res)) return;
        const siteId = req.auth!.siteId;
        const { name, url, mimeType, sizeBytes } = req.body;

        const asset = await prisma.asset.create({
            data: {
                siteId,
                name,
                url,
                mimeType,
                sizeBytes: sizeBytes || 0,
            },
        });
        res.json({ ok: true, data: asset });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: msg });
    }
});
