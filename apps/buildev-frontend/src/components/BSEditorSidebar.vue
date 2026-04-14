<template>
  <aside class="sidebar">
    <div class="tabs">
      <button :class="{ active: activeTab === 'blocks' }" @click="activeTab = 'blocks'">Bloques</button>
      <button :class="{ active: activeTab === 'library' }" @click="activeTab = 'library'">Librería</button>
      <button :class="{ active: activeTab === 'layers' }" @click="activeTab = 'layers'">Capas</button>
    </div>

    <!-- ── BLOCKS ─────────────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'blocks'" class="tab-body">
      <div class="search-wrap">
        <svg width="14" height="14" class="search-ico" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input v-model="blockQuery" class="search-input" placeholder="Buscar bloques…" />
      </div>

      <div class="block-section">
        <p class="section-label">ELEMENTOS</p>
        <div class="block-grid">
          <div
            v-for="b in filteredBlocks"
            :key="b.type"
            class="block-card"
            draggable="true"
            @dragstart="onDragBlock(b.type)"
            @dragend="clearDrags"
            @click="addBlockToCanvas(b.type)"
          >
            <div class="block-icon" v-html="b.svgIcon"></div>
            <span class="block-label">{{ b.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── LIBRARY (catálogo + componentes del proyecto) ─────────────────── -->
    <div v-else-if="activeTab === 'library'" class="tab-body">
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
          <a href="https://www.relume.io/" target="_blank" rel="noopener noreferrer">Relume</a>. Arrastra o pulsa
          «Añadir».
        </p>
        <div class="preset-categories">
          <details v-for="group in presetGroups" :key="group.name" class="preset-details">
            <summary class="preset-summary">{{ group.name }} ({{ group.items.length }})</summary>
            <div class="preset-list">
              <div v-for="preset in group.items" :key="preset.id" class="preset-row">
                <div
                  class="preset-drag"
                  draggable="true"
                  @dragstart="onDragPreset(preset.id)"
                  @dragend="clearDrags"
                >
                  <strong>{{ preset.name }}</strong>
                  <span class="preset-meta">{{ preset.description }}</span>
                </div>
                <button type="button" class="btn-add-preset" @click="store.importPresetToLibrary(preset.id)">
                  Añadir
                </button>
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

    <!-- ── LAYERS ─────────────────────────────────────────────────────────── -->
    <div v-else class="tab-body layers-body">
      <div class="layer-header">
        <span class="layer-root"># body</span>
        <span class="layer-bp">{{ store.currentBreakpoint }}</span>
      </div>
      <div class="layer-tree">
        <BSLayerItem
          v-for="block in store.currentPage?.blocks"
          :key="block.id"
          :block="block"
          :depth="0"
        />
        <div v-if="!store.currentPage?.blocks.length" class="empty-layers">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <span>No layers yet</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { usePagesStore } from "../store/pages";
import {
  ALL_COMPONENT_LIBRARY_PRESETS,
  SECTION_PRESET_COUNT,
} from "../data/componentLibraryCatalog";
import type { ComponentLibraryPreset } from "../data/componentLibraryPresets";
import { readActiveDesignSystemId } from "../utils/designSystemContext";
import BSLayerItem from "./BSLayerItem.vue";

const store = usePagesStore();

type EditorTab = "blocks" | "library" | "layers";
type LibraryFilter = "all" | "active" | "unassigned";

const activeTab = ref<EditorTab>("blocks");
const blockQuery = ref("");
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

function addBlockToCanvas(type: string) {
  store.draggingBlockType = type;
  store.handleDrop();
}

function onDragBlock(type: string) {
  clearDrags();
  store.draggingBlockType = type;
}

function onDragPreset(id: string) {
  clearDrags();
  store.draggingCatalogPresetId = id;
}

function onDragSymbol(id: string) {
  clearDrags();
  store.draggingSymbolId = id;
}

function clearDrags() {
  store.draggingBlockType = null;
  store.draggingSymbolId = null;
  store.draggingCatalogPresetId = null;
}

const BLOCKS = [
  {
    type: "section",
    label: "Section",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 8h20" stroke="currentColor" stroke-width="1.5"/></svg>`,
  },
  {
    type: "container",
    label: "Container",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2"/></svg>`,
  },
  {
    type: "text",
    label: "Text",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7V5h16v2M9 20h6M12 5v15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    type: "heading",
    label: "Heading",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5v14M20 5v14M4 12h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    type: "image",
    label: "Image",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    type: "button",
    label: "Button",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="8" width="20" height="8" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M7 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    type: "columns",
    label: "Columns",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="4" width="8" height="16" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>`,
  },
  {
    type: "divider",
    label: "Divider",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 2"/></svg>`,
  },
  {
    type: "spacer",
    label: "Spacer",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 5h14M5 19h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    type: "video",
    label: "Video",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="15" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  },
  {
    type: "form",
    label: "Form",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-4M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    type: "input",
    label: "Input",
    svgIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
];

const filteredBlocks = computed(() => {
  if (!blockQuery.value) return BLOCKS;
  return BLOCKS.filter((b) => b.label.toLowerCase().includes(blockQuery.value.toLowerCase()));
});

onMounted(() => {
  void store.loadComponents();
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-main);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-main);
  background: var(--bg-surface-alt);
}
.tabs button {
  flex: 1;
  padding: 10px 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.tabs button.active {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
  background: var(--bg-sidebar);
}

.tab-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.search-wrap {
  position: relative;
  padding: 12px;
  border-bottom: 1px solid var(--border-subtle);
}
.search-ico {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-dim);
}
.search-input {
  width: 100%;
  height: 32px;
  background: var(--bg-input);
  border: 1px solid var(--border-main);
  border-radius: 6px;
  padding: 0 10px 0 32px;
  font-size: 12px;
  color: var(--text-main);
  outline: none;
}
.search-input:focus {
  border-color: var(--brand-primary);
  background: var(--bg-surface);
}

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
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-main);
  border-radius: 8px;
  padding: 8px;
  background: var(--bg-surface);
}
.preset-drag {
  flex: 1;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.preset-drag:active {
  cursor: grabbing;
}
.preset-meta {
  font-size: 10px;
  color: var(--text-dim);
  line-height: 1.3;
}
.btn-add-preset {
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
.btn-add-preset:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
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

.layers-body {
  overflow: hidden;
}
.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-alt);
}
.layer-root {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-main);
  font-family: "JetBrains Mono", monospace;
}
.layer-bp {
  font-size: 10px;
  color: var(--text-dim);
  font-weight: 700;
  text-transform: uppercase;
}
.layer-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.empty-layers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: var(--text-dim);
  font-size: 12px;
}
</style>
