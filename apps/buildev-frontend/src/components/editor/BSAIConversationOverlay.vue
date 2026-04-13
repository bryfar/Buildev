<template>
  <div v-if="isVisible" class="ai-overlay">
    <div class="chat-panel">
      <header class="panel-head">
        <div class="head-left">
          <span class="badge">Composer</span>
          <span class="head-title">Agent</span>
        </div>
        <div class="model-picker-wrap">
          <label class="model-label" for="ai-model-picker">Model</label>
          <select id="ai-model-picker" v-model="selectedModel" class="model-picker">
            <option v-for="model in modelOptions" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>
        <div class="head-actions">
          <button type="button" class="ghost-icon" title="Close" @click="$emit('close')">×</button>
        </div>
      </header>

      <div ref="scrollRef" class="thread">
        <div
          v-for="(m, i) in thread"
          :key="i"
          class="thread-msg"
          :class="m.role"
        >
          <div v-if="m.role === 'assistant'" class="avatar" aria-hidden="true">✦</div>
          <div class="bubble">{{ m.text }}</div>
        </div>
        <div v-if="isThinking" class="thread-msg assistant">
          <div class="avatar dim" aria-hidden="true">✦</div>
          <div class="bubble thinking">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <div class="chips">
        <button type="button" class="chip" @click="applyChip('Tighten spacing and hierarchy')">Spacing</button>
        <button type="button" class="chip" @click="applyChip('Add a strong hero with CTA')">Hero</button>
        <button type="button" class="chip" @click="applyChip('Improve mobile layout')">Mobile</button>
      </div>

      <div class="dock">
        <textarea
          ref="inputRef"
          v-model="draft"
          class="dock-input"
          rows="2"
          placeholder="Describe what you want changed…"
          @keydown.enter.exact.prevent="submit"
        />
        <div class="dock-meta">
          <span class="hint">Enter to send · Shift+Enter newline</span>
          <button type="button" class="send" :disabled="!draft.trim() || isThinking" @click="submit">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  prompt?: string;
}>();

const emit = defineEmits<{
  submit: [{ query: string; model: string }];
  close: [];
}>();

const scrollRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const draft = ref('');
const isThinking = ref(false);
const modelOptions = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o' }
];
const selectedModel = ref(modelOptions[0].id);

const thread = ref<{ role: 'user' | 'assistant'; text: string }[]>([]);

function seedThread() {
  const base =
    'I am ready to help shape this page. Tell me what to add, remove, or restyle. I will follow your canvas and blocks.';
  const hint = props.prompt?.trim()
    ? ` Context from this page: ${props.prompt.trim()}`
    : '';
  thread.value = [{ role: 'assistant', text: base + hint }];
}

watch(
  () => props.isVisible,
  (v) => {
    if (v) {
      seedThread();
      isThinking.value = false;
      draft.value = '';
      selectedModel.value = modelOptions[0].id;
      nextTick(() => {
        inputRef.value?.focus();
        scrollToEnd();
      });
    }
  }
);

function scrollToEnd() {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  });
}

function applyChip(text: string) {
  draft.value = text;
  inputRef.value?.focus();
}

function submit() {
  const q = draft.value.trim();
  if (!q || isThinking.value) return;
  thread.value.push({ role: 'user', text: q });
  draft.value = '';
  emit('submit', { query: q, model: selectedModel.value });
  isThinking.value = true;
  scrollToEnd();

  window.setTimeout(() => {
    isThinking.value = false;
    thread.value.push({
      role: 'assistant',
      text:
        'Noted. I applied your request in the canvas flow. Refine with another message, or close and keep editing manually.'
    });
    scrollToEnd();
    nextTick(() => inputRef.value?.focus());
  }, 900);
}
</script>

<style scoped>
.ai-overlay {
  position: absolute;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px 16px 72px;
  pointer-events: none;
}

.chat-panel {
  pointer-events: auto;
  width: min(560px, 100%);
  max-height: min(72vh, 520px);
  display: flex;
  flex-direction: column;
  background: rgba(22, 22, 28, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(139, 92, 246, 0.12);
  backdrop-filter: blur(16px);
  overflow: hidden;
  animation: rise 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  gap: 12px;
}
.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(139, 92, 246, 0.95);
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(139, 92, 246, 0.12);
}
.head-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}
.model-picker-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.model-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
.model-picker {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
}
.ghost-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.ghost-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.thread {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thread-msg {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  max-width: 95%;
}
.thread-msg.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.2);
  color: rgba(199, 181, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}
.avatar.dim {
  opacity: 0.6;
}

.bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.88);
}
.thread-msg.assistant .bubble {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom-left-radius: 4px;
}
.thread-msg.user .bubble {
  background: rgba(139, 92, 246, 0.28);
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-bottom-right-radius: 4px;
  color: #fff;
}

.bubble.thinking {
  display: flex;
  gap: 5px;
  align-items: center;
}
.bubble.thinking span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.9);
  animation: pulse 1s ease-in-out infinite;
}
.bubble.thinking span:nth-child(2) {
  animation-delay: 0.15s;
}
.bubble.thinking span:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 14px 10px;
}
.chip {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
}
.chip:hover {
  border-color: rgba(139, 92, 246, 0.4);
  color: #fff;
}

.dock {
  padding: 12px 14px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
}
.dock-input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-size: 14px;
  line-height: 1.45;
  padding: 10px 12px;
  resize: none;
  outline: none;
  font-family: inherit;
}
.dock-input:focus {
  border-color: rgba(139, 92, 246, 0.45);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
.dock-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
}
.hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}
.send {
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  cursor: pointer;
}
.send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>