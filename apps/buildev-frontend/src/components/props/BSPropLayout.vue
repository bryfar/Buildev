<template>
  <section class="prop-section">
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
      <div class="prop-item" v-if="val('display') === 'flex' || val('display') === 'grid'">
        <label>Justify</label>
        <select :value="val('justifyContent') || 'flex-start'" @change="update('justifyContent', $event)">
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="space-between">Space Between</option>
          <option value="space-around">Space Around</option>
        </select>
      </div>
      <div class="prop-item" v-if="val('display') === 'flex' || val('display') === 'grid'">
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
      <div class="prop-item" v-if="val('display') === 'grid'">
        <label>Grid columns</label>
        <input type="text" :value="val('gridTemplateColumns')" @input="update('gridTemplateColumns', $event)" placeholder="1fr 1fr" />
      </div>
      <div class="prop-item" v-if="val('display') === 'grid'">
        <label>Grid rows</label>
        <input type="text" :value="val('gridTemplateRows')" @input="update('gridTemplateRows', $event)" placeholder="auto" />
      </div>
      <div class="prop-item" v-if="val('display') === 'grid'">
        <label>Auto flow</label>
        <select :value="val('gridAutoFlow') || 'row'" @change="update('gridAutoFlow', $event)">
          <option value="row">row</option>
          <option value="column">column</option>
          <option value="dense">dense</option>
          <option value="row dense">row dense</option>
        </select>
      </div>
      <div class="prop-item">
        <label>Gap (px/rem)</label>
        <input type="text" :value="val('gap')" @input="update('gap', $event)" placeholder="ex: 20px" />
      </div>
      <div class="prop-item" v-if="val('display') === 'flex' || val('display') === 'grid'">
        <label>Row gap</label>
        <input type="text" :value="val('rowGap')" @input="update('rowGap', $event)" />
      </div>
      <div class="prop-item" v-if="val('display') === 'flex' || val('display') === 'grid'">
        <label>Column gap</label>
        <input type="text" :value="val('columnGap')" @input="update('columnGap', $event)" />
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
  return (base.responsive as Record<string, Record<string, unknown>> | undefined)?.[breakpoint]?.[prop] ?? base[prop];
}

function update(prop: string, e: Event) {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  const value = target.value;

  const breakpoint = store.currentBreakpoint;
  if (breakpoint === "desktop") {
    store.updateBlock(props.block.id, { [prop]: value });
  } else {
    const responsive = { ...(props.block.props.responsive as Record<string, Record<string, unknown>>) || {} };
    responsive[breakpoint] = { ...(responsive[breakpoint] || {}), [prop]: value };
    store.updateBlock(props.block.id, { responsive });
  }
}
</script>

<style scoped>
.prop-section { padding: 0 0 4px; }
.prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.prop-item { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
.prop-item label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.prop-item input, .prop-item select { 
  background: var(--bg-input); border: 1px solid var(--border-main); border-radius: 6px; 
  padding: 8px; color: var(--text-main); font-size: 12px; outline: none; 
}
</style>
