import { Router, Request, Response } from "express";
import { prisma } from "../services/db";
import { evaluateTargeting } from "@buildersite/sdk";
import type { BSVariant, BSBlock } from "@buildersite/domain";

export const publicRouter = Router();

/**
 * Middleware: verifica que la petición incluya un API Key válido del sitio.
 * Usado sólo en las rutas públicas del SDK (lectura de contenido publicado).
 */
async function requireApiKey(req: Request, res: Response, next: Function) {
    const key = req.headers["x-buildersite-key"] as string | undefined;
    if (!key) {
        res.status(401).json({ ok: false, error: "Missing x-buildersite-key header" });
        return;
    }
    const site = await prisma.site.findUnique({ where: { apiKey: key } });
    if (!site) {
        res.status(401).json({ ok: false, error: "Invalid API key" });
        return;
    }
    (req as any).site = site;
    next();
}

publicRouter.use(requireApiKey);

// ─── GET /api/public/page ─────────────────────────────────────────────────────
// Endpoint principal del SDK: devuelve una página publicada por urlPath,
// aplicando targeting de variantes si se pasan userAttributes.
publicRouter.get("/page", async (req: Request, res: Response) => {
    const { urlPath = "/", userAttributes } = req.query as {
        urlPath?: string;
        userAttributes?: string;
    };
    const siteId = (req as any).site.id;

    const page = await prisma.page.findFirst({
        where: { siteId, urlPath, status: "published" },
    });

    if (!page) {
        res.status(404).json({ ok: false, error: "No published page found for this path" });
        return;
    }

    const blocks = JSON.parse(page.blocksJson) as BSBlock[];
    let variants = JSON.parse(page.variantsJson) as BSVariant[];
    let resolvedBlocks = blocks;

    // Targeting: elegir variante si hay userAttributes
    if (userAttributes) {
        const attrs = JSON.parse(userAttributes) as Record<string, string>;
        const matched = variants.find(
            (v) => v.targeting && evaluateTargeting(v.targeting, attrs),
        );
        if (matched) resolvedBlocks = matched.rootBlock.children ?? [matched.rootBlock];
    }

    res.json({
        ok: true,
        data: {
            id: page.id,
            siteId: page.siteId,
            name: page.name,
            urlPath: page.urlPath,
            title: page.title,
            description: page.description,
            status: page.status,
            blocks: resolvedBlocks,
            publishedAt: page.publishedAt?.toISOString() ?? null,
            createdAt: page.createdAt.toISOString(),
            updatedAt: page.updatedAt.toISOString(),
        },
    });
});

// ─── GET /api/content/:model ──────────────────────────────────────────────────
// Endpoint genérico para modelos de contenido custom (similar a Builder.io)
publicRouter.get("/content/:model", async (req: Request, res: Response) => {
    const { model } = req.params;
    const { urlPath = "/" } = req.query as { urlPath?: string };
    const siteId = (req as any).site.id;

    // Por ahora: busca páginas con model="page" o devuelve 404 para modelos no implementados
    if (model === "page") {
        const page = await prisma.page.findFirst({
            where: { siteId, urlPath, status: "published" },
        });
        if (!page) {
            res.status(404).json({ ok: false, error: "Content not found" }); return;
        }
        res.json({ ok: true, data: { model, item: page } });
        return;
    }

    res.status(400).json({ ok: false, error: `Model "${model}" not yet supported` });
});

// ─── GET /api/public/page/:id/publications ────────────────────────────────────
publicRouter.get("/page/:id/publications", async (req: Request, res: Response) => {
    const pubs = await prisma.publication.findMany({
        where: { pageId: req.params.id },
        orderBy: { publishedAt: "desc" },
        take: 20,
    });
    res.json({ ok: true, data: pubs.map((p: any) => ({ ...p, snapshot: JSON.parse(p.snapshotJson) })) });
});

// ─── POST /api/public/events ──────────────────────────────────────────────────
publicRouter.post("/events", async (req: Request, res: Response) => {
    const { type, pageId, sessionId, target, metadata } = req.body as {
        type: string; pageId: string; sessionId: string;
        target?: string; metadata?: Record<string, unknown>;
    };
    const siteId = (req as any).site.id;
    await prisma.event.create({
        data: {
            siteId, pageId, type, sessionId,
            target: target ?? null,
            metadataJson: JSON.stringify(metadata ?? {}),
        },
    });
    res.status(204).end();
});
