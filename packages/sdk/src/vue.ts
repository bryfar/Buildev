import { ref, shallowRef, onMounted, type Ref, type ShallowRef } from "vue";
import type { BSApiResponse, BSPage } from "./index";
import { fetchPage, type FetchPageOptions } from "./index";

// ─── Tipos del composable ─────────────────────────────────────────────────────

export interface UseBuildersiteContentReturn {
    /** Datos de la página si la petición fue exitosa. */
    page: ShallowRef<BSPage | null>;
    /** Mensaje de error si la petición falló. */
    error: Ref<string | null>;
    /** true mientras la petición está en curso. */
    isLoading: Ref<boolean>;
    /** Fuerza una recarga de los datos. */
    refresh: () => Promise<void>;
}

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * Composable Vue 3 para consumir contenido publicado de Buildersite.
 *
 * Equivalente al hook `useIsPreviewing` + `fetchOneEntry` de Builder.io SDK Vue.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useBuildersiteContent } from "@buildev/sdk/vue";
 *
 * const { page, isLoading, error } = useBuildersiteContent({
 *   urlPath: "/home",
 *   userAttributes: { country: "mx" },
 * });
 * </script>
 * ```
 */
export function useBuildersiteContent(
    opts: FetchPageOptions,
): UseBuildersiteContentReturn {
    const page = shallowRef<BSPage | null>(null);
    const error = ref<string | null>(null);
    const isLoading = ref(false);

    async function load(): Promise<void> {
        isLoading.value = true;
        error.value = null;

        const result: BSApiResponse<BSPage> = await fetchPage(opts);

        if (result.ok) {
            page.value = result.data;
        } else {
            error.value = result.error ?? "Unknown error fetching content";
        }

        isLoading.value = false;
    }

    onMounted(() => {
        void load();
    });

    return { page, error, isLoading, refresh: load };
}
