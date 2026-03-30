import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../services/db";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const sitesRouter = Router();

sitesRouter.use(requireAuth as any);

// ─── GET /api/sites ───────────────────────────────────────────────────────────
sitesRouter.get("/", async (req: AuthRequest, res: Response) => {
    const sites = await prisma.site.findMany({
        where: { userId: req.auth!.userId },
        orderBy: { updatedAt: "desc" },
    });
    res.json({ ok: true, data: sites });
});

// ─── POST /api/sites ──────────────────────────────────────────────────────────
const CreateSiteSchema = z.object({
    name: z.string().min(1),
    subdomain: z.string().optional(),
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

    const site = await prisma.site.create({
        data: {
            ...parsed.data,
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
