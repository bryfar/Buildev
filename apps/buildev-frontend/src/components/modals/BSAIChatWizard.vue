<template>
  <div class="ai-wizard-container">
    <div class="wizard-header">
      <div class="ai-burst">✨</div>
      <div class="header-text">
        <h3>Buildev AI Architect</h3>
        <p>Conversational Project Scaffolding</p>
      </div>
    </div>

    <div class="chat-viewport" ref="chatViewport">
      <div v-for="(msg, i) in messages" :key="i" class="message-row" :class="msg.role">
        <div class="avatar" v-if="msg.role === 'assistant'">
          <img src="../../assets/isotype.svg" alt="AI" />
        </div>
        <div class="bubble shadow-sm">
          <div v-if="msg.type === 'typing'" class="typing-dots">
            <span></span><span></span><span></span>
          </div>
          <div v-else class="text-content">{{ msg.content }}</div>
        </div>
      </div>
    </div>

    <div class="suggestions" v-if="!isProcessing && currentStep < steps.length">
       <button v-for="sug in currentSuggestions" :key="sug" class="sug-btn" @click="handleInput(sug)">
         {{ sug }}
       </button>
    </div>

    <div class="input-area">
      <input 
        v-model="userInput" 
        @keyup.enter="handleInput()" 
        placeholder="Type your answer or select a suggestion..." 
        :disabled="isProcessing"
      />
      <button class="send-btn" @click="handleInput()" :disabled="isProcessing || !userInput">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>

    <!-- PROGRESS OVERLAY -->
    <div class="generation-overlay" v-if="isGenerating">
       <div class="gen-card shadow-glow">
          <div class="gen-animation">
             <div class="orbit"></div>
             <div class="core">✨</div>
          </div>
          <h4>Architecting Project...</h4>
          <div class="progress-steps">
             <div v-for="(s, i) in genSteps" :key="i" class="gen-step" :class="{ done: s.done, active: s.active }">
                <div class="step-check">
                   <svg v-if="s.done" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span>{{ s.label }}</span>
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
const userInput = ref('');
const isProcessing = ref(false);
const isGenerating = ref(false);
const currentStep = ref(0);

const messages = ref<{role: 'user' | 'assistant', content: string, type?: 'text' | 'typing'}[]>([]);

const steps = [
  { 
    question: "Hello! I'm your Buildev AI Architect. What are we building today?", 
    suggestions: ["E-commerce App", "SaaS Dashboard", "Personal Portfolio", "Landing Page"],
    field: "type"
  },
  {
    question: "Awesome! What's the core aesthetic you're aiming for?",
    suggestions: ["Modern Dark Mode", "Minimalist Clean", "Glassmorphism", "Vibrant & Bold"],
    field: "aesthetic"
  },
  {
    question: "I see. And what features should I prioritize in the first version?",
    suggestions: ["User Authentication", "Real-time Analytics", "Payment Integration", "AI Chatbot"],
    field: "features"
  },
  {
    question: "Got it. Lastly, what's its name?",
    suggestions: ["NeoTech", "SkyLine App", "Flux Studio", "OmniBoard"],
    field: "name"
  }
];

const responses = ref<Record<string, string>>({});

const currentSuggestions = computed(() => steps[currentStep.value]?.suggestions || []);

const genSteps = ref([
   { label: "Initializing Architecture", done: false, active: true },
   { label: "Generating UI Components", done: false, active: false },
   { label: "Configuring Backend Hooks", done: false, active: false },
   { label: "Optimizing Performance", done: false, active: false }
]);

onMounted(() => {
  addAssistantMessage(steps[0].question);
});

async function addAssistantMessage(text: string) {
  isProcessing.value = true;
  messages.value.push({ role: 'assistant', content: '', type: 'typing' });
  scrollToBottom();
  
  await new Promise(r => setTimeout(r, 1000));
  
  messages.value.pop();
  messages.value.push({ role: 'assistant', content: text, type: 'text' });
  isProcessing.value = false;
  scrollToBottom();
}

async function handleInput(preselected?: string) {
  const input = preselected || userInput.value;
  if (!input || isProcessing.value) return;

  messages.value.push({ role: 'user', content: input });
  responses.value[steps[currentStep.value].field] = input;
  userInput.value = '';
  scrollToBottom();

  currentStep.value++;
  
  if (currentStep.value < steps.length) {
    await addAssistantMessage(steps[currentStep.value].question);
  } else {
    await addAssistantMessage("Perfect! I have everything I need. Starting the architecting process now...");
    startGeneration();
  }
}

async function startGeneration() {
  await new Promise(r => setTimeout(r, 1000));
  isGenerating.value = true;
  
  try {
    // Stage 1: Initializing
    genSteps.value[0].active = true;
    const prompt = `A ${responses.value.type} with ${responses.value.aesthetic}. Features: ${responses.value.features}. Name: ${responses.value.name}`;
    const architecture = await aiService.generateArchitecture(prompt);
    genSteps.value[0].done = true;
    genSteps.value[0].active = false;

    // Stage 2: Components (Simulated sub-steps of real architecture)
    genSteps.value[1].active = true;
    await new Promise(r => setTimeout(r, 1000));
    genSteps.value[1].done = true;
    genSteps.value[1].active = false;

    // Stage 3: Hooks
    genSteps.value[2].active = true;
    await new Promise(r => setTimeout(r, 1000));
    genSteps.value[2].done = true;
    genSteps.value[2].active = false;

    // Stage 4: Optimization
    genSteps.value[3].active = true;
    await new Promise(r => setTimeout(r, 500));
    genSteps.value[3].done = true;
    genSteps.value[3].active = false;

    await new Promise(r => setTimeout(r, 500));
    emit('complete', { 
      name: responses.value.name,
      prompt,
      architecture
    });
  } catch (err) {
    alert("Architecting failed: " + err);
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
.ai-wizard-container {
  height: 520px;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  position: relative;
  overflow: hidden;
  border-radius: 20px;
}

.wizard-header {
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.ai-burst {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
}

.header-text h3 { margin: 0; font-size: 18px; font-weight: 800; color: #fff; }
.header-text p { margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.5); }

.chat-viewport {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.05), transparent);
}

.message-row { display: flex; gap: 14px; max-width: 85%; }
.message-row.user { align-self: flex-end; flex-direction: row-reverse; }
.message-row.assistant { align-self: flex-start; }

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center; justify-content: center;
}
.avatar img { width: 20px; height: 20px; opacity: 0.8; }

.bubble {
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
}

.assistant .bubble { 
  background: rgba(255, 255, 255, 0.03); 
  color: rgba(255, 255, 255, 0.9); 
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom-left-radius: 4px; 
}
.user .bubble { 
  background: var(--brand-primary); 
  color: #fff; 
  border-bottom-right-radius: 4px; 
  box-shadow: 0 4px 12px rgba(138, 77, 245, 0.2);
}

.suggestions {
  padding: 12px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sug-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.sug-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--brand-primary); color: #fff; }

.input-area {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 12px;
  background: rgba(0,0,0,0.2);
}

.input-area input {
  flex: 1;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0 20px;
  height: 48px;
  color: #fff;
  outline: none;
  font-size: 14px;
}
.input-area input:focus { border-color: var(--brand-primary); }

.send-btn {
  width: 48px;
  height: 48px;
  background: var(--brand-primary);
  color: #fff;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.send-btn:hover:not(:disabled) { transform: translateY(-1px); background: #8a4df5; }

/* GENERATION OVERLAY */
.generation-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.gen-card {
  width: 340px;
  text-align: center;
}

.orbit {
  position: absolute;
  inset: -10px;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top-color: var(--brand-primary);
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.core { font-size: 40px; filter: drop-shadow(0 0 20px var(--brand-primary)); }

.gen-card h4 { font-size: 18px; font-weight: 800; color: #fff; margin: 24px 0 32px; }

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.gen-step {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.4s;
}

.gen-step.active { color: #fff; transform: translateX(4px); }
.gen-step.done { color: #10b981; }

.step-check {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.done .step-check { background: #10b981; border-color: #10b981; color: #fff; }
.active .step-check { border-color: var(--brand-primary); background: rgba(138, 77, 245, 0.1); }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes typing {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}

.typing-dots span {
  width: 5px; height: 5px;
  background: var(--brand-primary);
  border-radius: 50%;
  margin: 0 2px;
  display: inline-block;
  animation: typing 1s infinite;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
</style>
