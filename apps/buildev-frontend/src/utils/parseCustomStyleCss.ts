const SAFE_PROP = /^[a-zA-Z][a-zA-Z0-9-]*$/;

/**
 * Convierte `background-color` a `backgroundColor` para objetos `:style` de Vue.
 *
 * @param key Propiedad CSS en kebab-case o camelCase.
 * @returns Clave en camelCase.
 */
function toCamelKey(key: string): string {
    return key.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Parsea un fragmento tipo hoja de estilos (`prop: valor;`) a un objeto usable en `:style`.
 * Ignora líneas vacías o claves no seguras.
 *
 * @param input Texto multilínea con declaraciones CSS.
 * @returns Mapa propiedad → valor (strings).
 */
export function parseCustomStyleCss(input: string): Record<string, string> {
    const out: Record<string, string> = {};
    if (!input || typeof input !== "string") return out;
    for (const chunk of input.split(";")) {
        const idx = chunk.indexOf(":");
        if (idx === -1) continue;
        const rawKey = chunk.slice(0, idx).trim();
        const rawVal = chunk.slice(idx + 1).trim();
        if (!rawKey || !SAFE_PROP.test(rawKey)) continue;
        out[toCamelKey(rawKey)] = rawVal;
    }
    return out;
}
