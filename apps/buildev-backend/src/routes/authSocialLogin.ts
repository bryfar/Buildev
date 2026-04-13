import type { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../services/db";
import { signToken } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET ?? "buildersite_dev_secret";
const GITHUB_CLIENT_ID = (process.env.GITHUB_CLIENT_ID ?? "").trim();
const GITHUB_CLIENT_SECRET = (process.env.GITHUB_CLIENT_SECRET ?? "").trim();
/** Debe coincidir byte a byte con la URL en la GitHub OAuth App (autorización “login”). */
const GITHUB_LOGIN_REDIRECT_URI = (
    process.env.GITHUB_LOGIN_REDIRECT_URI ?? "http://localhost:5173/auth/github"
).trim();
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET ?? "").trim();
/** URI autorizada en Google Cloud Console → Credenciales → OAuth 2.0 Client ID. */
const GOOGLE_LOGIN_REDIRECT_URI = (
    process.env.GOOGLE_LOGIN_REDIRECT_URI ?? "http://localhost:5173/auth/google"
).trim();

const OAuthCodeSchema = z.object({
    code: z.string().min(1),
    state: z.string().min(1),
});

/**
 * Crea un sitio por defecto y lo asocia al usuario si carece de `siteId`.
 *
 * @param userId ID de usuario
 * @returns ID del sitio activo
 */
async function ensureUserHasSite(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.siteId) return user.siteId;
    const site = await prisma.site.create({
        data: { name: "Mi workspace", defaultLocale: "es" },
    });
    await prisma.user.update({ where: { id: userId }, data: { siteId: site.id } });
    return site.id;
}

interface OAuthProfileInput {
    email: string;
    name: string;
    githubAccessToken?: string | null;
    githubUsername?: string | null;
}

/**
 * Busca usuario por email o crea uno con sitio por defecto (OAuth).
 *
 * @param input Email, nombre y datos opcionales de GitHub
 * @returns IDs y rol para emitir JWT
 */
async function findOrCreateOAuthUser(input: OAuthProfileInput): Promise<{ userId: string; siteId: string; role: string }> {
    const email = input.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: {
                name: input.name.trim() || existing.name,
                ...(input.githubAccessToken != null
                    ? {
                          githubAccessToken: input.githubAccessToken,
                          githubUsername: input.githubUsername ?? null,
                      }
                    : {}),
            },
        });
        const siteId = await ensureUserHasSite(existing.id);
        return { userId: existing.id, siteId, role: existing.role };
    }
    const site = await prisma.site.create({
        data: { name: `${input.name.trim() || "Mi"} workspace`, defaultLocale: "es" },
    });
    const user = await prisma.user.create({
        data: {
            email,
            name: input.name.trim() || email.split("@")[0] || "Usuario",
            passwordHash: null,
            role: "admin",
            siteId: site.id,
            githubAccessToken: input.githubAccessToken ?? null,
            githubUsername: input.githubUsername ?? null,
        },
    });
    return { userId: user.id, siteId: site.id, role: user.role };
}

/**
 * Registra rutas públicas de inicio de sesión con Google/GitHub.
 *
 * @param r Router `/api/auth`
 */
export function registerSocialLoginRoutes(r: Router): void {
    r.get("/oauth/login-ready", (_req: Request, res: Response) => {
        const github = Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);
        const google = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
        res.json({
            ok: true,
            data: {
                github,
                google,
                hints: {
                    github: github
                        ? null
                        : "En el backend (.env): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET y en la GitHub OAuth App las URIs de callback (vincular + login).",
                    google: google
                        ? null
                        : "En el backend (.env): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y en Google Cloud la URI autorizada GOOGLE_LOGIN_REDIRECT_URI.",
                },
            },
        });
    });

    r.get("/login/github/url", (_req: Request, res: Response) => {
        if (!GITHUB_CLIENT_ID) {
            res.status(503).json({ ok: false, error: "GitHub OAuth no está configurado." });
            return;
        }
        const state = jwt.sign({ purpose: "github_login" }, JWT_SECRET, { expiresIn: "15m" });
        const params = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
            redirect_uri: GITHUB_LOGIN_REDIRECT_URI,
            scope: "read:user user:email",
            state,
            allow_signup: "true",
        });
        res.json({ ok: true, data: { url: `https://github.com/login/oauth/authorize?${params.toString()}` } });
    });

    r.post("/login/github", async (req: Request, res: Response) => {
        const parsed = OAuthCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ ok: false, error: parsed.error.flatten() });
            return;
        }
        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
            res.status(503).json({ ok: false, error: "GitHub OAuth no está configurado." });
            return;
        }
        try {
            const decoded = jwt.verify(parsed.data.state, JWT_SECRET) as { purpose?: string };
            if (decoded.purpose !== "github_login") {
                res.status(400).json({ ok: false, error: "Estado OAuth inválido." });
                return;
            }
            const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
                method: "POST",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: GITHUB_CLIENT_ID,
                    client_secret: GITHUB_CLIENT_SECRET,
                    code: parsed.data.code,
                    redirect_uri: GITHUB_LOGIN_REDIRECT_URI,
                }),
            });
            const tokenJson = (await tokenRes.json()) as {
                access_token?: string;
                error?: string;
                error_description?: string;
            };
            if (!tokenJson.access_token) {
                res.status(400).json({
                    ok: false,
                    error: tokenJson.error_description ?? tokenJson.error ?? "GitHub no devolvió token.",
                });
                return;
            }
            const access = tokenJson.access_token;
            const [userRes, emailsRes] = await Promise.all([
                fetch("https://api.github.com/user", {
                    headers: {
                        Authorization: `Bearer ${access}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                }),
                fetch("https://api.github.com/user/emails", {
                    headers: {
                        Authorization: `Bearer ${access}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                }),
            ]);
            const ghUser = (await userRes.json()) as { login?: string; name?: string | null };
            const emails = (await emailsRes.json()) as Array<{ email: string; primary?: boolean; verified?: boolean }>;
            const primary =
                emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified) ?? emails[0];
            if (!primary?.email) {
                res.status(400).json({ ok: false, error: "GitHub no devolvió un email verificado." });
                return;
            }
            const { userId, siteId, role } = await findOrCreateOAuthUser({
                email: primary.email,
                name: ghUser.name ?? ghUser.login ?? primary.email.split("@")[0] ?? "Usuario",
                githubAccessToken: access,
                githubUsername: ghUser.login ?? null,
            });
            const token = signToken({ userId, siteId, role });
            res.json({ ok: true, data: { token, userId, siteId, role } });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "OAuth fallido";
            res.status(400).json({ ok: false, error: msg });
        }
    });

    r.get("/login/google/url", (_req: Request, res: Response) => {
        if (!GOOGLE_CLIENT_ID) {
            res.status(503).json({ ok: false, error: "Google OAuth no está configurado." });
            return;
        }
        const state = jwt.sign({ purpose: "google_login" }, JWT_SECRET, { expiresIn: "15m" });
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile",
            state,
        });
        res.json({
            ok: true,
            data: { url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` },
        });
    });

    r.post("/login/google", async (req: Request, res: Response) => {
        const parsed = OAuthCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ ok: false, error: parsed.error.flatten() });
            return;
        }
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            res.status(503).json({ ok: false, error: "Google OAuth no está configurado." });
            return;
        }
        try {
            const decoded = jwt.verify(parsed.data.state, JWT_SECRET) as { purpose?: string };
            if (decoded.purpose !== "google_login") {
                res.status(400).json({ ok: false, error: "Estado OAuth inválido." });
                return;
            }
            const body = new URLSearchParams({
                code: parsed.data.code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
                grant_type: "authorization_code",
            });
            const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString(),
            });
            const tokenJson = (await tokenRes.json()) as {
                access_token?: string;
                error?: string;
                error_description?: string;
            };
            if (!tokenJson.access_token) {
                res.status(400).json({
                    ok: false,
                    error: tokenJson.error_description ?? tokenJson.error ?? "Google no devolvió token.",
                });
                return;
            }
            const ui = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenJson.access_token}` },
            });
            const profile = (await ui.json()) as {
                email?: string;
                name?: string;
                sub?: string;
                email_verified?: boolean;
            };
            const email = typeof profile.email === "string" ? profile.email : "";
            if (!email) {
                res.status(400).json({ ok: false, error: "Google no devolvió email." });
                return;
            }
            if (profile.email_verified === false) {
                res.status(400).json({ ok: false, error: "El email de Google no está verificado." });
                return;
            }
            const { userId, siteId, role } = await findOrCreateOAuthUser({
                email,
                name: profile.name ?? email.split("@")[0] ?? "Usuario",
            });
            const token = signToken({ userId, siteId, role });
            res.json({ ok: true, data: { token, userId, siteId, role } });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "OAuth fallido";
            res.status(400).json({ ok: false, error: msg });
        }
    });
}
