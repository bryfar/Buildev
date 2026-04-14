import { z } from "zod";
import { prisma } from "./db";
import {
    BuildevProjectSettingsPartialSchema,
    BuildevProjectSettingsStoredSchema,
    PROJECT_SETTINGS_VARIABLE_KEY,
} from "./buildevProjectSettings";

export const DEFAULT_EXPORT_PATH = ".buildev/buildev-site.json";

export const GitLinkSchema = z.object({
    repoFullName: z.string().regex(/^[^/]+\/[^/]+$/, "Use owner/repo format"),
    branch: z.string().min(1).default("main"),
    exportPath: z.string().min(1).default(DEFAULT_EXPORT_PATH),
});

export const BuildevExportSchema = z.object({
    version: z.number(),
    exportedAt: z.string().optional(),
    project: BuildevProjectSettingsPartialSchema.optional(),
    pages: z.array(
        z.object({
            name: z.string().min(1),
            urlPath: z.string(),
            blocks: z.array(z.unknown()).optional(),
            variants: z.array(z.unknown()).optional(),
        }),
    ),
    components: z
        .array(
            z.object({
                name: z.string().min(1),
                description: z.string().optional(),
                rootBlock: z.unknown(),
            }),
        )
        .optional(),
});

export type BuildevExport = z.infer<typeof BuildevExportSchema>;

/**
 * Comprueba que el usuario puede operar sobre el sitio: propietario explícito (`Site.userId`)
 * o sitio «legacy» sin `userId` vinculado solo a `User.siteId`.
 *
 * @param userId Identificador del usuario autenticado.
 * @param siteId Identificador del sitio.
 * @returns El sitio si hay acceso; si no, `null`.
 */
export async function assertSiteOwned(userId: string, siteId: string): Promise<{ id: string } | null> {
    const owned = await prisma.site.findFirst({
        where: { id: siteId, userId },
        select: { id: true },
    });
    if (owned) return owned;

    const legacySite = await prisma.site.findFirst({
        where: { id: siteId, userId: null },
        select: { id: true },
    });
    if (!legacySite) return null;

    const user = await prisma.user.findFirst({
        where: { id: userId, siteId },
        select: { id: true },
    });
    return user ? { id: legacySite.id } : null;
}

export async function readVariableJson(siteId: string, key: string): Promise<unknown | null> {
    const row = await prisma.variable.findUnique({
        where: { siteId_key: { siteId, key } },
    });
    if (!row?.valueJson) return null;
    try {
        return JSON.parse(row.valueJson) as unknown;
    } catch {
        return null;
    }
}

export async function writeVariableJson(siteId: string, key: string, value: unknown, description: string): Promise<void> {
    await prisma.variable.upsert({
        where: { siteId_key: { siteId, key } },
        create: { siteId, key, type: "json", valueJson: JSON.stringify(value), description },
        update: { valueJson: JSON.stringify(value) },
    });
}

export function normalizeUrlPath(path: string): string {
    const trimmed = path.trim();
    if (trimmed.startsWith("/")) return trimmed;
    return `/${trimmed}`;
}

/**
 * Applies exported pages/components to the site (upsert by urlPath / component name).
 */
export async function applyBuildevExport(siteId: string, parsed: BuildevExport): Promise<{ pagesUpdated: number; componentsUpdated: number }> {
    let pagesUpdated = 0;
    let componentsUpdated = 0;

    await prisma.$transaction(async (tx) => {
        for (const p of parsed.pages) {
            const urlPath = normalizeUrlPath(p.urlPath);
            const blocksJson = JSON.stringify(p.blocks ?? []);
            const variantsJson = JSON.stringify(p.variants ?? []);
            const existing = await tx.page.findFirst({
                where: { siteId, urlPath },
            });
            if (existing) {
                await tx.page.update({
                    where: { id: existing.id },
                    data: { name: p.name, blocksJson, variantsJson },
                });
            } else {
                await tx.page.create({
                    data: {
                        siteId,
                        name: p.name,
                        urlPath,
                        status: "draft",
                        blocksJson,
                        variantsJson,
                    },
                });
            }
            pagesUpdated += 1;
        }

        if (parsed.components?.length) {
            for (const c of parsed.components) {
                const existing = await tx.component.findFirst({
                    where: { siteId, name: c.name },
                });
                const rootBlockJson = JSON.stringify(c.rootBlock);
                if (existing) {
                    await tx.component.update({
                        where: { id: existing.id },
                        data: { description: c.description ?? null, rootBlockJson },
                    });
                } else {
                    await tx.component.create({
                        data: {
                            siteId,
                            name: c.name,
                            description: c.description ?? null,
                            rootBlockJson,
                        },
                    });
                }
                componentsUpdated += 1;
            }
        }
    });

    return { pagesUpdated, componentsUpdated };
}

export async function buildExportPayload(siteId: string): Promise<BuildevExport> {
    const pages = await prisma.page.findMany({ where: { siteId } });
    const components = await prisma.component.findMany({ where: { siteId } });
    const rawSettings = await readVariableJson(siteId, PROJECT_SETTINGS_VARIABLE_KEY);
    let project: BuildevExport["project"] | undefined;
    if (rawSettings !== null) {
        const parsed = BuildevProjectSettingsStoredSchema.safeParse(rawSettings);
        if (parsed.success) {
            const { detectedFrom: _d, ...rest } = parsed.data;
            project = rest;
        }
    }

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        ...(project !== undefined ? { project } : {}),
        pages: pages.map((p) => ({
            name: p.name,
            urlPath: p.urlPath,
            blocks: JSON.parse(p.blocksJson) as unknown[],
            variants: JSON.parse(p.variantsJson) as unknown[],
        })),
        components: components.map((c) => ({
            name: c.name,
            description: c.description ?? undefined,
            rootBlock: JSON.parse(c.rootBlockJson) as unknown,
        })),
    };
}
