"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
exports.githubRouter = (0, express_1.Router)();
// ─── GET /api/github/repos ────────────────────────────────────────────────────
exports.githubRouter.get("/repos", async (req, res) => {
    const { token } = req.query; // For simplicity, in production use auth middleware
    if (!token)
        return res.status(401).json({ ok: false, error: "Missing GitHub token" });
    try {
        const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const repos = await response.json();
        res.json({ ok: true, data: repos });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
// ─── POST /api/github/sync ────────────────────────────────────────────────────
const SyncSchema = zod_1.z.object({
    repo: zod_1.z.string(), // "user/repo"
    path: zod_1.z.string().default(".buildev/schema.json"),
    content: zod_1.z.any(),
    token: zod_1.z.string(),
    message: zod_1.z.string().optional(),
});
exports.githubRouter.post("/sync", async (req, res) => {
    const parsed = SyncSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ ok: false, error: parsed.error.flatten() });
    const { repo, path, content, token, message } = parsed.data;
    try {
        // 1. Get current file data (if exists) for SHA
        const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        let sha;
        if (fileRes.status === 200) {
            const fileData = await fileRes.json();
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
        const updateData = await updateRes.json();
        if (!updateRes.ok)
            throw new Error(updateData.message || "Failed to push to GitHub");
        res.json({ ok: true, data: updateData });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
