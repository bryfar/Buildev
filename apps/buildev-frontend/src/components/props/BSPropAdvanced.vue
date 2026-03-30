<template>
  <section class="prop-section">
    <p class="section-title">Advanced</p>
    <div class="prop-list">
      <div class="prop-item">
        <label>Custom CSS Classes</label>
        <input type="text" :value="val('customClasses')" @input="update('customClasses', $event)" placeholder="ex: bg-red-500 shadow-lg text-center" />
        <small class="help-text">Add any utility classes (e.g. Tailwind) separated by spaces.</small>
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
  const value = target.value;

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
.prop-section { padding: 16px; border-bottom: 1px solid #2a2d3a; }
.section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; color: #64748b; }
.prop-list { display: flex; flex-direction: column; gap: 12px; }
.prop-item { display: flex; flex-direction: column; gap: 6px; }
.prop-item label { font-size: 11px; color: #cbd5e1; }
.prop-item input { background: #0f1117; border: 1px solid #2a2d3a; border-radius: 6px; padding: 8px; color: #e2e8f0; font-size: 12px; outline: none; }
.help-text { font-size: 9px; color: #64748b; margin-top: 2px; }
</style>
