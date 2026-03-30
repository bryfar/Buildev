<template>
  <div class="array-editor">
    <div class="items-list">
      <div v-for="(item, index) in localValue" :key="index" class="array-item">
        <div class="item-header">
          <span class="item-index">Item {{ index + 1 }}</span>
          <button class="btn-icon" @click="removeItem(index)">✕</button>
        </div>
        <input v-if="typeof item === 'string' || typeof item === 'number'" type="text" v-model="localValue[index]" @blur="commit" />
        <textarea v-else :value="JSON.stringify(localValue[index])" @blur="updateComplexItem(index, $event)"></textarea>
      </div>
    </div>
    <button class="btn-add" @click="addItem">+ Add Item</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { usePagesStore } from "../../../store/pages";

const props = defineProps<{ blockId: string; propKey: string; value: any[] }>();
const store = usePagesStore();

const localValue = ref([...props.value]);

watch(() => props.value, (newVal) => {
  localValue.value = [...newVal];
}, { deep: true });

function commit() {
  store.updateBlock(props.blockId, { [props.propKey]: localValue.value });
}

function addItem() {
  const template = localValue.value.length ? (typeof localValue.value[0] === 'object' ? {} : "") : "";
  localValue.value.push(template);
  commit();
}

function removeItem(index: number) {
  localValue.value.splice(index, 1);
  commit();
}

function updateComplexItem(index: number, e: Event) {
  try {
    const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);
    localValue.value[index] = parsed;
    commit();
  } catch (err) {}
}
</script>

<style scoped>
.array-editor { display: flex; flex-direction: column; gap: 8px; border-left: 2px solid var(--border-subtle); padding-left: 12px; }
.array-item { background: var(--bg-surface-alt); padding: 10px; border-radius: 8px; border: 1px solid var(--border-main); }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.item-index { font-size: 10px; color: var(--text-dim); font-weight: 700; text-transform: uppercase; }
.btn-icon { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; padding: 4px; }
input { 
  width: 100%; box-sizing: border-box; background: var(--bg-input); 
  border: 1px solid var(--border-main); border-radius: 6px; padding: 6px 10px; 
  color: var(--text-main); font-size: 12px; outline: none; 
}
textarea { 
  width: 100%; box-sizing: border-box; background: var(--bg-input); 
  border: 1px solid var(--border-main); border-radius: 6px; padding: 10px; 
  color: var(--text-main); font-size: 11px; outline: none; height: 60px; 
  font-family: monospace; resize: vertical; 
}
.btn-add { 
  background: var(--bg-surface); color: var(--brand-primary); 
  border: 1px dashed var(--brand-primary); padding: 8px; border-radius: 8px; 
  font-size: 11px; cursor: pointer; text-transform: uppercase; font-weight: 700; 
  transition: all 0.2s;
}
.btn-add:hover { background: var(--brand-primary); color: #fff; border-style: solid; }
</style>
