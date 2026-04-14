import { Router, Response } from "express";
import { z } from "zod";
import { requireAuthHandler, AuthRequest } from "../middleware/auth";
import { assertSiteOwned, readVariableJson, writeVariableJson } from "../services/buildevGitExport";
import { createPreviewDeployment, getDeployment } from "../services/vercelApi";
import { prisma } from "../services/db";

export const deployRouter = Router();

deployRouter.use(requireAuthHandler);

const VercelLinkSchema = z.object({
  siteId: z.string().min(1),
  projectId: z.string().min(1),
  teamId: z.string().optional(),
});

const VercelPreviewSchema = z.object({
  siteId: z.string().min(1),
  branch: z.string().min(1),
});

const DeployStatusQuerySchema = z.object({
  siteId: z.string().min(1),
});

function readVercelToken(req: AuthRequest): string | null {
  const header = req.headers["x-vercel-token"];
  if (typeof header === "string" && header.length > 0) return header;
  return null;
}

async function recordDeploymentFallback(siteId: string, record: unknown): Promise<void> {
  const key = "deploy_records";
  const existing = await readVariableJson(siteId, key);
  const arr = Array.isArray(existing) ? existing : [];
  const next = [record, ...arr].slice(0, 200);
  await writeVariableJson(siteId, key, next, "Deployment records (fallback)");
}

/**
 * POST /api/deploy/vercel/link
 * Stores Vercel project identifiers for a site.
 */
deployRouter.post("/vercel/link", async (req: AuthRequest, res: Response) => {
  const parsed = VercelLinkSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.flatten() });
    return;
  }

  const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
  if (!site) {
    res.status(404).json({ ok: false, error: "Site not found" });
    return;
  }

  await writeVariableJson(parsed.data.siteId, "vercel_link", parsed.data, "Vercel link data");
  res.json({ ok: true, data: parsed.data });
});

/**
 * POST /api/deploy/vercel/preview
 * Creates a preview deployment on Vercel (expects repo already linked in Vercel project).
 */
deployRouter.post("/vercel/preview", async (req: AuthRequest, res: Response) => {
  const parsed = VercelPreviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.flatten() });
    return;
  }

  const vercelToken = readVercelToken(req);
  if (!vercelToken) {
    res.status(401).json({ ok: false, error: "Missing x-vercel-token header" });
    return;
  }

  const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
  if (!site) {
    res.status(404).json({ ok: false, error: "Site not found" });
    return;
  }

  const vercelLink = await readVariableJson(parsed.data.siteId, "vercel_link");
  const gitLink = await readVariableJson(parsed.data.siteId, "git_link");
  if (!vercelLink || !gitLink) {
    res.status(400).json({ ok: false, error: "Missing Vercel link or Git link. Link both first." });
    return;
  }

  const link = VercelLinkSchema.parse(vercelLink);
  const git = z.object({ repoFullName: z.string() }).parse(gitLink);

  try {
    const deployment = await createPreviewDeployment({
      vercelToken,
      projectId: link.projectId,
      teamId: link.teamId,
      gitSource: {
        type: "github",
        repo: git.repoFullName,
        ref: parsed.data.branch,
      },
    });

    const record = {
      provider: "vercel",
      environment: "preview",
      url: `https://${deployment.url}`,
      status: deployment.state ?? "queued",
      branch: parsed.data.branch,
      deploymentId: deployment.id,
      createdAt: new Date().toISOString(),
    };

    try {
      const maybeDelegate = (prisma as unknown as Record<string, unknown>)["deploymentRecord"];
      if (
        typeof maybeDelegate === "object" &&
        maybeDelegate !== null &&
        "create" in maybeDelegate &&
        typeof (maybeDelegate as { create?: unknown }).create === "function"
      ) {
        const delegate = maybeDelegate as { create: (args: { data: Record<string, unknown> }) => Promise<unknown> };
        await delegate.create({
          data: {
            siteId: parsed.data.siteId,
            provider: "vercel",
            environment: "preview",
            url: record.url,
            status: record.status,
            branch: parsed.data.branch,
          },
        });
      } else {
        await recordDeploymentFallback(parsed.data.siteId, record);
      }
    } catch {
      await recordDeploymentFallback(parsed.data.siteId, record);
    }

    res.json({ ok: true, data: record });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Vercel preview deploy failed";
    res.status(500).json({ ok: false, error: message });
  }
});

/**
 * GET /api/deploy/status?siteId=...
 * Returns latest deployment record and optionally refreshes Vercel status if token provided.
 */
deployRouter.get("/status", async (req: AuthRequest, res: Response) => {
  const parsed = DeployStatusQuerySchema.safeParse({ siteId: req.query.siteId });
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.flatten() });
    return;
  }

  const site = await assertSiteOwned(req.auth!.userId, parsed.data.siteId);
  if (!site) {
    res.status(404).json({ ok: false, error: "Site not found" });
    return;
  }

  const existing = await readVariableJson(parsed.data.siteId, "deploy_records");
  const arr = Array.isArray(existing) ? existing : [];
  const latest = (arr[0] ?? null) as unknown;
  res.json({ ok: true, data: { latest } });
});

