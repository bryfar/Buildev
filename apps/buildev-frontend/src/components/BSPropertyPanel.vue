<template>
  <aside class="props-panel">
    <div class="panel-header">
      <div class="panel-tabs">
        <button :class="{ active: tab === 'properties' }" type="button" @click="tab = 'properties'">Props</button>
        <button :class="{ active: tab === 'design' }" type="button" @click="tab = 'design'">Design</button>
        <button :class="{ active: tab === 'css' }" type="button" @click="tab = 'css'">CSS</button>
        <button :class="{ active: tab === 'script' }" type="button" @click="tab = 'script'">Script</button>
        <button :class="{ active: tab === 'settings' }" type="button" @click="tab = 'settings'">Settings</button>
        <button :class="{ active: tab === 'theme' }" type="button" @click="tab = 'theme'">Theme</button>
      </div>
    </div>

    <div v-if="tab === 'properties'" class="tab-content">
      <div v-if="selectedBlock" class="props-list">
        <BSPropStyle :block="selectedBlock" @open-gallery="isGalleryOpen = true" />
        <div class="prop-section">
          <div class="section-trigger" @click="sections.data = !sections.data">
            <span class="section-title">Data</span>
            <span class="chevron">{{ sections.data ? "−" : "+" }}</span>
          </div>
          <div v-show="sections.data" class="section-content">
            <BSPropData :block="selectedBlock" />
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-visual">✦</div>
        <p>Select an element to edit</p>
      </div>
      <footer v-if="selectedBlock" class="props-footer">
        <button type="button" class="btn-symbol" @click="saveAsSymbol">💎 Save as Symbol</button>
        <button type="button" class="btn-del" @click="store.removeBlock(selectedBlock.id)">Delete Block</button>
      </footer>
    </div>

    <div v-else-if="tab === 'design'" class="tab-content">
      <BSPropDesignInspector v-if="selectedBlock" :block="selectedBlock" />
      <div v-else class="empty-state">
        <div class="empty-visual">✦</div>
        <p>Select an element for layout, typography, and surfaces</p>
      </div>
      <footer v-if="selectedBlock" class="props-footer">
        <button type="button" class="btn-symbol" @click="saveAsSymbol">💎 Save as Symbol</button>
        <button type="button" class="btn-del" @click="store.removeBlock(selectedBlock.id)">Delete Block</button>
      </footer>
    </div>

    <div v-else-if="tab === 'css'" class="tab-content">
      <BSPropCssInspector v-if="selectedBlock" :block="selectedBlock" />
      <div v-else class="empty-state">
        <div class="empty-visual">✦</div>
        <p>Select an element to add custom CSS declarations</p>
      </div>
      <footer v-if="selectedBlock" class="props-footer">
        <button type="button" class="btn-symbol" @click="saveAsSymbol">💎 Save as Symbol</button>
        <button type="button" class="btn-del" @click="store.removeBlock(selectedBlock.id)">Delete Block</button>
      </footer>
    </div>

    <div v-else-if="tab === 'script'" class="tab-content script-content">
      <BSScriptTab />
    </div>

    <div v-else-if="tab === 'settings'" class="tab-content settings-content">
      <div v-if="store.currentPage" class="settings-form">
        <label>PAGE TITLE</label>
        <input v-model="store.currentPage.title" placeholder="SEO Title" />
        <label>DESCRIPTION</label>
        <textarea v-model="store.currentPage.description" placeholder="SEO Meta description"></textarea>
        <label>URL PATH</label>
        <input v-model="store.currentPage.urlPath" />
      </div>
    </div>

    <div v-else-if="tab === 'theme'" class="tab-content">
      <BSDesignSystem />
    </div>

    <BSAssetGallery :is-open="isGalleryOpen" @close="isGalleryOpen = false" @select="handleAssetSelect" />
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { usePagesStore } from "../store/pages";
import BSAssetGallery from "./BSAssetGallery.vue";
import BSDesignSystem from "./BSDesignSystem.vue";
import BSPropCssInspector from "./props/BSPropCssInspector.vue";
import BSPropData from "./props/BSPropData.vue";
import BSPropDesignInspector from "./props/BSPropDesignInspector.vue";
import BSPropStyle from "./props/BSPropStyle.vue";
import BSScriptTab from "./props/BSScriptTab.vue";

const store = usePagesStore();
const selectedBlock = computed(() => store.getSelectedBlock());
const isGalleryOpen = ref(false);
const tab = ref<"properties" | "design" | "css" | "script" | "settings" | "theme">("properties");

const sections = reactive({
  data: true,
});

function saveAsSymbol() {
  if (!selectedBlock.value) return;
  const name = prompt("Symbol Name:", selectedBlock.value.type);
  if (name) store.saveAsComponent(name, selectedBlock.value);
}

function handleAssetSelect(asset: { url: string }) {
  if (selectedBlock.value) store.updateBlock(selectedBlock.value.id, { src: asset.url });
}
</script>

<style scoped>
.props-panel {
  width: 360px;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border-main);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-tabs {
  display: flex;
  flex-wrap: wrap;
  background: var(--bg-surface-alt);
  border-bottom: 1px solid var(--border-main);
}
.panel-tabs button {
  flex: 1 1 50%;
  padding: 10px 4px;
  background: none;
  border: none;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.panel-tabs button.active {
  color: var(--text-main);
  border-bottom-color: var(--brand-primary);
  background: var(--bg-sidebar);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.prop-section {
  border-bottom: 1px solid var(--border-subtle);
}
.section-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-surface-alt);
  cursor: pointer;
}
.section-title {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}
.chevron {
  font-size: 12px;
  color: var(--text-dim);
}
.section-content {
  padding: 4px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}
.empty-visual {
  font-size: 24px;
  color: var(--border-main);
  margin-bottom: 12px;
}
.empty-state p {
  font-size: 11px;
  color: var(--text-dim);
  max-width: 220px;
  line-height: 1.4;
}

.props-footer {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--border-main);
  margin-top: auto;
}
.btn-symbol {
  padding: 8px;
  background: var(--bg-surface-alt);
  color: var(--brand-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-symbol:hover {
  background: var(--brand-primary);
  color: #fff;
}
.btn-del {
  padding: 8px;
  background: transparent;
  color: #ef4444;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.btn-del:hover {
  background: #fef2f2;
}

.settings-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.settings-form label {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-dim);
  text-transform: uppercase;
}
.settings-form input,
.settings-form textarea {
  border: 1px solid var(--border-main);
  border-radius: 6px;
  padding: 10px;
  font-size: 13px;
  outline: none;
  background: var(--bg-input);
  color: var(--text-main);
}
</style>
