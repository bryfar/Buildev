<template>
  <div v-if="store.currentPage" class="preview-container">
    <div class="preview-toolbar">
      <div class="status">Preview Mode - {{ store.currentPage.name }}</div>
      <div class="controls">
        <select v-model="presetId" class="preset-select">
          <option v-for="p in presets" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>
        <div class="size-controls">
          <label class="size-label">W</label>
          <input v-model.number="customWidth" class="size-input" type="number" min="240" max="2000" />
          <label class="size-label">H</label>
          <input v-model.number="customHeight" class="size-input" type="number" min="240" max="2000" />
          <button class="btn-sm" @click="applyCustom">Apply</button>
        </div>
        <span class="sep">|</span>
        <button class="btn-primary-sm" @click="backToEditor">Back to Editor</button>
      </div>
    </div>
    
    <div class="preview-canvas-wrapper">
      <div class="device-shell" :class="activePreset.shellClass">
        <div class="device-topbar" v-if="activePreset.topBarLabel">
          {{ activePreset.topBarLabel }}
        </div>
        <div class="preview-canvas" :style="canvasStyle">
        <BSBlockRenderer 
          v-for="block in store.currentPage.blocks" 
          :key="block.id" 
          :block="block" 
        />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">Loading preview...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePagesStore } from "../store/pages";
import BSBlockRenderer from "../components/blocks/BSBlockRenderer.vue";

const route = useRoute();
const router = useRouter();
const store = usePagesStore();

type PreviewPreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  shellClass: string;
  topBarLabel?: string;
};

const presets: PreviewPreset[] = [
  { id: "ios-iphone", label: "iOS · iPhone", width: 390, height: 844, shellClass: "shell-phone ios", topBarLabel: "iPhone" },
  { id: "android-phone", label: "Android · Phone", width: 412, height: 915, shellClass: "shell-phone android", topBarLabel: "Android" },
  { id: "ipad", label: "iOS · iPad", width: 820, height: 1180, shellClass: "shell-tablet ios", topBarLabel: "iPad" },
  { id: "macbook", label: "macOS · Mac", width: 1440, height: 900, shellClass: "shell-laptop mac", topBarLabel: "macOS" },
  { id: "windows", label: "Windows · Laptop", width: 1366, height: 768, shellClass: "shell-laptop win", topBarLabel: "Windows" },
];

const presetId = ref<string>(presets[0].id);
const customWidth = ref<number>(presets[0].width);
const customHeight = ref<number>(presets[0].height);

const activePreset = computed(() => presets.find((p) => p.id === presetId.value) ?? presets[0]);

const canvasStyle = computed(() => ({
  width: `${customWidth.value}px`,
  height: `${customHeight.value}px`,
}));

function applyCustom() {
  // inputs already bound; this button is here for UX consistency
}

watch(
  () => presetId.value,
  (id) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    customWidth.value = p.width;
    customHeight.value = p.height;
  },
);

onMounted(() => {
  store.loadPage(route.params.id as string);
});

function backToEditor() {
  router.push(`/editor/${route.params.id}`);
}
</script>

<style scoped>
.preview-container { height: 100vh; display: flex; flex-direction: column; background: #f8fafc; }
.preview-toolbar { height: 50px; background: #0f1117; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid #2a2d3a; flex-shrink: 0; }
.status { font-size: 14px; font-weight: 500; }
.controls { display: flex; gap: 8px; align-items: center; }
.sep { color: #334155; margin: 0 8px; }

.btn-sm { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.btn-sm.active { background: #6366f1; border-color: #6366f1; color: white; }
.btn-primary-sm { background: #6366f1; border: none; color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }

.preview-canvas-wrapper { flex: 1; overflow: auto; display: flex; justify-content: center; padding: 40px 0; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px; transition: all 0.3s ease; }
.device-shell { padding: 22px; border-radius: 22px; background: rgba(15, 17, 23, 0.08); border: 1px solid rgba(15,17,23,0.12); }
.device-topbar { font-size: 12px; font-weight: 700; color: rgba(15,17,23,0.7); margin-bottom: 10px; display: flex; justify-content: center; }
.preview-canvas { background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.18); border-radius: 14px; overflow: auto; }

.shell-phone { border-radius: 28px; }
.shell-tablet { border-radius: 24px; }
.shell-laptop { border-radius: 18px; }

.shell-phone.ios { background: rgba(99, 102, 241, 0.08); border-color: rgba(99,102,241,0.15); }
.shell-phone.android { background: rgba(16, 185, 129, 0.08); border-color: rgba(16,185,129,0.15); }
.shell-laptop.win { background: rgba(59, 130, 246, 0.08); border-color: rgba(59,130,246,0.15); }
.shell-laptop.mac { background: rgba(244, 63, 94, 0.08); border-color: rgba(244,63,94,0.15); }

.preset-select { background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
.size-controls { display: flex; align-items: center; gap: 6px; }
.size-input { width: 84px; background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
.size-label { font-size: 11px; color: #94a3b8; margin-left: 6px; }

.loading { height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #64748b; }
</style>
