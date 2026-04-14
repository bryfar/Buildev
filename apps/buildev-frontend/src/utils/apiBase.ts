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
        return envVal.trim().replace(/\/$/, "");
    }
    return "";
}
