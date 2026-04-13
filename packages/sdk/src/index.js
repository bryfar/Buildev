"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBuildersite = initBuildersite;
exports.fetchPage = fetchPage;
exports.fetchContent = fetchContent;
exports.fetchPublications = fetchPublications;
exports.trackEvent = trackEvent;
exports.evaluateTargeting = evaluateTargeting;
let _config = null;
/**
 * Inicializa el SDK con la URL del backend y el API key.
 *
 * @example
 * ```ts
 * import { initBuildersite } from "@buildev/sdk";
 * initBuildersite({ endpoint: "https://api.miapp.com", apiKey: "pub_xxx" });
 * ```
 */
function initBuildersite(config) {
    _config = config;
}
function getConfig() {
    if (!_config) {
        throw new Error("[buildersite-sdk] SDK not initialized. Call initBuildersite() first.");
    }
    return _config;
}
// ─── Helpers internos ─────────────────────────────────────────────────────────
async function apiFetch(path, params, cfg) {
    const config = cfg ?? getConfig();
    const url = new URL(path, config.endpoint);
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    let res;
    try {
        res = await fetch(url.toString(), {
            headers: {
                "x-buildersite-key": config.apiKey,
                "Content-Type": "application/json",
            },
        });
    }
    catch (err) {
        return { ok: false, error: String(err), status: 0 };
    }
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        return { ok: false, error: text, status: res.status };
    }
    const data = (await res.json());
    return { ok: true, data };
}
// ─── API pública del SDK ──────────────────────────────────────────────────────
/**
 * Obtiene una página publicada por su URL path.
 * Soporta targeting: pasa `userAttributes` y el backend elegirá la variante
 * más relevante para ese usuario.
 *
 * @example
 * ```ts
 * const result = await fetchPage({ urlPath: "/home" });
 * if (result.ok) {
 *   console.log(result.data.blocks);
 * }
 * ```
 */
async function fetchPage(opts, cfg) {
    const params = { urlPath: opts.urlPath };
    if (opts.userAttributes) {
        params["userAttributes"] = JSON.stringify(opts.userAttributes);
    }
    return apiFetch("/api/public/page", params, cfg);
}
/**
 * Obtiene cualquier tipo de contenido publicado por modelo y urlPath.
 * Equivalente al `fetchOneEntry` del SDK de Builder.io.
 *
 * @example
 * ```ts
 * const result = await fetchContent({ model: "blog-post", urlPath: "/blog/hello" });
 * ```
 */
async function fetchContent(opts, cfg) {
    const params = { urlPath: opts.urlPath };
    if (opts.userAttributes) {
        params["userAttributes"] = JSON.stringify(opts.userAttributes);
    }
    return apiFetch(`/api/content/${opts.model}`, params, cfg);
}
/**
 * Obtiene el historial de publicaciones de una página.
 */
async function fetchPublications(pageId, cfg) {
    return apiFetch(`/api/public/page/${pageId}/publications`, {}, cfg);
}
/**
 * Envía un evento de analítica (view, click, conversion, custom).
 * Fire-and-forget — los errores se suprimen para no bloquear al usuario.
 *
 * @example
 * ```ts
 * trackEvent({ type: "view", pageId: "home", siteId: "s1", sessionId: "abc" });
 * ```
 */
function trackEvent(payload, cfg) {
    const config = cfg ?? getConfig();
    const url = new URL("/api/public/events", config.endpoint).toString();
    const body = {
        type: payload.type,
        pageId: payload.pageId,
        siteId: payload.siteId,
        sessionId: payload.sessionId,
        target: payload.target,
        metadata: payload.metadata,
    };
    // Best-effort, no await
    fetch(url, {
        method: "POST",
        headers: {
            "x-buildersite-key": config.apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        keepalive: true,
    }).catch(() => {
        /* suprimir errores de red en tracking */
    });
}
// ─── Evaluador de targeting ───────────────────────────────────────────────────
/**
 * Evalúa si unas reglas de targeting coinciden con los atributos del usuario.
 * Se puede usar en el frontend sin necesidad de un round-trip al servidor.
 */
function evaluateTargeting(rules, userAttributes) {
    return rules.every((rule) => {
        const value = userAttributes[rule.attribute] ?? "";
        switch (rule.operator) {
            case "equals":
                return value === rule.value;
            case "contains":
                return value.includes(rule.value);
            case "startsWith":
                return value.startsWith(rule.value);
            case "regex":
                return new RegExp(rule.value).test(value);
            default:
                return false;
        }
    });
}
