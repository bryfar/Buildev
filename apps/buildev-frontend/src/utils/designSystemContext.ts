/**
 * Lee el design system activo persistido por el dashboard (`buildev_active_design_systems`).
 *
 * @param siteId Identificador del sitio actual o `null`.
 * @returns Id del design system activo o cadena vacía.
 */
export function readActiveDesignSystemId(siteId: string | null): string {
    if (!siteId || typeof localStorage === "undefined") return "";
    try {
        const raw = localStorage.getItem("buildev_active_design_systems");
        if (!raw) return "";
        const map = JSON.parse(raw) as Record<string, unknown>;
        const v = map[siteId];
        return typeof v === "string" ? v : "";
    } catch {
        return "";
    }
}
