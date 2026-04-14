<template>
  <div class="tab-body">
    <div class="lib-toolbar">
      <label class="lib-filter-label">Filtrar por design system</label>
      <select v-model="libraryFilter" class="lib-select">
        <option value="all">Todos</option>
        <option value="active">Solo el activo en dashboard</option>
        <option value="unassigned">Sin etiqueta</option>
      </select>
      <p v-if="activeDsId" class="lib-hint">Activo: <code>{{ activeDsId.slice(0, 8) }}…</code></p>
      <p v-else class="lib-hint muted">Elige un design system en el panel del proyecto.</p>
    </div>

    <div class="block-section">
      <p class="section-label">CATÁLOGO ({{ totalCatalogPresets }})</p>
      <p class="lib-desc">
        {{ sectionPresetCount }} secciones (12 familias × 10 variantes), inspiradas en librerías como
        <a href="https://www.relume.io/" target="_blank" rel="noopener noreferrer">Relume</a>. Vista previa a la
        izquierda; arrastra el título, usa «Lienzo» para insertar en la página o «Librería» para guardar el símbolo.
      </p>
      <div class="preset-categories">
        <details v-for="group in presetGroups" :key="group.name" class="preset-details">
          <summary class="preset-summary">{{ group.name }} ({{ group.items.length }})</summary>
          <div class="preset-list">
            <div v-for="preset in group.items" :key="preset.id" class="preset-row">
              <BSLibraryPresetPreview :root-block="preset.rootBlock" />
              <div class="preset-main">
                <div
                  class="preset-drag"
                  draggable="true"
                  @dragstart="onDragPreset(preset.id)"
                  @dragend="clearDrags"
                >
                  <strong>{{ preset.name }}</strong>
                  <span class="preset-meta">{{ preset.description }}</span>
                </div>
                <div class="preset-actions">
                  <button type="button" class="btn-preset btn-preset-primary" @click="insertPresetToPage(preset.id)">
                    Lienzo
                  </button>
                  <button type="button" class="btn-preset" @click="store.importPresetToLibrary(preset.id)">
                    Librería
                  </button>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>

    <div class="block-section">
      <p class="section-label">TU PROYECTO ({{ filteredProjectComponents.length }})</p>
      <div v-if="!filteredProjectComponents.length" class="lib-empty">Aún no hay componentes guardados.</div>
      <div class="block-grid">
        <div
          v-for="comp in filteredProjectComponents"
          :key="comp.id"
          class="block-card symbol-card"
          draggable="true"
          @dragstart="onDragSymbol(comp.id)"
          @dragend="clearDrags"
        >
          <div class="block-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7z"
                stroke="var(--brand-primary)"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="block-label">{{ comp.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { usePagesStore } from "../../store/pages";
import {
  ALL_COMPONENT_LIBRARY_PRESETS,
  SECTION_PRESET_COUNT,
} from "../../data/componentLibraryCatalog";
import type { ComponentLibraryPreset } from "../../data/componentLibraryPresets";
import { readActiveDesignSystemId } from "../../utils/designSystemContext";
import { cloneBlockWithNewIds } from "../../utils/blockClone";
import BSLibraryPresetPreview from "./BSLibraryPresetPreview.vue";

const store = usePagesStore();

type LibraryFilter = "all" | "active" | "unassigned";

const libraryFilter = ref<LibraryFilter>("all");

const ORIGINAL_CATEGORIES_FIRST = ["Landing", "Marketing", "Conversion"];

const presetGroups = computed(() => {
  const map = new Map<string, ComponentLibraryPreset[]>();
  for (const p of ALL_COMPONENT_LIBRARY_PRESETS) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push(p);
  }
  const keys = [...map.keys()];
  keys.sort((a, b) => {
    const ia = ORIGINAL_CATEGORIES_FIRST.indexOf(a);
    const ib = ORIGINAL_CATEGORIES_FIRST.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return a.localeCompare(b, "es");
  });
  return keys.map((name) => ({ name, items: map.get(name)! }));
});

const totalCatalogPresets = computed(() => ALL_COMPONENT_LIBRARY_PRESETS.length);
const sectionPresetCount = SECTION_PRESET_COUNT;

const activeDsId = computed(() => readActiveDesignSystemId(store.currentSiteId));

interface ProjectComponentRow {
  id: string;
  name: string;
  designSystemId?: string | null;
}

const filteredProjectComponents = computed((): ProjectComponentRow[] => {
  const list = store.components as ProjectComponentRow[];
  if (libraryFilter.value === "all") return list;
  if (libraryFilter.value === "unassigned") {
    return list.filter((c) => !c.designSystemId);
  }
  const id = activeDsId.value;
  if (!id) return [];
  return list.filter((c) => c.designSystemId === id);
});

function clearDrags() {
  store.draggingBlockType = null;
  store.draggingSymbolId = null;
  store.draggingCatalogPresetId = null;
}

function onDragPreset(id: string) {
  clearDrags();
  store.draggingCatalogPresetId = id;
}

function onDragSymbol(id: string) {
  clearDrags();
  store.draggingSymbolId = id;
}

function insertPresetToPage(presetId: string) {
  const preset = ALL_COMPONENT_LIBRARY_PRESETS.find((p) => p.id === presetId);
  if (!preset || !store.currentPage) return;
  const cloned = cloneBlockWithNewIds(JSON.parse(JSON.stringify(preset.rootBlock)) as BSBlock);
  store.addBlock(cloned);
  store.selectBlock(cloned.id);
}
</script>

<style scoped>
.lib-toolbar {
  padding: 12px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lib-filter-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.lib-select {
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-main);
  background: var(--bg-input);
  color: var(--text-main);
}
.lib-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
}
.lib-hint.muted {
  color: var(--text-dim);
}
.lib-hint code {
  font-size: 10px;
}
.lib-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0 0 10px;
  line-height: 1.4;
}
.lib-desc a {
  color: var(--brand-primary);
  text-decoration: none;
}
.lib-desc a:hover {
  text-decoration: underline;
}
.preset-categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preset-details {
  border: 1px solid var(--border-main);
  border-radius: 8px;
  background: var(--bg-surface-alt);
  padding: 0 8px 8px;
}
.preset-summary {
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
  padding: 10px 4px;
  color: var(--text-main);
  list-style: none;
}
.preset-summary::-webkit-details-marker {
  display: none;
}
.preset-summary::before {
  content: "▸ ";
  display: inline-block;
  transition: transform 0.15s;
}
.preset-details[open] .preset-summary::before {
  transform: rotate(90deg);
}
.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preset-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
  border: 1px solid var(--border-main);
  border-radius: 8px;
  padding: 8px;
  background: var(--bg-surface);
}
.preset-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preset-drag {
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.preset-drag:active {
  cursor: grabbing;
}
.preset-meta {
  font-size: 10px;
  color: var(--text-dim);
  line-height: 1.3;
}
.preset-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.btn-preset {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-main);
  background: var(--bg-surface-alt);
  color: var(--text-main);
  cursor: pointer;
}
.btn-preset:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}
.btn-preset-primary {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  background: rgba(99, 102, 241, 0.08);
}
.lib-empty {
  font-size: 12px;
  color: var(--text-dim);
  padding: 8px 4px 16px;
}

.block-section {
  padding: 16px 12px;
}
.section-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  padding-left: 2px;
}

.block-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.block-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 4px;
  border: 1px solid var(--border-main);
  border-radius: 8px;
  cursor: grab;
  background: var(--bg-surface);
  transition: all 0.2s;
  min-height: 72px;
  justify-content: center;
  color: var(--text-muted);
}
.block-card:hover {
  border-color: var(--brand-primary);
  background: var(--bg-surface-alt);
  color: var(--text-main);
}
.block-card:active {
  cursor: grabbing;
}
.block-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}
.block-label {
  font-size: 10px;
  text-align: center;
  line-height: 1.2;
  font-weight: 600;
}

.symbol-card {
  border-color: var(--border-subtle);
  background: var(--bg-surface-alt);
}
</style>
