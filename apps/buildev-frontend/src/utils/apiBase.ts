/**
 * Resuelve la URL base del API.
 * Sin `VITE_API_URL`, devuelve cadena vacía para usar el mismo origen
 * (o el proxy de Vite en desarrollo).
 *
 * @param envVal Valor de `import.meta.env.VITE_API_URL`
 * @returns URL sin barra final, o `""` para rutas relativas `/api/...`
 */
export function resolveApiBase(envVal: unknown): string {
    if (typeof envVal === "string" && envVal.trim() !== "") {
        const normalized = envVal.trim().replace(/\/$/, "");
        const isLocalHost =
            /^https?:\/\/localhost(?::\d+)?$/i.test(normalized) ||
            /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i.test(normalized);

        // En desarrollo, para localhost forzamos /api y dejamos que Vite proxy rote al backend.
        if (import.meta.env.DEV && isLocalHost) {
            return "";
        }

        // En producción, ignorar endpoints locales inválidos para navegador remoto.
        if (!import.meta.env.DEV && isLocalHost) {
            return "";
        }
        return normalized;
    }
    return "";
}
