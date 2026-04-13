import { z } from "zod";

/** Variable key used by GET /api/sites merge and git export payload. */
export const PROJECT_SETTINGS_VARIABLE_KEY = "buildev_project_settings";

/** Candidate paths for monorepos (first match wins). */
export const PACKAGE_JSON_CANDIDATE_PATHS = [
    "package.json",
    "apps/web/package.json",
    "apps/frontend/package.json",
    "web/package.json",
    "frontend/package.json",
    "packages/web/package.json",
] as const;

export const BuildevProjectSettingsPartialSchema = z.object({
    projectType: z.enum(["landing", "multisite", "cms"]).optional(),
    stack: z.string().optional(),
    backend: z.string().optional(),
    cms: z.string().optional(),
    mode: z.string().optional(),
});

export type BuildevProjectSettingsPartial = z.infer<typeof BuildevProjectSettingsPartialSchema>;

export const BuildevProjectSettingsStoredSchema = z.object({
    projectType: z.enum(["landing", "multisite", "cms"]),
    stack: z.string(),
    backend: z.string(),
    cms: z.string(),
    mode: z.string().optional(),
    detectedFrom: z.enum(["export", "package.json", "default", "mixed"]).optional(),
});

export type BuildevProjectSettingsStored = z.infer<typeof BuildevProjectSettingsStoredSchema>;

const DEFAULT_SETTINGS: Omit<BuildevProjectSettingsStored, "detectedFrom"> = {
    projectType: "landing",
    stack: "vite-vue",
    backend: "node-express",
    cms: "none",
};

/**
 * Combina el bloque `project` del JSON exportado con la inferencia (el export gana campo a campo).
 * @param inferred - Valores inferidos desde package.json o valores por defecto
 * @param fromExport - Bloque opcional `project` en buildev-site.json
 * @returns Configuración persistible con `detectedFrom` coherente (`export`, `package.json`, `mixed` o `default`)
 */
export function mergeProjectSettingsLayered(
    inferred: BuildevProjectSettingsStored,
    fromExport: BuildevProjectSettingsPartial | undefined,
): BuildevProjectSettingsStored {
    if (!fromExport || Object.keys(fromExport).length === 0) {
        return inferred;
    }
    const merged: BuildevProjectSettingsStored = {
        projectType: fromExport.projectType ?? inferred.projectType,
        stack: fromExport.stack ?? inferred.stack,
        backend: fromExport.backend ?? inferred.backend,
        cms: fromExport.cms ?? inferred.cms,
        mode: fromExport.mode ?? inferred.mode,
        detectedFrom: inferred.detectedFrom,
    };
    const exportSet =
        fromExport.projectType !== undefined ||
        (fromExport.stack !== undefined && fromExport.stack.length > 0) ||
        (fromExport.backend !== undefined && fromExport.backend.length > 0) ||
        (fromExport.cms !== undefined && fromExport.cms.length > 0) ||
        fromExport.mode !== undefined;
    const baseKind = inferred.detectedFrom ?? "default";
    if (!exportSet) {
        merged.detectedFrom = baseKind;
        return merged;
    }
    if (baseKind === "package.json") {
        merged.detectedFrom = "mixed";
    } else {
        merged.detectedFrom = "export";
    }
    return merged;
}

function mergeDepRecords(pkg: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    const merge = (block: unknown) => {
        if (!block || typeof block !== "object") return;
        for (const [k, v] of Object.entries(block)) {
            if (typeof v === "string") out[k] = v;
        }
    };
    merge(pkg.dependencies);
    merge(pkg.devDependencies);
    merge(pkg.peerDependencies);
    return out;
}

/**
 * Infiere stack (frontend), backend y CMS a partir de dependencias en package.json.
 * @param packageJson - Objeto parseado de package.json
 * @returns Configuración alineada con las opciones del asistente Buildev
 */
export function inferProjectSettingsFromPackageJson(packageJson: unknown): BuildevProjectSettingsStored {
    if (!packageJson || typeof packageJson !== "object") {
        return { ...DEFAULT_SETTINGS, detectedFrom: "default" };
    }
    const pkg = packageJson as Record<string, unknown>;
    const dep = mergeDepRecords(pkg);

    let stack = DEFAULT_SETTINGS.stack;
    if (dep.next) stack = "next-react";
    else if (dep.nuxt) stack = "nuxt";
    else if (dep.astro) stack = "astro";
    else if (dep["@sveltejs/kit"]) stack = "sveltekit";
    else if (dep["@remix-run/node"] || dep["@remix-run/react"] || dep.remix) stack = "remix";
    else if (dep["@solidjs/start"]) stack = "solidstart";
    else if (dep["@builder.io/qwik-city"] || dep["@builder.io/qwik"]) stack = "qwik";
    else if (dep.vite) {
        if (dep.vue || dep["@vitejs/plugin-vue"]) stack = "vite-vue";
        else if (dep.react || dep["@vitejs/plugin-react"] || dep["@vitejs/plugin-react-swc"]) stack = "vite-react";
        else stack = "vite-vue";
    }

    let backend = DEFAULT_SETTINGS.backend;
    if (dep["@nestjs/core"]) backend = "nestjs";
    else if (dep.fastify) backend = "node-fastify";
    else if (dep.hono || dep["@hono/node-server"]) backend = "hono";
    else if (dep.express) backend = "node-express";

    let cms = DEFAULT_SETTINGS.cms;
    if (dep.strapi || dep["@strapi/strapi"]) cms = "strapi";
    else if (dep["@payloadcms/db-postgres"] || dep.payload) cms = "payload";
    else if (dep["@sanity/client"] || dep.sanity) cms = "sanity";
    else if (dep.contentful) cms = "contentful";
    else if (dep.directus || dep["@directus/sdk"]) cms = "directus";

    let projectType: "landing" | "multisite" | "cms" = DEFAULT_SETTINGS.projectType;
    const cmsHeavy =
        cms !== "none" ||
        Boolean(dep.strapi || dep["@strapi/strapi"] || dep["@payloadcms/db-postgres"] || dep["@sanity/client"]);
    if (cmsHeavy) projectType = "cms";

    return {
        projectType,
        stack,
        backend,
        cms,
        detectedFrom: "package.json",
    };
}

/**
 * Valores por defecto cuando no hay package.json ni bloque `project` en el export.
 * @returns Configuración inicial estándar Buildev
 */
export function defaultProjectSettings(): BuildevProjectSettingsStored {
    return { ...DEFAULT_SETTINGS, detectedFrom: "default" };
}
