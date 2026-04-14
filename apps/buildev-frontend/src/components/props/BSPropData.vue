<template>
  <section class="prop-section" v-if="dataProps.length > 0">
    <p class="section-title">Data & Content</p>
    <div class="prop-list">
      <div v-for="prop in dataProps" :key="prop.key" class="prop-item">
        <div class="label-row">
          <label>{{ formatLabel(prop.key) }}</label>
          <span class="type-badge">{{ getType(prop.value) }}</span>
        </div>
        
        <!-- Array Editor -->
        <BSArrayEditor v-if="Array.isArray(prop.value)" :blockId="block.id" :propKey="prop.key" :value="prop.value" />
        
        <!-- Object Editor -->
        <BSObjectEditor v-else-if="isObject(prop.value)" :blockId="block.id" :propKey="prop.key" :value="prop.value" />
        
        <!-- Boolean Toggle -->
        <label class="switch" v-else-if="typeof prop.value === 'boolean'">
          <input type="checkbox" :checked="prop.value" @change="updateChecked(prop.key, $event)" />
          <span class="slider"></span>
        </label>
        
        <!-- Number Input -->
        <input v-else-if="typeof prop.value === 'number'" type="number" :value="prop.value" @input="updateNumber(prop.key, $event)" />

        <!-- String Input -->
        <input v-else type="text" :value="prop.value" @input="updateString(prop.key, $event)" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePagesStore } from "../../store/pages";
import type { BSBlock } from "@buildersite/sdk";
import { DESIGN_PROP_KEYS } from "../../utils/designPropKeys";
import BSArrayEditor from "./editors/BSArrayEditor.vue";
import BSObjectEditor from "./editors/BSObjectEditor.vue";

const props = defineProps<{ block: BSBlock }>();
const store = usePagesStore();

const handledKeys = new Set<string>([
  ...DESIGN_PROP_KEYS,
  "columns",
  "src",
  "content",
  "alt",
  "label",
  "href",
  "variant",
  "level",
]);

const dataProps = computed(() => {
  const allProps = props.block.props;
  return Object.keys(allProps)
    .filter((k) => !handledKeys.has(k))
    .map(key => ({
      key,
      value: allProps[key]
    }));
});

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function getType(val: unknown) {
  if (Array.isArray(val)) return 'Array';
  if (val === null) return 'Null';
  return typeof val;
}

function isObject(val: unknown) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function updateString(prop: string, e: Event) {
  const target = e.target as HTMLInputElement;
  store.updateBlock(props.block.id, { [prop]: target.value });
}

function updateNumber(prop: string, e: Event) {
  const target = e.target as HTMLInputElement;
  store.updateBlock(props.block.id, { [prop]: Number(target.value) });
}

function updateChecked(prop: string, e: Event) {
  const target = e.target as HTMLInputElement;
  store.updateBlock(props.block.id, { [prop]: target.checked });
}
</script>

<style scoped>
.prop-section { padding: 16px; border-bottom: 1px solid var(--border-subtle); }
.section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; color: var(--text-muted); letter-spacing: 0.1em; }
.prop-list { display: flex; flex-direction: column; gap: 16px; }
.prop-item { display: flex; flex-direction: column; gap: 8px; }
.label-row { display: flex; justify-content: space-between; align-items: center; }
.prop-item label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.type-badge { font-size: 9px; color: var(--brand-primary); background: var(--bg-surface-alt); padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
.prop-item input[type="text"], .prop-item input[type="number"] { 
  background: var(--bg-input); border: 1px solid var(--border-main); border-radius: 6px; 
  padding: 8px; color: var(--text-main); font-size: 12px; outline: none; 
}

/* Toggle Switch styles */
.switch { position: relative; display: inline-block; width: 34px; height: 18px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-main); transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: var(--bg-surface); transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--brand-primary); }
input:checked + .slider:before { transform: translateX(16px); }
</style>
