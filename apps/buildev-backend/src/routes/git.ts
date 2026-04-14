import { Router, Response } from "express";
import { z } from "zod";
import { requireAuthHandler, AuthRequest } from "../middleware/auth";
import {
    githubGetFile,
    githubPutFile,
    githubListBranches,
    githubGetBranchHeadSha,
    githubCreateBranch,
    githubCreatePullRequest,
    githubGetJsonText,
} from "../services/gitGithubApi";
import {
    DEFAULT_EXPORT_PATH,
    GitLinkSchema,
    BuildevExportSchema,
    assertSiteOwned,
    readVariableJson,
    writeVariableJson,
    applyBuildevExport,
    buildExportPayload,
    type BuildevExport,
} from "../services/buildevGitExport";
import {
    PACKAGE_JSON_CANDIDATE_PATHS,
    PROJECT_SETTINGS_VARIABLE_KEY,
    defaultProjectSettings,
    inferProjectSettingsFromPackageJson,
    mergeProjectSettingsLayered,
    type BuildevProjectSettingsStored,
} from "../services/buildevProjectSettings";
import { prisma } from "../services/db";

export const gitRouter = Router();

gitRouter.use(requireAuthHandler);

const ImportBodySchema = z.object({
    siteId: z.string().min(1),
    repoFullName: z.string().regex(/^[^/]+\/[^/]+$/),
    branch: z.string().min(1).default("main"),
    exportPath: z.string().min(1).default(DEFAULT_EXPORT_PATH),
    linkAfterImport: z.boolean().optional(),
});

const LinkBodySchema = z.object({
    siteId: z.string().min(1),
    repoFullName: z.string().regex(/^[^/]+\/[^/]+$/),
    branch: z.string().min(1).default("main"),
    exportPath: z.string().min(1).default(DEFAULT_EXPORT_PATH),
});

const StatusQuerySchema = z.object({
    siteId: z.string().min(1),
});

const PullBodySchema = z.object({
    siteId: z.string().min(1),
});

const PushBodySchema = z.object({
    siteId: z.string().min(1),
    message: z.string().min(1),
});

const BranchesQuerySchema = z.object({
    siteId: z.string().min(1),
});

const CreateBranchBodySchema = z.object({
    siteId: z.string().min(1),
    name: z.string().min(1),
    fromBranch: z.string().min(1).default("main"),
});

const CreatePrBodySchema = z.object({
    siteId: z.string().min(1),
    title: z.string().min(1),
    body: z.string().default(""),
    head: z.string().min(1),
    base: z.string().min(1).default("main"),
});

const HistoryQuerySchema = z.object({
    siteId: z.string().min(1),
    limit: z.coerce.number().min(1).max(100).default(30),
});

const RestoreBodySchema = z.object({
    siteId: z.string().min(1),
    activityId: z.string().min(1),
});

const GIT_AUTH_ERROR =
    "Vincula tu cuenta de GitHub con Buildev o envía la cabecera x-github-token (opcional, avanzado).";

/**
 * Resolves GitHub token: header `x-github-token` overrides; otherwise uses OAuth token stored on the user.
 */
async function resolveGithubToken(req: AuthRequest): Promise<string | null> {
    const header = req.headers["x-github-token"];
    if (typeof header === "string" && header.trim().length > 0) {
        return header.trim();
    }
    const userId = req.auth?.userId;
    if (!userId) {
        return null;
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { githubAccessToken: true },
        });
        return user?.githubAccessToken ?? null;
    } catch {
        return null;
    }
}

/**
 * Combines optional `project` del JSON export con inferencia desde package.json del repo.
 */
async function resolveAndPersistProjectSettingsFromGit(
    siteId: string,
    exportProject: BuildevExport["project"],
    repoFullName: string,
    branch: string,
    token: string,
): Promise<BuildevProjectSettingsStored> {
    let inferred = defaultProjectSettings();
    for (const path of PACKAGE_JSON_CANDIDATE_PATHS) {
        const file = await githubGetFile(repoFullName, path, branch, token);
        if (!file) continue;
        try {
            const pkg = JSON.parse(file.rawJson) as unknown;
            inferred = inferProjectSettingsFromPackageJson(pkg);
            break;
        } catch {
            continue;
        }
    }
    const merged = mergeProjectSettingsLayered(inferred, exportProject);
    await writeVariableJson(
        siteId,
        PROJECT_SETTINGS_VARIABLE_KEY,
        merged,
        "Buildev stack y configuración del proyecto",
    );
    return merged;
}

async function appendActivityFallback(siteId: string, entry: unknown): Promise<void> {
    const key = "git_activity_log";
    const existing = await readVariableJson(siteId, key);
    const arr = Array.isArray(existing) ? existing : [];
    const next = [entry, ...arr].slice(0, 200);
    await writeVariableJson(siteId, key, next, "Git activity log (fallback)");
}

async function recordActivity(siteId: string, entry: {
    type: string;
    status: "success" | "failed" | "pending";
    actor?: string;
    branch?: string;
    baseBranch?: string;
    commitSha?: string;
    prNumber?: number;
    diffSummary?: unknown;
    snapshot?: unknown;
}): Promise<void> {
    const row = {
        ...entry,
        createdAt: new Date().toISOString(),
    };
    try {
        const maybeDelegate = (prisma as unknown as Record<string, unknown>)["gitActivity"];
        if (
            typeof maybeDelegate === "object" &&
            maybeDelegate !== null &&
            "create" in maybeDelegate &&
            typeof (maybeDelegate as { create?: unknown }).create === "function"
        ) {
            const delegate = maybeDelegate as {
                create: (args: {
                    data: {
                        siteId: string;
                        type: string;
                        status: string;
                        actor: string | undefined;
                        branch: string | undefined;
                        baseBranch: string | undefined;
                        commitSha: string | undefined;
                        prNumber: number | undefined;
                        diffSummaryJson: string | null;
                        snapshotJson: string | null;
                    };
                }) => Promise<unknown>;
            };
            await delegate.create({
                data: {
                    siteId,
                    type: entry.type,
                    status: entry.status,
                    actor: entry.actor,
                    branch: entry.branch,
                    baseBranch: entry.baseBranch,
                    commitSha: entry.commitSha,
                    prNumber: entry.prNumber,
                    diffSummaryJson: entry.diffSummary ? JSON.stringify(entry.diffSummary) : null,
                    snapshotJson: entry.snapshot ? JSON.stringify(entry.snapshot) : null,
                },
            });
            return;
        }
    } catch {
        await appendActivityFallback(siteId, row);
    }
}

async function readHistory(siteId: string, limit: number): Promise<unknown[]> {
    try {
        const maybeDelegate = (prisma as unknown as Record<string, unknown>)["gitActivity"];
        if (
            typeof maybeDelegate === "object" &&
            maybeDelegate !== null &&
            "findMany" in maybeDelegate &&
            typeof (maybeDelegate as { findMany?: unknown }).findMany === "function"
        ) {
            const delegate = maybeDelegate as {
                findMany: (args: unknown) => Promise<Array<{
                    id: string;
                    type: string;
                    status: string;
                    actor: string | null;
                    branch: string | null;
                    baseBranch: string | null;
                    commitSha: string | null;
                    prNumber: number | null;
                    diffSummaryJson: string | null;
                    createdAt: Date;
                }>>;
            };
            const rows = await delegate.findMany({
                where: { siteId },
                orderBy: { createdAt: "desc" },
                take: limit,
            });
            return rows.map((r) => ({
                id: r.id,
                type: r.type,
                status: r.status,
                actor: r.actor ?? undefined,
                branch: r.branch ?? undefined,
                baseBranch: r.baseBranch ?? undefined,
                commitSha: r.commitSha ?? undefined,
                prNumber: r.prNumber ?? undefined,
                diffSummary: r.diffSummaryJson ? (JSON.parse(r.diffSummaryJson) as unknown) : null,
                createdAt: r.createdAt.toISOString(),
            }));
        }
    } catch {
        const existing = await readVariableJson(siteId, "git_activity_log");
        const arr = Array.isArray(existing) ? existing : [];
        return arr.slice(0, limit);
    }
    const existing = await readVariableJson(siteId, "git_activity_log");
    const arr = Array.isArray(existing) ? existing : [];
    return arr.slice(0, limit);
}

gitRouter.post("/import", async (req: AuthRequest, res: Response) => {
    const parsed = ImportBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }

    const githubToken = await resolveGithubToken(req);
    if (!githubToken) {
        res.status(401).json({ ok: false, error: GIT_AUTH_ERROR });
        return;
    }

    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }

    try {
        const remote = await githubGetFile(
            parsed.data.repoFullName,
            parsed.data.exportPath,
            parsed.data.branch,
            githubToken,
        );
        if (!remote) {
            res.status(404).json({
                ok: false,
                error: "Export file not found in repository. Add .buildev/buildev-site.json or adjust path.",
            });
            return;
        }

        const jsonParsed = JSON.parse(remote.rawJson) as unknown;
        const exportData = BuildevExportSchema.safeParse(jsonParsed);
        if (!exportData.success) {
            res.status(400).json({ ok: false, error: exportData.error.flatten() });
            return;
        }

        const counts = await applyBuildevExport(parsed.data.siteId, exportData.data);
        const projectSettings = await resolveAndPersistProjectSettingsFromGit(
            parsed.data.siteId,
            exportData.data.project,
            parsed.data.repoFullName,
            parsed.data.branch,
            githubToken,
        );
        await writeVariableJson(parsed.data.siteId, "git_last_remote_sha", remote.sha, "Last seen SHA of export file on GitHub");

        if (parsed.data.linkAfterImport) {
            const link = GitLinkSchema.parse({
                repoFullName: parsed.data.repoFullName,
                branch: parsed.data.branch,
                exportPath: parsed.data.exportPath,
            });
            await writeVariableJson(parsed.data.siteId, "git_link", link, "Linked GitHub repository");
        }

        await recordActivity(parsed.data.siteId, {
            type: "import",
            status: "success",
            actor: req.auth?.userId,
            branch: parsed.data.branch,
            diffSummary: counts,
            snapshot: exportData.data,
        });

        res.json({
            ok: true,
            data: {
                ...counts,
                remoteSha: remote.sha,
                linked: Boolean(parsed.data.linkAfterImport),
                projectSettings,
            },
        });
    } catch (err: unknown) {
        await recordActivity(parsed.data.siteId, {
            type: "import",
            status: "failed",
            actor: req.auth?.userId,
            branch: parsed.data.branch,
        });
        const message = err instanceof Error ? err.message : "Import failed";
        res.status(500).json({ ok: false, error: message });
    }
});

gitRouter.post("/link", async (req: AuthRequest, res: Response) => {
    const parsed = LinkBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }

    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }

    const link = GitLinkSchema.parse({
        repoFullName: parsed.data.repoFullName,
        branch: parsed.data.branch,
        exportPath: parsed.data.exportPath,
    });

    await writeVariableJson(parsed.data.siteId, "git_link", link, "Linked GitHub repository");
    res.json({ ok: true, data: link });
});

gitRouter.get("/status", async (req: AuthRequest, res: Response) => {
    const parsed = StatusQuerySchema.safeParse({
        siteId: req.query.siteId,
    });
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }

    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }

    const linkData = await readVariableJson(parsed.data.siteId, "git_link");
    const lastKnownShaRaw = await readVariableJson(parsed.data.siteId, "git_last_remote_sha");

    if (!linkData) {
        res.json({
            ok: true,
            data: { linked: false as const, inSync: null as boolean | null, remoteSha: null as string | null, lastKnownSha: null as string | null },
        });
        return;
    }

    const githubToken = await resolveGithubToken(req);
    if (!githubToken) {
        res.status(401).json({ ok: false, error: GIT_AUTH_ERROR });
        return;
    }

    let link: z.infer<typeof GitLinkSchema>;
    try {
        link = GitLinkSchema.parse(linkData);
    } catch {
        res.status(500).json({ ok: false, error: "Invalid git_link in database" });
        return;
    }

    const lastKnownSha = typeof lastKnownShaRaw === "string" ? lastKnownShaRaw : null;

    try {
        const remote = await githubGetFile(link.repoFullName, link.exportPath, link.branch, githubToken);
        const remoteSha = remote?.sha ?? null;
        const inSync = remoteSha !== null && lastKnownSha !== null ? remoteSha === lastKnownSha : null;

        res.json({
            ok: true,
            data: {
                linked: true as const,
                repoFullName: link.repoFullName,
                branch: link.branch,
                exportPath: link.exportPath,
                remoteSha,
                lastKnownSha,
                inSync,
                remoteMissing: remote === null,
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Status check failed";
        res.status(500).json({ ok: false, error: message });
    }
});

gitRouter.post("/pull", async (req: AuthRequest, res: Response) => {
    const parsed = PullBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }

    const githubToken = await resolveGithubToken(req);
    if (!githubToken) {
        res.status(401).json({ ok: false, error: GIT_AUTH_ERROR });
        return;
    }

    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }

    const linkData = await readVariableJson(parsed.data.siteId, "git_link");
    if (!linkData) {
        res.status(400).json({ ok: false, error: "No git link configured. Use POST /api/git/link or import with linkAfterImport." });
        return;
    }

    let link: z.infer<typeof GitLinkSchema>;
    try {
        link = GitLinkSchema.parse(linkData);
    } catch {
        res.status(500).json({ ok: false, error: "Invalid git_link" });
        return;
    }

    try {
        const remote = await githubGetFile(link.repoFullName, link.exportPath, link.branch, githubToken);
        if (!remote) {
            res.status(404).json({ ok: false, error: "Export file missing on remote" });
            return;
        }

        const jsonParsed = JSON.parse(remote.rawJson) as unknown;
        const exportData = BuildevExportSchema.safeParse(jsonParsed);
        if (!exportData.success) {
            res.status(400).json({ ok: false, error: exportData.error.flatten() });
            return;
        }

        const counts = await applyBuildevExport(parsed.data.siteId, exportData.data);
        const projectSettings = await resolveAndPersistProjectSettingsFromGit(
            parsed.data.siteId,
            exportData.data.project,
            link.repoFullName,
            link.branch,
            githubToken,
        );
        await writeVariableJson(parsed.data.siteId, "git_last_remote_sha", remote.sha, "Last seen SHA of export file on GitHub");

        await recordActivity(parsed.data.siteId, {
            type: "pull",
            status: "success",
            actor: req.auth?.userId,
            branch: link.branch,
            diffSummary: counts,
            snapshot: exportData.data,
        });

        res.json({ ok: true, data: { ...counts, remoteSha: remote.sha, projectSettings } });
    } catch (err: unknown) {
        await recordActivity(parsed.data.siteId, {
            type: "pull",
            status: "failed",
            actor: req.auth?.userId,
        });
        const message = err instanceof Error ? err.message : "Pull failed";
        res.status(500).json({ ok: false, error: message });
    }
});

gitRouter.post("/push", async (req: AuthRequest, res: Response) => {
    const parsed = PushBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }

    const githubToken = await resolveGithubToken(req);
    if (!githubToken) {
        res.status(401).json({ ok: false, error: GIT_AUTH_ERROR });
        return;
    }

    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }

    const linkDataPush = await readVariableJson(parsed.data.siteId, "git_link");
    if (!linkDataPush) {
        res.status(400).json({ ok: false, error: "No git link configured" });
        return;
    }

    let link: z.infer<typeof GitLinkSchema>;
    try {
        link = GitLinkSchema.parse(linkDataPush);
    } catch {
        res.status(500).json({ ok: false, error: "Invalid git_link" });
        return;
    }

    try {
        const payload = await buildExportPayload(parsed.data.siteId);
        const existing = await githubGetFile(link.repoFullName, link.exportPath, link.branch, githubToken);
        const result = await githubPutFile(
            link.repoFullName,
            link.exportPath,
            parsed.data.message,
            payload,
            githubToken,
            link.branch,
            existing?.sha,
        );
        await writeVariableJson(parsed.data.siteId, "git_last_remote_sha", result.sha, "Last seen SHA of export file on GitHub");

        await recordActivity(parsed.data.siteId, {
            type: "push",
            status: "success",
            actor: req.auth?.userId,
            branch: link.branch,
            commitSha: result.sha,
            snapshot: payload,
        });

        res.json({ ok: true, data: { commitSha: result.sha } });
    } catch (err: unknown) {
        await recordActivity(parsed.data.siteId, {
            type: "push",
            status: "failed",
            actor: req.auth?.userId,
        });
        const message = err instanceof Error ? err.message : "Push failed";
        res.status(500).json({ ok: false, error: message });
    }
});

gitRouter.get("/branches", async (req: AuthRequest, res: Response) => {
    const parsed = BranchesQuerySchema.safeParse({ siteId: req.query.siteId });
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const githubToken = await resolveGithubToken(req);
    if (!githubToken) {
        res.status(401).json({ ok: false, error: GIT_AUTH_ERROR });
        return;
    }
    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }
    const linkData = await readVariableJson(parsed.data.siteId, "git_link");
    if (!linkData) {
        res.status(400).json({ ok: false, error: "No git link configured" });
        return;
    }
    const link = GitLinkSchema.parse(linkData);
    try {
        const branches = await githubListBranches(link.repoFullName, githubToken);
        res.json({ ok: true, data: branches.map((b) => b.name) });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Branches failed";
        res.status(500).json({ ok: false, error: message });
    }
});

gitRouter.post("/branches", async (req: AuthRequest, res: Response) => {
    const parsed = CreateBranchBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const githubToken = await resolveGithubToken(req);
    if (!githubToken) {
        res.status(401).json({ ok: false, error: GIT_AUTH_ERROR });
        return;
    }
    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }
    const linkData = await readVariableJson(parsed.data.siteId, "git_link");
    if (!linkData) {
        res.status(400).json({ ok: false, error: "No git link configured" });
        return;
    }
    const link = GitLinkSchema.parse(linkData);
    try {
        const baseSha = await githubGetBranchHeadSha(link.repoFullName, parsed.data.fromBranch, githubToken);
        const created = await githubCreateBranch(link.repoFullName, parsed.data.name, baseSha, githubToken);
        await recordActivity(parsed.data.siteId, {
            type: "branch_created",
            status: "success",
            actor: req.auth?.userId,
            branch: parsed.data.name,
            baseBranch: parsed.data.fromBranch,
            commitSha: created.sha,
        });
        res.json({ ok: true, data: { name: parsed.data.name } });
    } catch (err: unknown) {
        await recordActivity(parsed.data.siteId, {
            type: "branch_created",
            status: "failed",
            actor: req.auth?.userId,
            branch: parsed.data.name,
            baseBranch: parsed.data.fromBranch,
        });
        const message = err instanceof Error ? err.message : "Create branch failed";
        res.status(500).json({ ok: false, error: message });
    }
});

gitRouter.post("/pull-requests", async (req: AuthRequest, res: Response) => {
    const parsed = CreatePrBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const githubToken = await resolveGithubToken(req);
    if (!githubToken) {
        res.status(401).json({ ok: false, error: GIT_AUTH_ERROR });
        return;
    }
    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }
    const linkData = await readVariableJson(parsed.data.siteId, "git_link");
    if (!linkData) {
        res.status(400).json({ ok: false, error: "No git link configured" });
        return;
    }
    const link = GitLinkSchema.parse(linkData);
    try {
        const pr = await githubCreatePullRequest(
            link.repoFullName,
            parsed.data.title,
            parsed.data.body,
            parsed.data.head,
            parsed.data.base,
            githubToken,
        );
        await recordActivity(parsed.data.siteId, {
            type: "pr_opened",
            status: "success",
            actor: req.auth?.userId,
            branch: parsed.data.head,
            baseBranch: parsed.data.base,
            prNumber: pr.number,
        });
        res.json({ ok: true, data: pr });
    } catch (err: unknown) {
        await recordActivity(parsed.data.siteId, {
            type: "pr_opened",
            status: "failed",
            actor: req.auth?.userId,
            branch: parsed.data.head,
            baseBranch: parsed.data.base,
        });
        const message = err instanceof Error ? err.message : "Create PR failed";
        res.status(500).json({ ok: false, error: message });
    }
});

gitRouter.get("/history", async (req: AuthRequest, res: Response) => {
    const parsed = HistoryQuerySchema.safeParse({ siteId: req.query.siteId, limit: req.query.limit });
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }
    const items = await readHistory(parsed.data.siteId, parsed.data.limit);
    res.json({ ok: true, data: items });
});

gitRouter.post("/restore", async (req: AuthRequest, res: Response) => {
    const parsed = RestoreBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
    if (!site) {
        res.status(404).json({ ok: false, error: "Site not found" });
        return;
    }

    try {
        let snapshot: unknown | null = null;
        try {
            const maybeDelegate = (prisma as unknown as Record<string, unknown>)["gitActivity"];
            if (
                typeof maybeDelegate === "object" &&
                maybeDelegate !== null &&
                "findFirst" in maybeDelegate &&
                typeof (maybeDelegate as { findFirst?: unknown }).findFirst === "function"
            ) {
                const delegate = maybeDelegate as {
                    findFirst: (args: unknown) => Promise<{ snapshotJson: string | null } | null>;
                };
                const row = await delegate.findFirst({
                    where: { id: parsed.data.activityId, siteId: parsed.data.siteId },
                    select: { snapshotJson: true },
                });
                snapshot = row?.snapshotJson ? (JSON.parse(row.snapshotJson) as unknown) : null;
            }
        } catch {
            const existing = await readVariableJson(parsed.data.siteId, "git_activity_log");
            const arr = Array.isArray(existing) ? existing as Array<{ createdAt?: string; snapshot?: unknown; id?: string }> : [];
            const found = arr.find((e) => (e as { id?: string }).id === parsed.data.activityId) as unknown as { snapshot?: unknown } | undefined;
            snapshot = found?.snapshot ?? null;
        }

        if (!snapshot) {
            res.status(404).json({ ok: false, error: "Snapshot not found for activity" });
            return;
        }

        const exportData = BuildevExportSchema.safeParse(snapshot);
        if (!exportData.success) {
            res.status(400).json({ ok: false, error: exportData.error.flatten() });
            return;
        }

        const counts = await applyBuildevExport(parsed.data.siteId, exportData.data);
        await recordActivity(parsed.data.siteId, {
            type: "restore",
            status: "success",
            actor: req.auth?.userId,
            diffSummary: { restoredFrom: parsed.data.activityId, ...counts },
            snapshot: exportData.data,
        });
        res.json({ ok: true, data: counts });
    } catch (err: unknown) {
        await recordActivity(parsed.data.siteId, {
            type: "restore",
            status: "failed",
            actor: req.auth?.userId,
            diffSummary: { restoredFrom: parsed.data.activityId },
        });
        const message = err instanceof Error ? err.message : "Restore failed";
        res.status(500).json({ ok: false, error: message });
    }
});
