import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../services/db";
import { assertSiteOwned } from "../services/buildevGitExport";

const JWT_SECRET = process.env.JWT_SECRET ?? "buildersite_dev_secret";

/** Si es `true` o `1`, se omite JWT y se usa un usuario/sitio de desarrollo (solo local). */
function isAuthDevBypass(): boolean {
    const v = (process.env.AUTH_DEV_BYPASS ?? "").trim().toLowerCase();
    return v === "true" || v === "1";
}

export interface AuthPayload {
    userId: string;
    siteId: string;
    role: string;
}

export interface AuthRequest extends Request {
    auth?: AuthPayload;
}

/**
 * Interpreta el payload JWT de sesión Buildev.
 *
 * @param value Objeto decodificado de `jwt.verify`.
 * @returns Payload o `null` si no es válido.
 */
export function parseAuthPayload(value: unknown): AuthPayload | null {
    if (value === null || typeof value !== "object") return null;
    const o = value as Record<string, unknown>;
    if (typeof o.userId !== "string" || o.userId.length === 0 || typeof o.role !== "string") {
        return null;
    }
    const siteId = typeof o.siteId === "string" ? o.siteId.trim() : "";
    return { userId: o.userId, siteId, role: o.role };
}

/**
 * Middleware: exige JWT válido y que el sitio activo (token o cabecera `x-site-id`) pertenezca al usuario.
 * Con `AUTH_DEV_BYPASS=true` replica el comportamiento antiguo para pruebas locales sin login.
 *
 * @param req Petición HTTP.
 * @param res Respuesta HTTP.
 * @param next Siguiente manejador.
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    if (isAuthDevBypass()) {
        await applyDevBypassAuth(req);
        next();
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ ok: false, error: "Se requiere Authorization: Bearer <token>" });
        return;
    }

    try {
        const raw = authHeader.slice(7);
        const verified = jwt.verify(raw, JWT_SECRET);
        const decoded = parseAuthPayload(verified);
        if (!decoded) {
            res.status(401).json({ ok: false, error: "Token inválido" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true },
        });
        if (!user) {
            res.status(401).json({ ok: false, error: "Usuario no encontrado" });
            return;
        }

        const headerSiteRaw = req.headers["x-site-id"];
        const headerSiteId =
            typeof headerSiteRaw === "string" && headerSiteRaw.trim().length > 0 ? headerSiteRaw.trim() : "";
        const candidateSiteId = headerSiteId.length > 0 ? headerSiteId : decoded.siteId;

        if (candidateSiteId.length === 0) {
            req.auth = {
                userId: decoded.userId,
                siteId: "",
                role: decoded.role,
            };
            next();
            return;
        }

        const siteOk = await assertSiteOwned(decoded.userId, candidateSiteId);
        if (!siteOk) {
            res.status(403).json({ ok: false, error: "No tienes acceso a este proyecto" });
            return;
        }

        req.auth = {
            userId: decoded.userId,
            siteId: candidateSiteId,
            role: decoded.role,
        };
        next();
    } catch {
        res.status(401).json({ ok: false, error: "Token inválido o caducado" });
    }
}

/**
 * Asigna `req.auth` con el primer usuario y un sitio por defecto (modo desarrollo).
 *
 * @param req Petición HTTP.
 */
async function applyDevBypassAuth(req: AuthRequest): Promise<void> {
    const siteIdFromHeader = req.headers["x-site-id"];
    const fallbackSiteIdHeader =
        typeof siteIdFromHeader === "string" && siteIdFromHeader.trim().length > 0
            ? siteIdFromHeader.trim()
            : "dev-site";

    try {
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: "dev@buildersite.io",
                    name: "Dev User",
                    passwordHash: "noop",
                },
            });
        }

        let siteId = fallbackSiteIdHeader;
        if (!siteIdFromHeader || String(siteIdFromHeader).trim() === "") {
            let defaultSite = await prisma.site.findFirst();
            if (!defaultSite) {
                defaultSite = await prisma.site.create({
                    data: { id: "dev-site", name: "Development Site", userId: user.id },
                });
            }
            siteId = defaultSite.id;
        }

        req.auth = {
            userId: user.id,
            siteId,
            role: "admin",
        };
    } catch {
        req.auth = {
            userId: "dev-user",
            siteId: fallbackSiteIdHeader,
            role: "admin",
        };
    }
}

/**
 * Firma un JWT de sesión Buildev.
 *
 * @param payload Identidad y sitio activo.
 * @returns Token JWT.
 */
export function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifica un JWT de sesión y devuelve el payload tipado.
 *
 * @param token JWT sin prefijo `Bearer`.
 * @returns Payload o `null` si el token es inválido.
 */
export function verifySessionJwt(token: string): AuthPayload | null {
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        return parseAuthPayload(verified);
    } catch {
        return null;
    }
}
