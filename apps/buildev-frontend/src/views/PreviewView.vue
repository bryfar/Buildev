<template>
  <div v-if="store.currentPage" class="preview-container">
    <div class="preview-toolbar">
      <div class="status">Preview Mode - {{ store.currentPage.name }}</div>
      <div class="controls">
        <button class="btn-sm" @click="breakpoint = 'desktop'" :class="{ active: breakpoint === 'desktop' }">Desktop</button>
        <button class="btn-sm" @click="breakpoint = 'tablet'" :class="{ active: breakpoint === 'tablet' }">Tablet</button>
        <button class="btn-sm" @click="breakpoint = 'mobile'" :class="{ active: breakpoint === 'mobile' }">Mobile</button>
        <span class="sep">|</span>
        <button class="btn-primary-sm" @click="backToEditor">Back to Editor</button>
      </div>
    </div>
    
    <div class="preview-canvas-wrapper" :class="breakpoint">
      <div class="preview-canvas">
        <BSBlockRenderer 
          v-for="block in store.currentPage.blocks" 
          :key="block.id" 
          :block="block" 
        />
      </div>
    </div>
  </div>
  <div v-else class="loading">Loading preview...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePagesStore } from "../store/pages";
import BSBlockRenderer from "../components/blocks/BSBlockRenderer.vue";

const route = useRoute();
const router = useRouter();
const store = usePagesStore();
const breakpoint = ref<'desktop' | 'tablet' | 'mobile'>('desktop');

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
.preview-canvas { background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.1); width: 100%; transition: width 0.3s ease; }

.preview-canvas-wrapper.desktop .preview-canvas { width: 1280px; }
.preview-canvas-wrapper.tablet .preview-canvas { width: 768px; }
.preview-canvas-wrapper.mobile .preview-canvas { width: 375px; }

.loading { height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #64748b; }
</style>
