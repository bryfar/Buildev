<template>
  <div class="studio-overlay-v2">
    <div class="overlay-content-v2">
      <div class="status-badge-v2">Building Architecture</div>
      <div class="step-progress-v2">
        <div 
          v-for="(s, i) in steps" 
          :key="i" 
          class="progress-bit-v2" 
          :class="{ 'done': s.done, 'active': s.active }"
        ></div>
      </div>
      <p class="status-msg-v2">
        <span v-if="activeStep">{{ activeStep.label }} in progress...</span>
        <span v-else>Thinking...</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  steps: { label: string; done: boolean; active: boolean }[]
}>();

const activeStep = computed(() => props.steps.find(s => s.active));
</script>

<style scoped>
.studio-overlay-v2 {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  z-index: 1000;
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 220px;
}

@keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.status-badge-v2 { font-size: 10px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }

.step-progress-v2 { display: flex; gap: 4px; margin-bottom: 12px; }
.progress-bit-v2 { flex: 1; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; position: relative; overflow: hidden; }
.progress-bit-v2.done { background: #10b981; transition: background 0.3s; }
.progress-bit-v2.active::after { 
  content: ''; position: absolute; inset: 0; 
  background: #8b5cf6; animation: loadingFill 2s infinite ease-in-out; 
}

@keyframes loadingFill { 0% { transform: translateX(-100%); } 50% { transform: translateX(0); } 100% { transform: translateX(100%); } }

.status-msg-v2 { font-size: 13px; font-weight: 600; color: #fff; margin: 0; }
</style>
