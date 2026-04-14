import type { ComputedRef, InjectionKey } from "vue";

/** Indica que el bloque se renderiza solo como vista previa (sin interacción de edición). */
export const BLOCK_PREVIEW_KEY: InjectionKey<ComputedRef<boolean>> = Symbol("buildev.blockPreview");
