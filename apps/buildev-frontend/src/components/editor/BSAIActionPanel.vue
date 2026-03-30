<template>
  <div class="ai-panel">
    <div class="ai-panel-header">
      <div class="ai-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.2 7.6 2.4-7.6 2.4-2.4 7.2-2.4-7.2-7.6-2.4 7.6-2.4L12 2z" fill="var(--brand-primary)"/></svg>
        <span>AI Assistant</span>
      </div>
      <button class="btn-close" @click="$emit('close')">×</button>
    </div>

    <div class="ai-panel-body">
      <!-- ── Reverse UI (Image to Site) ── -->
      <div class="ai-card">
        <div class="card-header">
          <strong>Reverse UI</strong>
          <span class="badge">PRO</span>
        </div>
        <p>Upload a screenshot and let AI generate the block structure automatically.</p>
        <div class="upload-area" @click="triggerFileInput" :class="{ loading: isAnalyzing }">
          <input type="file" ref="fileInput" hidden accept="image/*" @change="handleImageUpload" />
          <svg v-if="!isAnalyzing" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          <div v-else class="spinner"></div>
          <span>{{ isAnalyzing ? 'Analyzing Image...' : 'Click to upload screenshot' }}</span>
        </div>
      </div>

      <!-- ── Auto-Responsive ── -->
      <div class="ai-card">
        <div class="card-header">
          <strong>Auto-Responsive</strong>
        </div>
        <p>Generate optimized Tablet and Mobile layouts from your Desktop design.</p>
        <button class="btn-ai-action" :disabled="isGeneratingResponsive" @click="generateResponsive">
          <svg v-if="!isGeneratingResponsive" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7-7-7M5 12h14"/></svg>
          <div v-else class="spinner-sm"></div>
          <span>{{ isGeneratingResponsive ? 'Generating variants...' : 'Generate Variants' }}</span>
        </button>
      </div>

      <!-- ── Project Architecture ── -->
      <div class="ai-card">
        <div class="card-header">
          <strong>Project Architect</strong>
        </div>
        <p>Structure your project files and folders based on current design.</p>
        <button class="btn-ai-action" @click="generateArch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
          <span>Generate Structure</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { aiService } from '../../services/aiService';
import { usePagesStore } from '../../store/pages';

const emit = defineEmits(['close']);
const store = usePagesStore();
const fileInput = ref<HTMLInputElement | null>(null);
const isAnalyzing = ref(false);
const isGeneratingResponsive = ref(false);

function triggerFileInput() {
  if (!isAnalyzing.value) fileInput.value?.click();
}

async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  isAnalyzing.value = true;
  try {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      const blocks = await aiService.imageToCode(base64);
      if (store.currentPage) {
         store.currentPage.blocks = blocks;
         store.savePage();
      }
      isAnalyzing.value = false;
    };
  } catch (err) {
    console.error("AI: Image analysis failed", err);
    isAnalyzing.value = false;
  }
}

async function generateResponsive() {
  if (!store.currentPage) return;
  isGeneratingResponsive.value = true;
  try {
    const updatedPage = await aiService.generateResponsiveVariant(store.currentPage, 'mobile');
    // For now we just replace blocks or update variants
    if (updatedPage.variants) {
      store.currentPage.variants = updatedPage.variants;
    }
    alert("Responsive variants generated successfully!");
  } catch (err) {
    console.error("AI: Responsive generation failed", err);
  } finally {
    isGeneratingResponsive.value = false;
  }
}

function generateArch() {
  alert("AI Architecture generation started. This will structure your project folders.");
  // Implementation for Phase 16.3
}
</script>

<style scoped>
.ai-panel {
  position: absolute; top: 50px; right: 80px; width: 320px;
  background: var(--bg-surface); border: 1px solid var(--border-main);
  border-radius: 16px; box-shadow: var(--shadow-2xl); z-index: 1000;
  display: flex; flex-direction: column; overflow: hidden;
  animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn { from { transform: scale(0.9) translateY(-10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

.ai-panel-header {
  padding: 14px 16px; border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-surface-alt);
}
.ai-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; color: var(--text-main); }
.btn-close { background: none; border: none; font-size: 20px; color: var(--text-dim); cursor: pointer; }

.ai-panel-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; max-height: 500px; overflow-y: auto; }

.ai-card {
  padding: 16px; border: 1px solid var(--border-subtle); border-radius: 12px;
  background: var(--bg-surface); transition: all 0.2s;
}
.ai-card:hover { border-color: var(--brand-primary-light); background: var(--bg-surface-alt); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.card-header strong { font-size: 13px; color: var(--text-main); }
.badge { font-size: 9px; padding: 2px 6px; background: var(--brand-primary); color: #fff; border-radius: 4px; font-weight: 800; }
.ai-card p { font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; }

.upload-area {
  height: 80px; border: 2px dashed var(--border-main); border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; color: var(--text-dim); cursor: pointer; transition: all 0.2s;
}
.upload-area:hover { border-color: var(--brand-primary); color: var(--brand-primary); background: rgba(var(--brand-primary-rgb), 0.05); }
.upload-area.loading { pointer-events: none; opacity: 0.7; }
.upload-area span { font-size: 11px; font-weight: 600; }

.btn-ai-action {
  width: 100%; height: 36px; border-radius: 8px; border: 1px solid var(--brand-primary);
  background: #fff; color: var(--brand-primary); font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
  transition: all 0.2s;
}
.btn-ai-action:hover { background: var(--brand-primary); color: #fff; }
.btn-ai-action:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner { width: 24px; height: 24px; border: 3px solid var(--border-subtle); border-top-color: var(--brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
