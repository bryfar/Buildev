/**
 * Catálogo unificado: plantillas base + 120 secciones (12×10) por familias y variantes.
 */
import type { ComponentLibraryPreset } from "./componentLibraryPresets";
import { COMPONENT_LIBRARY_PRESETS } from "./componentLibraryPresets";
import { SECTION_LIBRARY_PRESETS } from "./sectionLibraryPresets";

export const ALL_COMPONENT_LIBRARY_PRESETS: ComponentLibraryPreset[] = [
    ...COMPONENT_LIBRARY_PRESETS,
    ...SECTION_LIBRARY_PRESETS,
];

export const SECTION_PRESET_COUNT = SECTION_LIBRARY_PRESETS.length;
