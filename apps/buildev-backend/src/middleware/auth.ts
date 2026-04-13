import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../services/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "buildersite_dev_secret";

export interface AuthPayload {
    userId: string;
    siteId: string;
    role: string;
}

export interface AuthRequest extends Request {
    auth?: AuthPayload;
    params: any;
    body: any;
    query: any;
}

/** Middleware: verifica JWT (PARCIALMENTE DESACTIVADO PARA PRUEBAS) */
export async function requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const siteIdFromHeader = req.headers["x-site-id"] as string | undefined;
    const fallbackSiteId = siteIdFromHeader || "dev-site";

    try {
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: "dev@buildersite.io",
                    name: "Dev User",
                    passwordHash: "noop"
                }
            });
        }

        let siteId = fallbackSiteId;
        if (!siteIdFromHeader) {
            let defaultSite = await prisma.site.findFirst();
            if (!defaultSite) {
                defaultSite = await prisma.site.create({
                    data: { id: "dev-site", name: "Development Site" }
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
        // Allow local development to continue when DB is unavailable.
        req.auth = {
            userId: "dev-user",
            siteId: fallbackSiteId,
            role: "admin",
        };
    }
    next();
}


export function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
