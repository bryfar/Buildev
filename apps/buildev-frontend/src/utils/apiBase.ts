/**
 * Resuelve la URL base del API.
 * En desarrollo, sin `VITE_API_URL`, devuelve cadena vacía para usar el mismo origen
 * y el proxy de Vite (`/api` → backend en `vite.config.ts`).
 *
 * @param envVal Valor de `import.meta.env.VITE_API_URL`
 * @returns URL sin barra final, o `""` para rutas relativas `/api/...`
 */
export function resolveApiBase(envVal: unknown): string {
    if (typeof envVal === "string" && envVal.trim() !== "") {
        return envVal.trim().replace(/\/$/, "");
    }
    if (import.meta.env.DEV) {
        return "";
    }
    return "http://localhost:4000";
}
