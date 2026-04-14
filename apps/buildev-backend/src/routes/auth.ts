import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../services/db";
import { signToken, verifySessionJwt } from "../middleware/auth";
import { githubLoginRedirectUri, githubRepoLinkRedirectUri } from "../config/oauthEnv";
import {
    getGithubClientId,
    getGithubClientSecret,
    isGithubOAuthConfigured,
} from "../config/githubAppEnv";
import { registerSocialLoginRoutes } from "./authSocialLogin";
import { resolveSessionSiteId } from "../services/sessionSite";

const JWT_SECRET = process.env.JWT_SECRET ?? "buildersite_dev_secret";

export const authRouter = Router();

/** Login social (Google/GitHub): rutas públicas bajo `/api/auth`. */
registerSocialLoginRoutes(authRouter);

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
    const user = await prisma.user.create({
        data: { name, email, passwordHash, role: "admin" },
    });
    const site = await prisma.site.create({
        data: { name: siteName, defaultLocale: "es", userId: user.id },
    });
    await prisma.user.update({
        where: { id: user.id },
        data: { siteId: site.id },
    });

    const token = signToken({ userId: user.id, siteId: site.id, role: user.role });
    res.status(201).json({
        ok: true,
        data: { token, siteId: site.id, userId: user.id, role: user.role },
    });
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
    if (!user.passwordHash) {
        res.status(401).json({
            ok: false,
            error: "Esta cuenta usa Google o GitHub. Inicia sesión con el proveedor correspondiente.",
        });
        return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ ok: false, error: "Invalid credentials" });
        return;
    }

    const siteId = await resolveSessionSiteId(user.id);
    const token = signToken({ userId: user.id, siteId, role: user.role });
    res.json({
        ok: true,
        data: { token, siteId, userId: user.id, role: user.role },
    });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
authRouter.get("/me", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ ok: false, error: "Authorization required" });
        return;
    }
    try {
        const raw = authHeader.slice(7);
        const payload = verifySessionJwt(raw);
        if (!payload) {
            res.status(401).json({ ok: false, error: "Invalid token" });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                githubAccessToken: true,
                githubUsername: true,
            },
        });
        if (!user) {
            res.status(404).json({ ok: false, error: "User not found" });
            return;
        }
        res.json({
            ok: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                githubLinked: Boolean(user.githubAccessToken),
                githubUsername: user.githubUsername,
            },
        });
    } catch {
        res.status(401).json({ ok: false, error: "Invalid token" });
    }
});

// ─── GET /api/auth/github/oauth-ready (público: solo indica si el servidor puede OAuth) ─
authRouter.get("/github/oauth-ready", (_req: Request, res: Response) => {
    const rawId = getGithubClientId();
    const rawSecret = getGithubClientSecret();
    const ready = isGithubOAuthConfigured();
    let hint: string | null = null;
    if (!ready) {
        if (!rawId && !rawSecret) {
            hint = "Faltan GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET en apps/buildev-backend/.env (o variables del host). Reinicia el API tras guardar.";
        } else if (!rawId) {
            hint = "Falta GITHUB_CLIENT_ID.";
        } else if (!rawSecret) {
            hint = "Falta GITHUB_CLIENT_SECRET.";
        } else {
            hint =
                "GITHUB_CLIENT_ID o GITHUB_CLIENT_SECRET parecen valores de plantilla; sustitúyelos por los de tu OAuth App en GitHub (Developer Settings → OAuth Apps).";
        }
    }
    res.json({
        ok: true,
        data: {
            ready,
            hint,
            linkCallbackUrl: githubRepoLinkRedirectUri(),
            loginCallbackUrl: githubLoginRedirectUri(),
        },
    });
});

// ─── GET /api/auth/github/authorize-url ───────────────────────────────────────
authRouter.get("/github/authorize-url", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ ok: false, error: "Authorization required" });
        return;
    }
    if (!isGithubOAuthConfigured()) {
        res.status(503).json({ ok: false, error: "GitHub OAuth no está configurado (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)." });
        return;
    }
    try {
        const raw = authHeader.slice(7);
        const payload = verifySessionJwt(raw);
        if (!payload) {
            res.status(401).json({ ok: false, error: "Invalid token" });
            return;
        }
        const state = jwt.sign(
            { userId: payload.userId, purpose: "github_oauth" },
            JWT_SECRET,
            { expiresIn: "15m" },
        );
        const params = new URLSearchParams({
            client_id: getGithubClientId(),
            redirect_uri: githubRepoLinkRedirectUri(),
            scope: "repo",
            state,
        });
        const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
        res.json({ ok: true, data: { url } });
    } catch {
        res.status(401).json({ ok: false, error: "Invalid token" });
    }
});

const GithubOAuthCallbackSchema = z.object({
    code: z.string().min(1),
    state: z.string().min(1),
});

// ─── POST /api/auth/github/callback ───────────────────────────────────────────
authRouter.post("/github/callback", async (req: Request, res: Response) => {
    const parsed = GithubOAuthCallbackSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    if (!isGithubOAuthConfigured()) {
        res.status(503).json({ ok: false, error: "GitHub OAuth no está configurado." });
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
            ok: false,
            error:
                "Se requiere sesión Buildev (inicia sesión y vuelve a pulsar «Vincular GitHub»). Tras autorizar en GitHub, esta pestaña debe tener tu sesión activa.",
        });
        return;
    }
    try {
        const session = verifySessionJwt(authHeader.slice(7));
        if (!session) {
            res.status(401).json({ ok: false, error: "Token inválido." });
            return;
        }
        const decoded = jwt.verify(parsed.data.state, JWT_SECRET) as { userId: string; purpose?: string };
        if (decoded.purpose !== "github_oauth" || !decoded.userId) {
            res.status(400).json({ ok: false, error: "Estado OAuth inválido." });
            return;
        }
        if (session.userId !== decoded.userId) {
            res.status(403).json({
                ok: false,
                error:
                    "La sesión activa no coincide con la cuenta que inició la vinculación. Cierra sesión e inicia con la cuenta correcta.",
            });
            return;
        }
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: getGithubClientId(),
                client_secret: getGithubClientSecret(),
                code: parsed.data.code,
                redirect_uri: githubRepoLinkRedirectUri(),
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
                error: tokenJson.error_description ?? tokenJson.error ?? "GitHub no devolvió access_token.",
            });
            return;
        }
        const userRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokenJson.access_token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });
        const ghUser = (await userRes.json()) as { login?: string };
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                githubAccessToken: tokenJson.access_token,
                githubUsername: ghUser.login ?? null,
            },
        });
        res.json({
            ok: true,
            data: {
                githubLinked: true,
                githubUsername: ghUser.login ?? null,
            },
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "OAuth fallido";
        res.status(400).json({ ok: false, error: msg });
    }
});
