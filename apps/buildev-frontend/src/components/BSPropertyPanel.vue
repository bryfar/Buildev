<template>
  <aside class="props-panel">
    <!-- Header with Tabs -->
    <div class="panel-header">
      <div class="panel-tabs">
        <button :class="{ active: tab === 'properties' }" @click="tab = 'properties'">Props</button>
        <button :class="{ active: tab === 'script' }" @click="tab = 'script'">Script</button>
        <button :class="{ active: tab === 'settings' }" @click="tab = 'settings'">Settings</button>
        <button :class="{ active: tab === 'design' }" @click="tab = 'design'">Design</button>
      </div>
      <div v-if="tab === 'properties'" class="search-box">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input v-model="searchQuery" placeholder="Search props" />
      </div>
    </div>

    <!-- ── PROPERTIES ─────────────────────────────────────────────────────── -->
    <div v-if="tab === 'properties'" class="tab-content">
      <div v-if="selectedBlock" class="props-list">
        <!-- Sections -->
        <div class="prop-section">
          <div class="section-trigger" @click="sections.style = !sections.style">
            <span class="section-title">STYLE</span>
            <span class="chevron">{{ sections.style ? '−' : '+' }}</span>
          </div>
          <div v-show="sections.style" class="section-content">
            <BSPropStyle :block="selectedBlock" @openGallery="isGalleryOpen = true" />
          </div>
        </div>

        <div class="prop-section">
          <div class="section-trigger" @click="sections.typography = !sections.typography">
            <span class="section-title">TYPOGRAPHY</span>
            <span class="chevron">{{ sections.typography ? '−' : '+' }}</span>
          </div>
          <div v-show="sections.typography" class="section-content">
            <BSPropData :block="selectedBlock" />
          </div>
        </div>

        <div class="prop-section">
          <div class="section-trigger" @click="sections.dimension = !sections.dimension">
            <span class="section-title">DIMENSION</span>
            <span class="chevron">{{ sections.dimension ? '−' : '+' }}</span>
          </div>
          <div v-show="sections.dimension" class="section-content">
            <BSPropLayout :block="selectedBlock" />
          </div>
        </div>

        <div class="prop-section">
          <div class="section-trigger" @click="sections.spacing = !sections.spacing">
            <span class="section-title">SPACING</span>
            <span class="chevron">{{ sections.spacing ? '−' : '+' }}</span>
          </div>
          <div v-show="sections.spacing" class="section-content">
            <BSPropSpacing :block="selectedBlock" />
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-visual">✦</div>
        <p>Select an element to edit</p>
      </div>

      <footer v-if="selectedBlock" class="props-footer">
        <button class="btn-symbol" @click="saveAsSymbol">💎 Save as Symbol</button>
        <button class="btn-del" @click="store.removeBlock(selectedBlock.id)">Delete Block</button>
      </footer>
    </div>

    <!-- ── SCRIPT ────────────────────────────────────────────────────────── -->
    <div v-if="tab === 'script'" class="tab-content script-content">
      <BSScriptTab />
    </div>

    <!-- ── SETTINGS ──────────────────────────────────────────────────────── -->
    <div v-if="tab === 'settings'" class="tab-content settings-content">
      <div v-if="store.currentPage" class="settings-form">
        <label>PAGE TITLE</label>
        <input v-model="store.currentPage.title" placeholder="SEO Title" />
        <label>DESCRIPTION</label>
        <textarea v-model="store.currentPage.description" placeholder="SEO Meta description"></textarea>
        <label>URL PATH</label>
        <input v-model="store.currentPage.urlPath" />
      </div>
    </div>

    <!-- ── DESIGN (Global Tokens) ────────────────────────────────────────── -->
    <div v-if="tab === 'design'" class="tab-content">
      <BSDesignSystem />
    </div>

    <BSAssetGallery :is-open="isGalleryOpen" @close="isGalleryOpen = false" @select="handleAssetSelect" />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from "vue";
import { usePagesStore } from "../store/pages";
import BSAssetGallery from "./BSAssetGallery.vue";
import BSPropData from "./props/BSPropData.vue";
import BSPropLayout from "./props/BSPropLayout.vue";
import BSPropSpacing from "./props/BSPropSpacing.vue";
import BSPropStyle from "./props/BSPropStyle.vue";
import BSPropAdvanced from "./props/BSPropAdvanced.vue";
import BSScriptTab from "./props/BSScriptTab.vue";
import BSDesignSystem from "./BSDesignSystem.vue";

const store = usePagesStore();
const selectedBlock = computed(() => store.getSelectedBlock());
const isGalleryOpen = ref(false);
const tab = ref<'properties' | 'script' | 'settings' | 'design'>('properties');
const searchQuery = ref('');

const sections = reactive({
  style: true,
  typography: true,
  dimension: true,
  spacing: true,
  advanced: false
});

function saveAsSymbol() {
  if (!selectedBlock.value) return;
  const name = prompt("Symbol Name:", selectedBlock.value.type);
  if (name) store.saveAsComponent(name, selectedBlock.value);
}

function handleAssetSelect(asset: any) {
  if (selectedBlock.value) store.updateBlock(selectedBlock.value.id, { src: asset.url });
}
</script>

<style scoped>
.props-panel { 
  width: 320px; background: var(--bg-sidebar); border-left: 1px solid var(--border-main); 
  display: flex; flex-direction: column; flex-shrink: 0; 
}

/* Tabs */
.panel-tabs { display: flex; background: var(--bg-surface-alt); border-bottom: 1px solid var(--border-main); }
.panel-tabs button {
  flex: 1; padding: 12px 4px; background: none; border: none; font-size: 11px; font-weight: 700; 
  color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; 
  text-transform: uppercase; letter-spacing: 0.05em;
}
.panel-tabs button.active { color: var(--text-main); border-bottom-color: var(--brand-primary); background: var(--bg-sidebar); }

.search-box { position: relative; padding: 10px; border-bottom: 1px solid var(--border-subtle); color: var(--text-dim); }
.search-box svg { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); }
.search-box input { 
  width: 100%; height: 32px; background: var(--bg-input); border: 1px solid var(--border-main); 
  border-radius: 6px; padding: 0 10px 0 30px; font-size: 12px; color: var(--text-main); outline: none; 
}

.tab-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

/* Sections */
.prop-section { border-bottom: 1px solid var(--border-subtle); }
.section-trigger { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 10px 14px; background: var(--bg-surface-alt); cursor: pointer; 
}
.section-title { font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; }
.chevron { font-size: 12px; color: var(--text-dim); }
.section-content { padding: 4px 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
.empty-visual { font-size: 24px; color: var(--border-main); margin-bottom: 12px; }
.empty-state p { font-size: 11px; color: var(--text-dim); }

.props-footer { padding: 16px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border-main); }
.btn-symbol { padding: 8px; background: var(--bg-surface-alt); color: var(--brand-primary); border: 1px solid var(--border-subtle); border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-symbol:hover { background: var(--brand-primary); color: #fff; }
.btn-del { padding: 8px; background: transparent; color: #ef4444; border: 1px solid transparent; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
.btn-del:hover { background: #fef2f2; }

/* Settings Form */
.settings-form { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.settings-form label { font-size: 10px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; }
.settings-form input, .settings-form textarea { 
  border: 1px solid var(--border-main); border-radius: 6px; padding: 10px; 
  font-size: 13px; outline: none; background: var(--bg-input); color: var(--text-main);
}
</style>
