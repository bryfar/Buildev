<template>
  <section class="prop-section">
    <p class="section-title">Spacing</p>
    <div class="prop-grid">
      <div class="prop-item">
        <label>Margin</label>
        <input type="text" :value="val('margin')" @input="update('margin', $event)" placeholder="ex: 10px auto" />
      </div>
      <div class="prop-item">
        <label>Padding</label>
        <input type="text" :value="val('padding')" @input="update('padding', $event)" placeholder="ex: 20px 0" />
      </div>
      <div class="prop-item" v-if="block.type === 'spacer'">
        <label>Height (px)</label>
        <input type="number" :value="val('height')" @input="update('height', $event)" />
      </div>
      <div class="prop-item">
        <label>Width</label>
        <input type="text" :value="val('width')" @input="update('width', $event)" placeholder="ex: 100% or 300px" />
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
  const target = e.target as HTMLInputElement;
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
.prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.prop-item { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
.prop-item label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.prop-item input { 
  background: var(--bg-input); border: 1px solid var(--border-main); border-radius: 6px; 
  padding: 8px; color: var(--text-main); font-size: 12px; outline: none; 
}
</style>
