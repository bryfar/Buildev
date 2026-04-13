<template>
  <div class="ai-architect-bar" :class="{ 'gen-mode': isGenerating }">
    <!-- COMMAND HEADER (CURSOR STYLE) -->
    <div class="bar-header">
      <div class="model-selector">
        <span class="sparkle">✨</span>
        <span class="model-name">Buildev Architect-1</span>
        <span class="chevron">▾</span>
      </div>
      <div class="step-indicator-dot" :title="'Step ' + (currentStep + 1) + ' of ' + steps.length">
        <div class="dot-inner" :style="{ width: ((currentStep + 1) / steps.length) * 100 + '%' }"></div>
      </div>
      <button type="button" class="btn-close-cmd" @click="emit('cancel')">Esc</button>
    </div>

    <!-- CHAT VIEWPORT (MINIMALIST) -->
    <div class="floating-history" ref="chatViewport" v-if="messages.length > 0">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="compact-msg"
        :class="msg.role"
      >
        <span v-if="msg.role === 'assistant'" class="bot-prefix">Arch:</span>
        <span v-else class="user-prefix">You:</span>
        <div class="msg-content">
          <div v-if="msg.type === 'typing'" class="typing-dots">
            <span></span><span></span><span></span>
          </div>
          <span v-else>{{ msg.content }}</span>
        </div>
      </div>
    </div>

    <!-- MAIN COMMAND INPUT -->
    <div class="composer-container">
      <div class="input-wrapper">
        <textarea
          ref="inputRef"
          v-model="userInput"
          class="cmd-input"
          rows="1"
          :disabled="isProcessing || isGenerating"
          :placeholder="currentStep < steps.length ? steps[currentStep].question : 'Launching project...'"
          @keydown.enter.exact.prevent="handleInput()"
        />
        <div class="cmd-actions">
          <div class="shortcut-tip">Enter to submit</div>
          <button
            type="button"
            class="btn-send-v2"
            :disabled="isProcessing || isGenerating || !userInput.trim()"
            @click="handleInput()"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- QUICK SUGGESTIONS -->
    <div v-if="!isProcessing && currentStep < steps.length" class="suggestions-row">
      <button
        v-for="sug in currentSuggestions"
        :key="sug"
        type="button"
        class="suggestion-pill"
        @click="handleInput(sug)"
      >
        {{ sug }}
      </button>
    </div>

    <!-- GENERATION OVERLAY (PREMIUM DASHBOARD STYLE) -->
    <div v-if="isGenerating" class="gen-overlay-v2">
      <div class="gen-layout-container">
        <!-- LEFT: STATUS & LOADER -->
        <div class="gen-column status-col">
          <div class="loader-v4">
             <div class="ring-v4"></div>
             <div class="sparkle-core">✨</div>
          </div>
          <div class="preparing-label">Preparing system resources...</div>
          <h2 class="gen-main-title">Building your masterpiece</h2>
          
          <div class="gen-status-list">
            <div v-for="(s, i) in genSteps" :key="i" class="status-item-v2" :class="{ 'done': s.done, 'active': s.active }">
              <div class="status-icon">
                <svg v-if="s.done" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else-if="s.active" class="active-pulse"></div>
              </div>
              <span class="status-text">{{ s.label }}</span>
            </div>
          </div>
        </div>

        <!-- RIGHT: TIPS & RESOURCES -->
        <div class="gen-column tips-col">
          <h3 class="tips-header">Enjoy these tips while you wait</h3>
          <div class="tips-grid">
            <div class="tip-card">
              <div class="tip-icon-box blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div class="tip-content">
                <h4>Add database and auth</h4>
                <p>Easily add persistence to your app and keep track of user data with Google Sign-In and Firestore.</p>
              </div>
            </div>
            <div class="tip-card">
              <div class="tip-icon-box purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <div class="tip-content">
                <h4>Preview on any device</h4>
                <p>Check how your site looks on mobile, tablet and desktop in real-time with our built-in previewer.</p>
              </div>
            </div>
            <div class="tip-card">
              <div class="tip-icon-box green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </div>
              <div class="tip-content">
                <h4>Export to HTML</h4>
                <p>When you are ready, export your project to high-quality clean HTML and CSS code instantly.</p>
              </div>
            </div>
            <div class="tip-card">
              <div class="tip-icon-box pink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="tip-content">
                <h4>Live Collaboration</h4>
                <p>Share your project link and build together with your team in real-time with shared cursors.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { aiService } from '../../services/aiService';

const emit = defineEmits(['complete', 'cancel']);

const chatViewport = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const userInput = ref('');
const isProcessing = ref(false);
const isGenerating = ref(false);
const currentStep = ref(0);

const messages = ref<{ role: 'user' | 'assistant'; content: string; type?: 'text' | 'typing' }[]>([]);

const steps = [
  {
    question: "What are we building? Describe it in your own words...",
    suggestions: ['E-commerce', 'SaaS dashboard', 'Portfolio', 'Marketing landing'],
    field: 'type'
  },
  {
    question: 'Nice. What visual direction should we lean into?',
    suggestions: ['Dark & minimal', 'Light & airy', 'Glass / blur', 'Bold color'],
    field: 'aesthetic'
  },
  {
    question: 'What should ship in v1?',
    suggestions: ['Auth', 'Analytics', 'Payments', 'AI chat'],
    field: 'features'
  },
  {
    question: 'Last step: what should we call this project?',
    suggestions: ['NeoTech', 'Skyline', 'Flux Studio', 'OmniBoard'],
    field: 'name'
  }
];

const responses = ref<Record<string, string>>({});
const currentSuggestions = computed(() => steps[currentStep.value]?.suggestions || []);

const genSteps = ref([
  { label: 'Blueprint', done: false, active: false },
  { label: 'UI shell', done: false, active: false },
  { label: 'Integrations', done: false, active: false },
  { label: 'Polish', done: false, active: false }
]);

onMounted(() => {
  addAssistantMessage(steps[0].question);
  nextTick(() => inputRef.value?.focus());
});

async function addAssistantMessage(text: string) {
  isProcessing.value = true;
  messages.value.push({ role: 'assistant', content: '', type: 'typing' });
  scrollToBottom();
  await new Promise(r => setTimeout(r, 650));
  messages.value.pop();
  messages.value.push({ role: 'assistant', content: text, type: 'text' });
  isProcessing.value = false;
  scrollToBottom();
  nextTick(() => inputRef.value?.focus());
}

async function handleInput(preselected?: string) {
  const input = (preselected ?? userInput.value).trim();
  if (!input || isProcessing.value || isGenerating.value) return;

  messages.value.push({ role: 'user', content: input });
  responses.value[steps[currentStep.value].field] = input;
  userInput.value = '';
  scrollToBottom();

  currentStep.value++;

  if (currentStep.value < steps.length) {
    await addAssistantMessage(steps[currentStep.value].question);
  } else {
    await addAssistantMessage("Got it. I'm generating the project scaffold now.");
    startGeneration();
  }
}

async function startGeneration() {
  await new Promise(r => setTimeout(r, 400));
  isGenerating.value = true;

  try {
    genSteps.value[0].active = true;
    const prompt = `A ${responses.value.type} with ${responses.value.aesthetic}. Features: ${responses.value.features}. Name: ${responses.value.name}`;
    const architecture = await aiService.generateArchitecture(prompt);
    genSteps.value[0].done = true;
    genSteps.value[0].active = false;

    genSteps.value[1].active = true;
    await new Promise(r => setTimeout(r, 800));
    genSteps.value[1].done = true;
    genSteps.value[1].active = false;

    genSteps.value[2].active = true;
    await new Promise(r => setTimeout(r, 700));
    genSteps.value[2].done = true;
    genSteps.value[2].active = false;

    genSteps.value[3].active = true;
    await new Promise(r => setTimeout(r, 450));
    genSteps.value[3].done = true;
    genSteps.value[3].active = false;

    await new Promise(r => setTimeout(r, 350));
    emit('complete', {
      name: responses.value.name,
      prompt,
      architecture
    });
  } catch (err) {
    alert('Architecting failed: ' + err);
    isGenerating.value = false;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatViewport.value) {
      chatViewport.value.scrollTop = chatViewport.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
.ai-architect-bar {
  display: flex;
  flex-direction: column;
  background: #1a1a1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 120px;
}

.bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.02);
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
}
.model-selector:hover { background: rgba(255, 255, 255, 0.08); }
.sparkle { color: #a78bfa; font-size: 12px; }
.model-name { font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.8); }
.chevron { font-size: 10px; color: rgba(255, 255, 255, 0.4); margin-left: 2px; }

.step-indicator-dot { flex: 1; margin: 0 20px; height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.dot-inner { height: 100%; background: #8b5cf6; transition: width 0.4s ease; box-shadow: 0 0 8px rgba(139, 92, 246, 0.4); }

.btn-close-cmd {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700;
  padding: 2px 6px; border-radius: 4px; cursor: pointer;
}

.floating-history {
  max-height: 180px;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  scrollbar-width: none;
}
.floating-history::-webkit-scrollbar { display: none; }

.compact-msg { display: flex; gap: 8px; font-size: 13px; line-height: 1.4; animation: slideUp 0.2s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

.bot-prefix { color: #a78bfa; font-weight: 800; opacity: 0.6; flex-shrink: 0; }
.user-prefix { color: rgba(255, 255, 255, 0.3); font-weight: 800; flex-shrink: 0; }
.msg-content { color: rgba(255, 255, 255, 0.85); white-space: pre-wrap; }

.composer-container { padding: 12px 16px; }
.input-wrapper { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px; position: relative; transition: all 0.2s; }
.input-wrapper:focus-within { border-color: rgba(139, 92, 246, 0.4); background: rgba(255,255,255,0.04); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }

.cmd-input {
  width: 100%; min-height: 24px; max-height: 120px; resize: none;
  background: transparent; border: none; outline: none;
  color: #fff; font-size: 14px; font-family: inherit; line-height: 1.5;
}
.cmd-input::placeholder { color: rgba(255,255,255,0.25); }

.cmd-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.shortcut-tip { font-size: 10px; color: rgba(255,255,255,0.15); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.btn-send-v2 {
  width: 28px; height: 28px; border-radius: 8px; border: none;
  background: #8b5cf6; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-send-v2:disabled { opacity: 0.2; cursor: not-allowed; filter: grayscale(1); }
.btn-send-v2:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 12px rgba(139,92,246,0.3); }

.suggestions-row { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 16px; }
.suggestion-pill {
  padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03); color: rgba(255, 255, 255, 0.6);
  font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.suggestion-pill:hover { border-color: rgba(139, 92, 246, 0.3); background: rgba(139, 92, 246, 0.08); color: #fff; }

.typing-dots { display: flex; gap: 4px; padding: 6px 0; }
.typing-dots span { width: 5px; height: 5px; background: #a78bfa; border-radius: 50%; animation: dotBounce 1s infinite alternate; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce { from { transform: translateY(0); opacity: 0.3; } to { transform: translateY(-4px); opacity: 1; } }


/* GEN OVERLAY V2 (DASHBOARD) */
.gen-overlay-v2 {
  position: absolute; inset: 0; background: #0c0c0e; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.gen-layout-container {
  display: flex; width: 100%; max-width: 1000px; padding: 40px; gap: 60px;
}

.gen-column { flex: 1; }

/* Status Column */
.status-col { display: flex; flex-direction: column; justify-content: center; }

.loader-v4 { position: relative; width: 80px; height: 80px; margin-bottom: 32px; }
.ring-v4 {
  position: absolute; inset: 0; border: 4px solid rgba(139, 92, 246, 0.1); border-top-color: #8b5cf6;
  border-radius: 50%; animation: spin 1s infinite cubic-bezier(0.5, 0, 0.5, 1);
}
.sparkle-core { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; }

@keyframes spin { to { transform: rotate(360deg); } }

.preparing-label { font-size: 14px; color: rgba(255,255,255,0.4); font-weight: 500; margin-bottom: 8px; }
.gen-main-title { font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 40px; letter-spacing: -0.02em; }

.gen-status-list { display: flex; flex-direction: column; gap: 16px; }
.status-item-v2 { display: flex; align-items: center; gap: 12px; opacity: 0.3; transition: all 0.3s; }
.status-item-v2.active { opacity: 1; transform: translateX(4px); }
.status-item-v2.done { opacity: 0.6; }

.status-icon {
  width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.04);
  display: flex; align-items: center; justify-content: center; color: #10b981;
}
.status-item-v2.active .status-icon { background: #8b5cf6; color: #fff; }
.status-item-v2.done .status-icon { background: rgba(16, 185, 129, 0.1); }

.active-pulse { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: pulse 1s infinite; }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

.status-text { font-size: 14px; font-weight: 600; color: #fff; }

/* Tips Column */
.tips-col { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 32px; }
.tips-header { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }

.tips-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
.tip-card { display: flex; gap: 16px; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.02); transition: all 0.2s; }
.tip-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); }

.tip-icon-box {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.tip-icon-box.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.tip-icon-box.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.tip-icon-box.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.tip-icon-box.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }

.tip-content h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.tip-content p { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; margin: 0; }

@media (max-width: 900px) {
  .gen-layout-container { flex-direction: column; padding: 20px; gap: 30px; }
  .tips-col { padding: 20px; }
}
</style>
