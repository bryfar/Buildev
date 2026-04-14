/**
 * Lee y valida credenciales GitHub OAuth del entorno (soporta comillas y alias).
 */

function stripWrappers(raw: string): string {
    const t = raw.trim();
    if (t.length >= 2) {
        const a = t[0];
        const b = t[t.length - 1];
        if ((a === '"' && b === '"') || (a === "'" && b === "'")) {
            return t.slice(1, -1).trim();
        }
    }
    return t;
}

function readEnv(...keys: string[]): string {
    for (const k of keys) {
        const v = process.env[k];
        if (typeof v === "string" && v.trim() !== "") {
            return stripWrappers(v);
        }
    }
    return "";
}

function looksLikePlaceholder(clientId: string): boolean {
    const s = clientId.toLowerCase();
    return (
        s.includes("reemplaza") ||
        s.includes("ejemplo") ||
        s.includes("example") ||
        s.includes("your_client") ||
        s.includes("xxx") ||
        s === "changeme" ||
        s === "placeholder"
    );
}

/**
 * @returns Client ID de GitHub OAuth (puede estar vacío).
 */
export function getGithubClientId(): string {
    return readEnv("GITHUB_CLIENT_ID", "GH_CLIENT_ID");
}

/**
 * @returns Client secret de GitHub OAuth (puede estar vacío).
 */
export function getGithubClientSecret(): string {
    return readEnv("GITHUB_CLIENT_SECRET", "GH_CLIENT_SECRET");
}

/**
 * Indica si el servidor puede usar GitHub OAuth (login + vincular repo).
 *
 * @returns `true` solo con ID y secret reales (no plantillas).
 */
export function isGithubOAuthConfigured(): boolean {
    const id = getGithubClientId();
    const secret = getGithubClientSecret();
    if (!id || !secret) return false;
    if (looksLikePlaceholder(id)) return false;
    if (secret.length < 8) return false;
    return true;
}
