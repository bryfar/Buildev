<template>
  <section class="prop-section">
    <p class="section-title">Style & Typography</p>
    <div class="prop-list">
      
      <!-- Text Content for Text/Heading Blocks -->
      <div v-if="val('content') !== undefined" class="prop-item">
        <label>Text Content</label>
        <textarea :value="val('content')" @input="update('content', $event)"></textarea>
      </div>

      <BSFontPicker :blockId="block.id" propKey="fontFamily" :modelValue="val('fontFamily')" />

      <div class="prop-grid">
        <div class="prop-item">
          <label>Font Size</label>
          <input type="number" :value="val('fontSize')" @input="update('fontSize', $event)" placeholder="ex: 16" />
        </div>
        <div class="prop-item">
          <label>Weight</label>
          <select :value="val('fontWeight') || 'normal'" @change="update('fontWeight', $event)">
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="300">Light</option>
            <option value="600">Semi-Bold</option>
            <option value="800">Extra-Bold</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Align</label>
          <select :value="val('textAlign') || 'left'" @change="update('textAlign', $event)">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Text Color</label>
          <div class="color-picker">
            <input type="color" :value="val('color') || '#000000'" @input="update('color', $event)" />
            <input type="text" :value="val('color')" @input="update('color', $event)" placeholder="#000" />
          </div>
        </div>
      </div>

      <div class="prop-separator"></div>

      <div class="prop-grid">
        <div class="prop-item">
          <label>Background</label>
          <div class="color-picker">
            <input type="color" :value="val('backgroundColor') || '#ffffff'" @input="update('backgroundColor', $event)" />
            <input type="text" :value="val('backgroundColor')" @input="update('backgroundColor', $event)" placeholder="#fff" />
          </div>
        </div>
        <div class="prop-item">
          <label>Border Radius</label>
          <input type="text" :value="val('borderRadius')" @input="update('borderRadius', $event)" placeholder="ex: 8px" />
        </div>
        <div class="prop-item" style="grid-column: span 2;">
          <label>Border</label>
          <input type="text" :value="val('border')" @input="update('border', $event)" placeholder="ex: 1px solid #ccc" />
        </div>
      </div>

      <div v-if="block.type === 'image'" class="prop-item" style="margin-top:12px;">
        <label>Source URL</label>
        <div class="input-with-button">
          <input type="text" :value="val('src')" @input="update('src', $event)" />
          <button class="btn-icon" @click="$emit('openGallery')">🖼</button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { usePagesStore } from "../../store/pages";
import type { BSBlock } from "@buildersite/sdk";
import BSFontPicker from "./editors/BSFontPicker.vue";

const props = defineProps<{ block: BSBlock }>();
defineEmits(['openGallery']);
const store = usePagesStore();

function val(prop: string) {
  const breakpoint = store.currentBreakpoint;
  const base = props.block.props;
  return (base.responsive as any)?.[breakpoint]?.[prop] ?? base[prop];
}

function update(prop: string, e: Event) {
  const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  let value: string | number = target.value;
  if (target.type === 'number') value = Number(value);

  const breakpoint = store.currentBreakpoint;
  if (breakpoint === 'desktop') {
    store.updateBlock(props.block.id, { [prop]: value });
  } else {
    const responsive = { ...(props.block.props.responsive as any) || {} };
    responsive[breakpoint] = { ...(responsive[breakpoint] || {}), [prop]: value };
    store.updateBlock(props.block.id, { responsive });
  }
}
</script>

<style scoped>
.prop-section { padding: 16px; border-bottom: 1px solid var(--border-subtle); }
.section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; color: var(--text-muted); letter-spacing: 0.1em; }
.prop-list { display: flex; flex-direction: column; gap: 12px; }
.prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.prop-item { display: flex; flex-direction: column; gap: 6px; }
.prop-item label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.prop-item input, .prop-item select, .prop-item textarea { 
  background: var(--bg-input); border: 1px solid var(--border-main); border-radius: 6px; 
  padding: 8px; color: var(--text-main); font-size: 12px; outline: none; 
}
.prop-item textarea { height: 60px; resize: vertical; }
.color-picker { display: flex; gap: 4px; }
.color-picker input[type="color"] { padding: 0; width: 32px; height: 32px; border: 1px solid var(--border-main); border-radius: 4px; cursor: pointer; }
.color-picker input[type="text"] { flex: 1; }
.prop-separator { height: 1px; background: var(--border-subtle); margin: 4px 0; }
.input-with-button { display: flex; gap: 4px; }
.input-with-button input { flex: 1; }
.btn-icon { background: var(--bg-surface-alt); border: 1px solid var(--border-main); color: var(--text-main); border-radius: 6px; padding: 0 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-icon:hover { background: var(--border-subtle); }
</style>
