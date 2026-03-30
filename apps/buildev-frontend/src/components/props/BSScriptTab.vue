<template>
  <div class="script-tab">
    <div class="header">
      <div class="title-row">
        <h3>Page Script</h3>
        <span class="badge">JavaScript</span>
      </div>
      <p class="description">Write custom logic to fetch data or handle events. Access page data via the `data` object.</p>
    </div>
    
    <div class="editor-container">
      <textarea 
        v-model="script" 
        spellcheck="false" 
        placeholder="// e.g. data.items = await frappe.get_all('Item')"
        @input="onInput"
      ></textarea>
    </div>

    <div class="footer">
      <span class="status" v-if="isSaving">Saving...</span>
      <span class="status success" v-else-if="lastSaved">Saved {{ lastSaved }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { usePagesStore } from "../../store/pages";

const store = usePagesStore();
const script = ref("");
const isSaving = ref(false);
const lastSaved = ref("");

onMounted(() => {
  if (store.currentPage) {
    script.value = store.currentPage.script || "";
  }
});

// Watch for page changes
watch(() => store.currentPage?.id, (newId) => {
  if (newId && store.currentPage) {
    script.value = store.currentPage.script || "";
  }
});

let debounceTimer: any = null;
function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!store.currentPage) return;
    isSaving.value = true;
    try {
      await store.updatePage(store.currentPage.id, { script: script.value });
      lastSaved.value = new Date().toLocaleTimeString();
    } catch (err) {
      console.error("Failed to save script", err);
    } finally {
      isSaving.value = false;
    }
  }, 1000);
}
</script>

<style scoped>
.script-tab { display: flex; flex-direction: column; height: 100%; background: var(--bg-sidebar); }
.header { padding: 16px; border-bottom: 1px solid var(--border-subtle); }
.title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.title-row h3 { margin: 0; font-size: 14px; color: var(--text-main); }
.badge { font-size: 10px; background: var(--brand-primary); color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.description { font-size: 11px; color: var(--text-muted); margin: 0; line-height: 1.4; }

.editor-container { flex: 1; padding: 0; }
textarea {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: var(--brand-secondary);
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 13px;
  padding: 16px;
  resize: none;
  outline: none;
  line-height: 1.6;
}
.dark textarea { color: #a5b4fc; }
textarea::placeholder { color: var(--text-dim); }

.footer { padding: 8px 16px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; }
.status { font-size: 11px; color: var(--text-muted); }
.status.success { color: #10b981; }
</style>
