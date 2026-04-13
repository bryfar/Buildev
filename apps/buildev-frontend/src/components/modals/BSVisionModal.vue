<template>
  <div class="vision-modal-overlay" @click.self="emit('close')">
    <div class="vision-modal" :class="{ 'is-loading': isLoading }">
      <div class="modal-header">
        <div class="ai-badge">
          <span class="sparkle">✨</span>
          AI Vision
        </div>
        <button class="btn-close" @click="emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div v-if="!isLoading" class="dropzone" 
             :class="{ 'is-dragover': isDragOver }"
             @dragover.prevent="isDragOver = true"
             @dragleave.prevent="isDragOver = false"
             @drop.prevent="handleDrop">
          
          <div v-if="!previewUrl" class="upload-placeholder">
            <div class="upload-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <h3>Drop an image to generate code</h3>
            <p>Upload a screenshot and let Buildev decompose it into elements.</p>
            <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" hidden />
            <button class="btn-browse" @click="$refs.fileInput.click()">Browse Files</button>
          </div>

          <div v-else class="preview-wrap">
            <img :src="previewUrl" class="image-preview" />
            <div class="preview-actions">
              <button class="btn-clear" @click="previewUrl = null">Remove</button>
              <button class="btn-generate" @click="generateFromVision">
                Generate Architecture
              </button>
            </div>
          </div>
        </div>

        <div v-else class="loading-state">
          <div class="vision-loader">
            <div class="scanner-line"></div>
            <img :src="previewUrl" class="scanning-preview" />
          </div>
          <div class="loading-text">
            <h2 class="animate-pulse">Analyzing Design...</h2>
            <p>{{ statusMessage }}</p>
          </div>
          <div class="loading-steps">
            <div v-for="(step, i) in steps" :key="i" class="step" :class="{ active: currentStep === i, done: currentStep > i }">
              <div class="step-dot"></div>
              <span>{{ step }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../store/auth";

const emit = defineEmits(['close', 'generated']);
const auth = useAuthStore();

const isLoading = ref(false);
const isDragOver = ref(false);
const previewUrl = ref<string | null>(null);
const base64Image = ref<string | null>(null);
const currentStep = ref(0);
const statusMessage = ref("Transcribing elements...");

const steps = [
  "Optical resolution",
  "Semantic decomposition",
  "AST mapping",
  "Finalizing nodes"
];

function handleDrop(e: DragEvent) {
  isDragOver.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) processFile(file);
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
}

function processFile(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
    base64Image.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

async function generateFromVision() {
  if (!base64Image.value) return;
  
  isLoading.value = true;
  currentStep.value = 0;
  
  // Simulate step progression for better UX
  const stepInterval = setInterval(() => {
    if (currentStep.value < steps.length - 1) currentStep.value++;
  }, 2000);

  try {
    const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${API}/api/ai/vision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: base64Image.value,
        context: "Create a modern, clean web layout from this screenshot."
      })
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.error ?? "Vision failed");

    clearInterval(stepInterval);
    currentStep.value = 3;
    statusMessage.value = "Success! Inserting nodes...";
    
    setTimeout(() => {
      emit('generated', json.data);
      emit('close');
    }, 1000);

  } catch (err: any) {
    alert("AI Vision Error: " + err.message);
    isLoading.value = false;
    clearInterval(stepInterval);
  }
}
</script>

<style scoped>
.vision-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.vision-modal {
  width: 100%;
  max-width: 600px;
  background: #0f1117;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transition: all 0.3s;
}

.vision-modal.is-loading {
  max-width: 500px;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(99, 102, 241, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #818cf8;
}

.btn-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.dropzone {
  border: 2px dashed rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.01);
}

.dropzone.is-dragover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.upload-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #64748b;
}

.dropzone h3 {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.dropzone p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}

.btn-browse {
  padding: 10px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-preview {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  background: #000;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.btn-clear {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-generate {
  flex: 2;
  padding: 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 20px 0;
}

.vision-loader {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 32px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.scanning-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #6366f1;
  box-shadow: 0 0 15px #6366f1;
  animation: scan 2s linear infinite;
  z-index: 2;
}

@keyframes scan {
  0% { top: 0; }
  50% { top: 100%; }
  100% { top: 0; }
}

.loading-text h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
}

.loading-text p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 32px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 240px;
  margin: 0 auto;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.3;
  transition: all 0.3s;
}

.step.active {
  opacity: 1;
  color: #6366f1;
}

.step.done {
  opacity: 0.6;
  color: #4ade80;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
