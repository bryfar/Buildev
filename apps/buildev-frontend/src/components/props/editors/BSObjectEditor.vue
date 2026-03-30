<template>
  <div class="object-editor">
    <textarea :value="stringValue" @blur="commit" placeholder="{ &quot;key&quot;: &quot;value&quot; }"></textarea>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { usePagesStore } from "../../../store/pages";

const props = defineProps<{ blockId: string; propKey: string; value: any }>();
const store = usePagesStore();

const stringValue = ref(JSON.stringify(props.value, null, 2));
const error = ref("");

watch(() => props.value, (newVal) => {
  stringValue.value = JSON.stringify(newVal, null, 2);
  error.value = "";
}, { deep: true });

function commit(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  try {
    const parsed = JSON.parse(target.value);
    error.value = "";
    store.updateBlock(props.blockId, { [props.propKey]: parsed });
  } catch (err: any) {
    error.value = "Invalid JSON: " + err.message;
  }
}
</script>

<style scoped>
.object-editor { display: flex; flex-direction: column; gap: 4px; border-left: 2px solid var(--border-subtle); padding-left: 12px; }
textarea { 
  width: 100%; box-sizing: border-box; background: var(--bg-input); 
  border: 1px solid var(--border-main); border-radius: 6px; padding: 10px; 
  color: var(--text-main); font-size: 11px; outline: none; height: 100px; 
  font-family: 'JetBrains Mono', 'Fira Code', monospace; resize: vertical; 
}
.error-msg { color: #f87171; font-size: 10px; font-weight: 600; margin-top: 4px; }
</style>
