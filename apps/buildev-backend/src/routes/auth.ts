import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../services/db";
import { signToken } from "../middleware/auth";

export const authRouter = Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    siteName: z.string().min(2),
});

authRouter.post("/register", async (req: Request, res: Response) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const { name, email, password, siteName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ ok: false, error: "Email already registered" });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const site = await prisma.site.create({
        data: { name: siteName, defaultLocale: "es" },
    });
    const user = await prisma.user.create({
        data: { name, email, passwordHash, role: "admin", siteId: site.id },
    });

    const token = signToken({ userId: user.id, siteId: site.id, role: user.role });
    res.status(201).json({ ok: true, data: { token, siteId: site.id, userId: user.id } });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

authRouter.post("/login", async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ ok: false, error: "Invalid credentials" });
        return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ ok: false, error: "Invalid credentials" });
        return;
    }

    const token = signToken({ userId: user.id, siteId: user.siteId, role: user.role });
    res.json({
        ok: true,
        data: { token, siteId: user.siteId, userId: user.id, role: user.role },
    });
});
