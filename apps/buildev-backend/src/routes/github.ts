import { Router, Request, Response } from "express";
import { z } from "zod";

export const githubRouter = Router();

// ─── POST /api/github/repos (modal legacy; usar Git integrado /api/git) ─────────
githubRouter.post("/repos", (_req: Request, res: Response) => {
    res.status(501).json({
        ok: false,
        error: "Crear repositorio desde este endpoint no está implementado. Usa la integración Git del panel o la API /api/git.",
    });
});

githubRouter.post("/push", (_req: Request, res: Response) => {
    res.status(501).json({
        ok: false,
        error: "Usa /api/git/push con el sitio vinculado en lugar de /api/github/push.",
    });
});

githubRouter.post("/pulls", (_req: Request, res: Response) => {
    res.status(501).json({
        ok: false,
        error: "Abrir PR desde este endpoint no está implementado. Usa /api/git/pull-requests.",
    });
});

// ─── GET /api/github/repos ────────────────────────────────────────────────────
githubRouter.get("/repos", async (req: Request, res: Response) => {
    const { token } = req.query; // For simplicity, in production use auth middleware
    if (!token) return res.status(401).json({ ok: false, error: "Missing GitHub token" });

    try {
        const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const repos = await response.json();
        res.json({ ok: true, data: repos });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: message });
    }
});

// ─── POST /api/github/sync ────────────────────────────────────────────────────
const SyncSchema = z.object({
    repo: z.string(), // "user/repo"
    path: z.string().default(".buildev/schema.json"),
    content: z.unknown(),
    token: z.string(),
    message: z.string().optional(),
});

githubRouter.post("/sync", async (req: Request, res: Response) => {
    const parsed = SyncSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });

    const { repo, path, content, token, message } = parsed.data;

    try {
        // 1. Get current file data (if exists) for SHA
        const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        
        let sha: string | undefined;
        if (fileRes.status === 200) {
            const fileData = (await fileRes.json()) as { sha?: string };
            sha = fileData.sha;
        }

        // 2. Update or Create file
        const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            body: JSON.stringify({
                message: message || "chore: sync from Buildev visual builder",
                content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
                sha,
            }),
        });

        const updateData = (await updateRes.json()) as { message?: string };
        if (!updateRes.ok) throw new Error(updateData.message ?? "Failed to push to GitHub");

        res.json({ ok: true, data: updateData });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error";
        res.status(500).json({ ok: false, error: message });
    }
});
