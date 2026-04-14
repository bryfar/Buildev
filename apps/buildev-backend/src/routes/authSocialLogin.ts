import type { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../services/db";
import { signToken } from "../middleware/auth";
import { githubLoginRedirectUri, googleLoginRedirectUri } from "../config/oauthEnv";
import { getGithubClientId, getGithubClientSecret, isGithubOAuthConfigured } from "../config/githubAppEnv";
import { oauthUserDbErrorResponse } from "../utils/oauthUserDbError";
import { resolveSessionSiteId } from "../services/sessionSite";

const JWT_SECRET = process.env.JWT_SECRET ?? "buildersite_dev_secret";
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET ?? "").trim();

const OAuthCodeSchema = z.object({
    code: z.string().min(1),
    state: z.string().min(1),
});

interface OAuthProfileInput {
    email: string;
    name: string;
    githubAccessToken?: string | null;
    githubUsername?: string | null;
}

/** Usuario OAuth por email o creación sin proyectos hasta que el usuario cree uno. */
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
        const siteId = await resolveSessionSiteId(existing.id);
        return { userId: existing.id, siteId, role: existing.role };
    }
    const user = await prisma.user.create({
        data: {
            email,
            name: input.name.trim() || email.split("@")[0] || "Usuario",
            role: "admin",
            githubAccessToken: input.githubAccessToken ?? null,
            githubUsername: input.githubUsername ?? null,
        },
    });
    return { userId: user.id, siteId: "", role: user.role };
}

/** Rutas públicas de login Google/GitHub bajo `/api/auth`. */
export function registerSocialLoginRoutes(r: Router): void {
    r.get("/oauth/login-ready", (_req: Request, res: Response) => {
        const github = isGithubOAuthConfigured();
        const google = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
        res.json({
            ok: true,
            data: {
                github,
                google,
                hints: {
                    github: github ? null : "Credenciales GitHub + URIs en la OAuth App; producción: GITHUB_LOGIN_REDIRECT_URI o PUBLIC_APP_URL.",
                    google: google ? null : "Credenciales Google + URI en Cloud Console; producción: GOOGLE_LOGIN_REDIRECT_URI o PUBLIC_APP_URL.",
                },
            },
        });
    });

    r.get("/login/github/url", (_req: Request, res: Response) => {
        if (!isGithubOAuthConfigured()) {
            res.status(503).json({ ok: false, error: "GitHub OAuth no está configurado." });
            return;
        }
        const state = jwt.sign({ purpose: "github_login" }, JWT_SECRET, { expiresIn: "15m" });
        const ghRedirect = githubLoginRedirectUri();
        const params = new URLSearchParams({
            client_id: getGithubClientId(),
            redirect_uri: ghRedirect,
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
        if (!isGithubOAuthConfigured()) {
            res.status(503).json({ ok: false, error: "GitHub OAuth no está configurado." });
            return;
        }
        try {
            const decoded = jwt.verify(parsed.data.state, JWT_SECRET) as { purpose?: string };
            if (decoded.purpose !== "github_login") {
                res.status(400).json({ ok: false, error: "Estado OAuth inválido." });
                return;
            }
            const ghRedirect = githubLoginRedirectUri();
            const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
                method: "POST",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: getGithubClientId(),
                    client_secret: getGithubClientSecret(),
                    code: parsed.data.code,
                    redirect_uri: ghRedirect,
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
            const emailsRaw: unknown = await emailsRes.json();
            if (!Array.isArray(emailsRaw)) {
                res.status(400).json({
                    ok: false,
                    error:
                        "GitHub no devolvió la lista de emails (revisa scope read:user user:email y que la cuenta tenga email público o verificado).",
                });
                return;
            }
            const emails = emailsRaw as Array<{ email: string; primary?: boolean; verified?: boolean }>;
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
            const { status, message } = oauthUserDbErrorResponse(err);
            res.status(status).json({ ok: false, error: message });
        }
    });

    r.get("/login/google/url", (_req: Request, res: Response) => {
        if (!GOOGLE_CLIENT_ID) {
            res.status(503).json({ ok: false, error: "Google OAuth no está configurado." });
            return;
        }
        const state = jwt.sign({ purpose: "google_login" }, JWT_SECRET, { expiresIn: "15m" });
        const googleRedirect = googleLoginRedirectUri();
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: googleRedirect,
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
            const googleRedirect = googleLoginRedirectUri();
            const body = new URLSearchParams({
                code: parsed.data.code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: googleRedirect,
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
            const { status, message } = oauthUserDbErrorResponse(err);
            res.status(status).json({ ok: false, error: message });
        }
    });
}
