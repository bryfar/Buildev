<template>
  <div class="ai-conversation-root" v-if="isVisible">
    <div class="ai-composer shadow-glow">
      <div class="composer-header">
        <div class="composer-tabs">
          <button class="tab-item active">Edit</button>
          <button class="tab-item">Chat</button>
        </div>
        <div class="composer-actions">
          <button class="icon-btn" title="Add Image"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
          <button class="icon-btn" @click="$emit('close')">×</button>
        </div>
      </div>
      
      <div class="composer-body">
        <div class="composer-input-wrapper">
          <div class="sparkle-icon">✨</div>
          <textarea 
            v-model="query" 
            placeholder="Ask AI to edit or generate..." 
            @keyup.enter.exact.prevent="handleSubmit"
            ref="inputRef"
          ></textarea>
        </div>
      </div>

      <div class="composer-footer">
        <div class="suggestion-chips">
          <div class="chip" @click="query = 'Make it responsive'">Make it responsive</div>
          <div class="chip" @click="query = 'Add a hero section'">Add hero</div>
          <div class="chip" @click="query = 'Fix alignment'">Fix alignment</div>
        </div>
        <div class="submit-hint">Enter to Apply</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

defineProps<{ isVisible: boolean }>();
const emit = defineEmits(["submit", "close"]);

const query = ref("");
const inputRef = ref<HTMLTextAreaElement | null>(null);

onMounted(() => {
  if (inputRef.value) inputRef.value.focus();
});

function handleSubmit() {
  if (!query.value.trim()) return;
  emit("submit", query.value);
  query.value = "";
}
</script>

<style scoped>
.ai-conversation-root {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 90%;
  max-width: 600px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

.ai-composer {
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(138, 77, 245, 0.4);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
}

.composer-header {
  height: 36px;
  background: rgba(0,0,0,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.composer-tabs { display: flex; gap: 4px; height: 100%; }
.tab-item {
  background: transparent;
  border: none;
  color: #888;
  font-size: 11px;
  font-weight: 700;
  padding: 0 12px;
  cursor: pointer;
  height: 100%;
  border-bottom: 2px solid transparent;
}
.tab-item.active { color: #fff; border-bottom-color: var(--brand-primary, #8a4df5); }

.composer-actions { display: flex; gap: 8px; }
.icon-btn { background: transparent; border: none; color: #888; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { color: #fff; }

.composer-body { padding: 16px; }
.composer-input-wrapper { display: flex; gap: 12px; align-items: flex-start; }
.sparkle-icon { font-size: 18px; color: #8a4df5; margin-top: 4px; }

textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;
  height: 60px;
  font-family: inherit;
}

.composer-footer {
  padding: 8px 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.suggestion-chips { display: flex; gap: 8px; }
.chip {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}
.chip:hover { background: rgba(138, 77, 245, 0.2); border-color: #8a4df5; color: #fff; }

.submit-hint { font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

.shadow-glow { box-shadow: 0 0 30px rgba(138, 77, 245, 0.15); }
</style>
