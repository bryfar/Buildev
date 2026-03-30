<template>
  <section v-if="['container', 'columns', 'section', 'form'].includes(block.type)" class="prop-section">
    <p class="section-title">Layout</p>
    <div class="prop-grid">
      <div class="prop-item">
        <label>Display</label>
        <select :value="val('display') || 'block'" @change="update('display', $event)">
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
        </select>
      </div>
      <div class="prop-item" v-if="val('display') === 'flex'">
        <label>Direction</label>
        <select :value="val('flexDirection') || 'row'" @change="update('flexDirection', $event)">
          <option value="row">Horizontal (Row)</option>
          <option value="column">Vertical (Col)</option>
        </select>
      </div>
      <div class="prop-item" v-if="val('display') === 'flex'">
        <label>Justify</label>
        <select :value="val('justifyContent') || 'flex-start'" @change="update('justifyContent', $event)">
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="space-between">Space Between</option>
          <option value="space-around">Space Around</option>
        </select>
      </div>
      <div class="prop-item" v-if="val('display') === 'flex'">
        <label>Align</label>
        <select :value="val('alignItems') || 'stretch'" @change="update('alignItems', $event)">
          <option value="stretch">Stretch</option>
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
        </select>
      </div>
      <div class="prop-item" v-if="val('display') === 'flex'">
        <label>Wrap</label>
        <select :value="val('flexWrap') || 'nowrap'" @change="update('flexWrap', $event)">
          <option value="nowrap">No Wrap</option>
          <option value="wrap">Wrap</option>
        </select>
      </div>
      <div class="prop-item">
        <label>Gap (px/rem)</label>
        <input type="text" :value="val('gap')" @input="update('gap', $event)" placeholder="ex: 20px" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePagesStore } from "../../store/pages";
import type { BSBlock } from "@buildersite/sdk";

const props = defineProps<{ block: BSBlock }>();
const store = usePagesStore();

function val(prop: string) {
  const breakpoint = store.currentBreakpoint;
  const base = props.block.props;
  return (base.responsive as any)?.[breakpoint]?.[prop] ?? base[prop];
}

function update(prop: string, e: Event) {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  let value: string | number = target.value;
  if (!isNaN(Number(value)) && value.trim() !== '') value = Number(value);

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
.prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.prop-item { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
.prop-item label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.prop-item input, .prop-item select { 
  background: var(--bg-input); border: 1px solid var(--border-main); border-radius: 6px; 
  padding: 8px; color: var(--text-main); font-size: 12px; outline: none; 
}
</style>
