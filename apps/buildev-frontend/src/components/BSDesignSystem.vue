<template>
  <div class="design-system">
    <!-- Tab Nav -->
    <div class="ds-tabs">
      <button :class="{ active: tab === 'colors' }" @click="tab = 'colors'">
        <span class="tab-icon">🎨</span> Colors
      </button>
      <button :class="{ active: tab === 'typography' }" @click="tab = 'typography'">
        <span class="tab-icon">Aa</span> Type
      </button>
      <button :class="{ active: tab === 'spacing' }" @click="tab = 'spacing'">
        <span class="tab-icon">↔</span> Space
      </button>
      <button :class="{ active: tab === 'export' }" @click="tab = 'export'">
        <span class="tab-icon">↑</span> Export
      </button>
    </div>

    <!-- ─── COLORS ───────────────────────────────────────────────────────── -->
    <div v-if="tab === 'colors'" class="ds-content">
      <div class="ds-section-header">
        <span>Color Tokens</span>
        <button class="add-btn" @click="addingColor = true">+ Add</button>
      </div>

      <div class="color-grid">
        <div
          v-for="color in ds.tokens.colors"
          :key="color.id"
          class="color-token"
          :title="`var(--color-${color.id})`"
        >
          <div class="color-swatch" :style="{ background: color.value }">
            <button class="del-btn" @click="ds.removeColor(color.id)">✕</button>
          </div>
          <input
            class="color-name"
            :value="color.name"
            @change="(e) => ds.updateColor(color.id, { name: (e.target as HTMLInputElement).value })"
          />
          <input
            class="color-value"
            type="color"
            :value="color.value"
            @input="(e) => ds.updateColor(color.id, { value: (e.target as HTMLInputElement).value })"
          />
        </div>
      </div>

      <div v-if="addingColor" class="add-form">
        <input v-model="newColor.name" placeholder="Token Name (e.g. brand-blue)" class="ds-input" />
        <div class="color-pick-row">
          <input v-model="newColor.value" type="color" class="color-input-large" />
          <input v-model="newColor.value" placeholder="#hex" class="ds-input" />
        </div>
        <div class="form-actions">
          <button class="btn-primary" @click="confirmAddColor">Add Color</button>
          <button class="btn-cancel" @click="addingColor = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- ─── TYPOGRAPHY ───────────────────────────────────────────────────── -->
    <div v-if="tab === 'typography'" class="ds-content">
      <div class="ds-section-header">
        <span>Type Scale</span>
        <button class="add-btn" @click="addingType = !addingType">+ Add</button>
      </div>

      <div class="type-list">
        <div v-for="t in ds.tokens.typography" :key="t.id" class="type-token">
          <div
            class="type-preview"
            :style="{
              fontFamily: t.fontFamily,
              fontSize: clampFontSize(t.fontSize),
              fontWeight: t.fontWeight,
              lineHeight: t.lineHeight,
            }"
          >{{ t.name }}</div>
          <div class="type-meta">
            <span>{{ t.fontSize }}</span>
            <span>{{ t.fontWeight }}</span>
            <span>{{ t.fontFamily }}</span>
            <span class="var-badge">var(--font-{{ t.id }}-size)</span>
          </div>
          <div class="type-controls">
            <input
              class="ds-input-sm"
              :value="t.fontSize"
              placeholder="size"
              @change="(e) => ds.updateTypography(t.id, { fontSize: (e.target as HTMLInputElement).value })"
            />
            <input
              class="ds-input-sm"
              :value="t.fontWeight"
              placeholder="weight"
              @change="(e) => ds.updateTypography(t.id, { fontWeight: (e.target as HTMLInputElement).value })"
            />
            <button class="del-btn-inline" @click="ds.removeTypography(t.id)">✕</button>
          </div>
        </div>
      </div>

      <div v-if="addingType" class="add-form">
        <input v-model="newType.name" placeholder="Name (e.g. Subheading)" class="ds-input" />
        <div class="type-add-row">
          <input v-model="newType.fontSize" placeholder="Font Size (1rem)" class="ds-input-sm" />
          <input v-model="newType.fontWeight" placeholder="Weight (600)" class="ds-input-sm" />
        </div>
        <input v-model="newType.fontFamily" placeholder="Font Family (Inter)" class="ds-input" />
        <div class="form-actions">
          <button class="btn-primary" @click="confirmAddType">Add</button>
          <button class="btn-cancel" @click="addingType = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- ─── SPACING ──────────────────────────────────────────────────────── -->
    <div v-if="tab === 'spacing'" class="ds-content">
      <div class="ds-section-header">
        <span>Spacing Scale</span>
        <button class="add-btn" @click="addingSpace = !addingSpace">+ Add</button>
      </div>

      <div class="space-list">
        <div v-for="s in ds.tokens.spacing" :key="s.id" class="space-token">
          <div class="space-bar-wrap">
            <div class="space-bar" :style="{ width: clampSpacingViz(s.value) }"></div>
          </div>
          <div class="space-info">
            <span class="space-name">{{ s.name }}</span>
            <input
              class="space-value"
              :value="s.value"
              @change="(e) => ds.updateSpacing(s.id, { value: (e.target as HTMLInputElement).value })"
            />
            <span class="var-badge">var(--space-{{ s.id }})</span>
          </div>
          <button class="del-btn-inline" @click="ds.removeSpacing(s.id)">✕</button>
        </div>
      </div>

      <div v-if="addingSpace" class="add-form">
        <input v-model="newSpace.name" placeholder="Name (e.g. 5xl)" class="ds-input" />
        <input v-model="newSpace.value" placeholder="Value (128px)" class="ds-input" />
        <div class="form-actions">
          <button class="btn-primary" @click="confirmAddSpace">Add</button>
          <button class="btn-cancel" @click="addingSpace = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- ─── EXPORT ───────────────────────────────────────────────────────── -->
    <div v-if="tab === 'export'" class="ds-content">
      <div class="ds-section-header"><span>Export Tokens</span></div>

      <div class="export-tabs">
        <button :class="{ active: exportMode === 'css' }" @click="exportMode = 'css'">CSS Variables</button>
        <button :class="{ active: exportMode === 'json' }" @click="exportMode = 'json'">JSON</button>
      </div>

      <pre class="export-preview">{{ exportMode === 'css' ? ds.exportTokensAsCSS() : ds.exportTokensAsJSON() }}</pre>

      <div class="export-actions">
        <button class="btn-primary" @click="copyExport">📋 Copy to Clipboard</button>
        <button class="btn-secondary" @click="ds.resetToDefaults">⚡ Reset to Defaults</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDesignSystemStore } from '../store/designSystem';

const ds = useDesignSystemStore();
const tab = ref<'colors' | 'typography' | 'spacing' | 'export'>('colors');
const exportMode = ref<'css' | 'json'>('css');

// Color state
const addingColor = ref(false);
const newColor = ref({ name: '', value: '#6366f1' });

function confirmAddColor() {
  if (!newColor.value.name) return;
  ds.addColor({ name: newColor.value.name, value: newColor.value.value });
  newColor.value = { name: '', value: '#6366f1' };
  addingColor.value = false;
}

// Typography state
const addingType = ref(false);
const newType = ref({ name: '', fontSize: '1rem', fontWeight: '400', fontFamily: 'Inter', lineHeight: '1.5' });

function confirmAddType() {
  if (!newType.value.name) return;
  ds.addTypography({ ...newType.value });
  newType.value = { name: '', fontSize: '1rem', fontWeight: '400', fontFamily: 'Inter', lineHeight: '1.5' };
  addingType.value = false;
}

// Spacing state
const addingSpace = ref(false);
const newSpace = ref({ name: '', value: '16px' });

function confirmAddSpace() {
  if (!newSpace.value.name) return;
  ds.addSpacing({ name: newSpace.value.name, value: newSpace.value.value });
  newSpace.value = { name: '', value: '16px' };
  addingSpace.value = false;
}

// Utility
function clampFontSize(size: string): string {
  const px = parseFloat(size) * (size.includes('rem') ? 16 : 1);
  const clamped = Math.min(px, 22);
  return `${clamped}px`;
}

function clampSpacingViz(value: string): string {
  const px = parseFloat(value);
  return `${Math.min(px, 120)}px`;
}

async function copyExport() {
  const content = exportMode.value === 'css' ? ds.exportTokensAsCSS() : ds.exportTokensAsJSON();
  await navigator.clipboard.writeText(content);
}
</script>

<style scoped>
.design-system { display: flex; flex-direction: column; height: 100%; overflow: hidden; background: var(--bg-sidebar); }

/* Tab Nav */
.ds-tabs { display: flex; border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface-alt); flex-shrink: 0; }
.ds-tabs button { flex: 1; padding: 10px 4px; background: none; border: none; color: var(--text-muted); font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ds-tabs button.active { color: var(--brand-primary); border-bottom-color: var(--brand-primary); background: var(--bg-sidebar); }
.tab-icon { font-size: 14px; }

/* Content area */
.ds-content { flex: 1; overflow-y: auto; padding: 12px; }
.ds-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ds-section-header span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
.add-btn { font-size: 11px; background: var(--bg-input); color: var(--brand-primary); border: 1px solid var(--brand-primary); border-radius: 4px; padding: 3px 8px; cursor: pointer; }
.add-btn:hover { background: var(--bg-surface-alt); }

/* Color Section */
.color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.color-token { display: flex; flex-direction: column; gap: 4px; }
.color-swatch { height: 40px; border-radius: 6px; border: 1px solid var(--border-main); position: relative; cursor: pointer; }
.color-swatch:hover .del-btn { opacity: 1; }
.del-btn { position: absolute; top: 2px; right: 2px; background: var(--bg-main); border: none; color: var(--text-main); font-size: 9px; border-radius: 2px; cursor: pointer; opacity: 0; transition: opacity 0.2s; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }
.color-name { width: 100%; background: transparent; border: none; color: var(--text-muted); font-size: 10px; text-align: center; outline: none; padding: 0; }
.color-value { width: 100%; height: 18px; border: none; border-radius: 2px; cursor: pointer; background: var(--bg-input); }

/* Add Form */
.add-form { margin-top: 16px; background: var(--bg-surface-alt); border: 1px solid var(--border-main); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.ds-input { width: 100%; background: var(--bg-input); border: 1px solid var(--border-main); border-radius: 6px; padding: 7px 10px; color: var(--text-main); font-size: 12px; outline: none; box-sizing: border-box; }
.ds-input-sm { flex: 1; background: var(--bg-input); border: 1px solid var(--border-main); border-radius: 6px; padding: 5px 8px; color: var(--text-main); font-size: 11px; outline: none; min-width: 0; }
.color-input-large { height: 36px; border: none; border-radius: 6px; cursor: pointer; flex-shrink: 0; }
.color-pick-row, .type-add-row { display: flex; gap: 8px; align-items: center; }
.form-actions { display: flex; gap: 8px; }
.btn-primary { flex: 1; padding: 7px; background: var(--brand-primary); border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 12px; }
.btn-primary:hover { background: var(--brand-primary-hover); }
.btn-cancel { padding: 7px 12px; background: transparent; border: 1px solid var(--border-main); color: var(--text-muted); border-radius: 6px; cursor: pointer; font-size: 12px; }
.btn-secondary { flex: 1; padding: 7px; background: var(--bg-surface-alt); border: 1px solid var(--border-main); color: var(--text-muted); border-radius: 6px; cursor: pointer; font-size: 12px; }

/* Typography */
.type-list { display: flex; flex-direction: column; gap: 8px; }
.type-token { background: var(--bg-surface-alt); border: 1px solid var(--border-main); border-radius: 6px; padding: 10px; }
.type-preview { color: var(--text-main); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.type-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.type-meta span { font-size: 10px; color: var(--text-dim); }
.var-badge { background: var(--bg-main); color: var(--brand-secondary); padding: 1px 5px; border-radius: 3px; font-size: 9px; font-family: monospace; }
.type-controls { display: flex; gap: 6px; align-items: center; }
.del-btn-inline { background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 12px; padding: 4px; flex-shrink: 0; }
.del-btn-inline:hover { color: #ef4444; }

/* Spacing */
.space-list { display: flex; flex-direction: column; gap: 6px; }
.space-token { display: flex; align-items: center; gap: 10px; background: var(--bg-surface-alt); border: 1px solid var(--border-main); border-radius: 6px; padding: 8px; }
.space-bar-wrap { width: 100px; height: 8px; background: var(--bg-main); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
.space-bar { height: 100%; background: linear-gradient(to right, var(--brand-primary), var(--brand-secondary)); border-radius: 4px; }
.space-info { flex: 1; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.space-name { font-size: 11px; color: var(--text-main); font-weight: 600; min-width: 24px; }
.space-value { width: 60px; background: transparent; border: 1px solid var(--border-main); border-radius: 4px; padding: 2px 6px; color: var(--text-muted); font-size: 11px; outline: none; }

/* Export */
.export-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.export-tabs button { flex: 1; padding: 6px; background: var(--bg-input); border: 1px solid var(--border-main); color: var(--text-muted); border-radius: 6px; cursor: pointer; font-size: 11px; }
.export-tabs button.active { border-color: var(--brand-primary); color: var(--brand-primary); }
.export-preview { background: var(--bg-main); border: 1px solid var(--border-main); border-radius: 6px; padding: 12px; font-size: 10px; color: var(--text-muted); font-family: 'Fira Code', monospace; white-space: pre-wrap; max-height: 280px; overflow-y: auto; margin-bottom: 12px; }
.export-actions { display: flex; flex-direction: column; gap: 8px; }
</style>
