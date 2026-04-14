import type { Request, Response, Router } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../services/db";
import { signToken, verifySessionJwt } from "../middleware/auth";
import { resolveSessionSiteId } from "../services/sessionSite";

const InvitePreviewQuerySchema = z.object({
    token: z.string().min(8),
});

const InviteAcceptBodySchema = z.object({
    token: z.string().min(8),
});

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Registra rutas públicas de invitación a colaborar (`/invite/preview`, `/invite/accept`).
 *
 * @param r Router de `/api/auth`.
 */
export function registerSiteInvitePublicRoutes(r: Router): void {
    r.get("/invite/preview", async (req: Request, res: Response) => {
        const parsed = InvitePreviewQuerySchema.safeParse({ token: req.query.token });
        if (!parsed.success) {
            res.status(400).json({ ok: false, error: "Parámetro token inválido" });
            return;
        }
        const row = await prisma.siteInvitation.findUnique({
            where: { token: parsed.data.token },
            include: { site: { select: { id: true, name: true } } },
        });
        if (!row) {
            res.json({
                ok: true,
                data: {
                    status: "invalid" as const,
                    siteId: null,
                    siteName: null,
                    email: null,
                    expiresAt: null,
                },
            });
            return;
        }
        const now = new Date();
        if (row.status === "accepted") {
            res.json({
                ok: true,
                data: {
                    status: "accepted" as const,
                    siteId: row.siteId,
                    siteName: row.site.name,
                    email: row.email,
                    expiresAt: row.expiresAt?.toISOString() ?? null,
                },
            });
            return;
        }
        if (row.expiresAt && row.expiresAt <= now) {
            res.json({
                ok: true,
                data: {
                    status: "expired" as const,
                    siteId: row.siteId,
                    siteName: row.site.name,
                    email: row.email,
                    expiresAt: row.expiresAt.toISOString(),
                },
            });
            return;
        }
        res.json({
            ok: true,
            data: {
                status: "pending" as const,
                siteId: row.siteId,
                siteName: row.site.name,
                email: row.email,
                expiresAt: row.expiresAt?.toISOString() ?? null,
            },
        });
    });

    r.post("/invite/accept", async (req: Request, res: Response) => {
        const parsed = InviteAcceptBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ ok: false, error: parsed.error.flatten() });
            return;
        }
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ ok: false, error: "Se requiere Authorization: Bearer <token>" });
            return;
        }
        const session = verifySessionJwt(authHeader.slice(7));
        if (!session) {
            res.status(401).json({ ok: false, error: "Token inválido" });
            return;
        }
        const invite = await prisma.siteInvitation.findUnique({
            where: { token: parsed.data.token },
        });
        if (!invite) {
            res.status(404).json({ ok: false, error: "Invitación no encontrada" });
            return;
        }
        const now = new Date();
        if (invite.status !== "pending") {
            res.status(409).json({ ok: false, error: "Esta invitación ya no está pendiente" });
            return;
        }
        if (invite.expiresAt && invite.expiresAt <= now) {
            res.status(410).json({ ok: false, error: "La invitación ha caducado" });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            res.status(401).json({ ok: false, error: "Usuario no encontrado" });
            return;
        }
        if (user.email.trim().toLowerCase() !== invite.email.trim().toLowerCase()) {
            res.status(403).json({
                ok: false,
                error: `Debes iniciar sesión con el correo invitado (${invite.email}).`,
            });
            return;
        }
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { siteId: invite.siteId },
            }),
            prisma.siteInvitation.update({
                where: { id: invite.id },
                data: { status: "accepted" },
            }),
        ]);
        const siteId = await resolveSessionSiteId(user.id);
        const token = signToken({ userId: user.id, siteId, role: user.role });
        res.json({
            ok: true,
            data: {
                token,
                userId: user.id,
                siteId: siteId.length > 0 ? siteId : invite.siteId,
                role: user.role,
            },
        });
    });
}

/**
 * Genera un token opaco para enlaces de invitación.
 *
 * @returns Cadena URL-safe única con alta entropía.
 */
export function generateInviteToken(): string {
    return randomBytes(32).toString("base64url");
}

/**
 * Fecha de caducidad por defecto para nuevas invitaciones.
 *
 * @returns Fecha dentro de {@link INVITE_TTL_MS}.
 */
export function defaultInviteExpiresAt(): Date {
    return new Date(Date.now() + INVITE_TTL_MS);
}
