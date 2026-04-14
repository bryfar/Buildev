import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { usePagesStore } from "../store/pages";

/**
 * Lectura/escritura de props de bloque con soporte responsive (desktop en raíz; tablet/mobile en `props.responsive`).
 *
 * @param getBlock Función que devuelve el bloque actual (reactiva vía props del padre).
 * @returns `val`, `setProp`, `onInput` y el breakpoint activo.
 */
export function useBlockPropBinding(getBlock: () => BSBlock) {
    const store = usePagesStore();
    const breakpoint = computed(() => store.currentBreakpoint);

    /**
     * @param prop Nombre de la prop en `block.props`.
     * @returns Valor efectivo para el breakpoint actual.
     */
    function val(prop: string): unknown {
        const block = getBlock();
        const base = block.props as Record<string, unknown>;
        const responsive = base.responsive as Record<string, Record<string, unknown>> | undefined;
        const layer = responsive?.[breakpoint.value];
        return layer?.[prop] ?? base[prop];
    }

    /**
     * @param prop Clave a actualizar.
     * @param value Valor serializable.
     */
    function setProp(prop: string, value: string | number | boolean): void {
        const block = getBlock();
        const bp = breakpoint.value;
        if (bp === "desktop") {
            store.updateBlock(block.id, { [prop]: value });
            return;
        }
        const base = block.props as Record<string, unknown>;
        const responsive: Record<string, Record<string, unknown>> = {
            ...(typeof base.responsive === "object" && base.responsive !== null
                ? (base.responsive as Record<string, Record<string, unknown>>)
                : {}),
        };
        responsive[bp] = { ...(responsive[bp] ?? {}), [prop]: value };
        store.updateBlock(block.id, { responsive });
    }

    /**
     * @param prop Clave de propiedad.
     * @param e Evento de input/change desde un control nativo.
     */
    function onInput(prop: string, e: Event): void {
        const t = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (t.type === "checkbox") {
            setProp(prop, (t as HTMLInputElement).checked);
            return;
        }
        let value: string | number = t.value;
        if (t.type === "number") {
            value = t.value === "" ? "" : Number(t.value);
        }
        setProp(prop, value);
    }

    return { val, setProp, onInput, breakpoint };
}
