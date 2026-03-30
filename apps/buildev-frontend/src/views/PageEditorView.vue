<template>
  <div class="editor-root" :class="[ui.theme === 'dark' ? 'theme-dark' : 'theme-light', { 'is-ide': isCodeMode }]">
    <!-- REORGANIZED NAVBAR -->
    <header class="top-bar shadow-sm">
      <div class="navbar-left">
        <button class="back-btn" @click="router.push('/dashboard')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="brand-area">
          <img src="../assets/isotype.svg" class="brand-isotype" alt="Buildev" />
          <span class="page-name">{{ store.currentPage?.name }}</span>
        </div>
      </div>

      <div class="navbar-center" v-show="!isCodeMode">
        <div class="viewport-controls">
           <button class="vp-btn" :class="{ active: store.currentBreakpoint === 'desktop' }" @click="store.currentBreakpoint = 'desktop'" title="Desktop">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
           </button>
           <button class="vp-btn" :class="{ active: store.currentBreakpoint === 'tablet' }" @click="store.currentBreakpoint = 'tablet'" title="Tablet">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
           </button>
           <button class="vp-btn" :class="{ active: store.currentBreakpoint === 'mobile' }" @click="store.currentBreakpoint = 'mobile'" title="Mobile">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
           </button>
        </div>
        <div class="logo-sep"></div>
        <button class="btn-ai-power shadow-glow" @click="isAIActionOpen = !isAIActionOpen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.2 7.6 2.4-7.6 2.4-2.4 7.2-2.4-7.2-7.6-2.4 7.6-2.4L12 2z" fill="var(--brand-primary)"/></svg>
          <span class="ai-label">AI Power</span>
        </button>
      </div>

      <div class="navbar-right">
        <div class="presence-indicators" v-if="multiplayer.userCount > 1">
           <div 
             v-for="(cursor, id) in multiplayer.remoteCursors" 
             :key="id" 
             class="presence-avatar shadow-glow" 
             :style="{ backgroundColor: cursor.color }"
             :title="cursor.userName"
           >
             {{ cursor.userName.charAt(0) }}
           </div>
           <div v-if="multiplayer.userCount > Object.keys(multiplayer.remoteCursors).length + 1" class="presence-count">
             +{{ multiplayer.userCount - Object.keys(multiplayer.remoteCursors).length - 1 }}
           </div>
        </div>
        <button class="btn-share shadow-glow" @click="isShareModalOpen = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Share
        </button>
        <button class="btn-github shadow-glow" title="Commit to GitHub" @click="isGithubModalOpen = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
        </button>
        <div class="logo-sep"></div>
        <div class="mode-toggles">
          <button class="btn-toggle-v2" :class="{ active: !isCodeMode && !isAIBuilding }" @click="setManualMode">
            Design
          </button>
          <button class="btn-toggle-v2 pink" :class="{ active: isAIBuilding }" @click="setAIMode">
            AI Architect
          </button>
          <button class="btn-toggle-v2" :class="{ active: isCodeMode }" @click="toggleCodeMode">
            Code
          </button>
        </div>
        <button class="btn-publish" @click="exportToHTML(store.currentPage!)">Publish</button>
      </div>
    </header>

    <div class="main-editor">
      <!-- IDE MODE: Activity Bar -->
      <aside v-if="isCodeMode" class="activity-bar">
         <div class="activity-top">
            <div class="activity-item active" title="Explorer">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            </div>
            <div class="activity-item" title="Search">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div class="activity-item" title="Source Control">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v7l6 2"/></svg>
            </div>
            <div class="activity-item" title="Extensions">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
         </div>
         <div class="activity-bottom">
            <div class="activity-item" title="Settings">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82H19a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
         </div>
      </aside>

      <!-- SIDEBAR -->
      <aside v-if="isCodeMode" class="ide-sidebar">
         <BSFileExplorer />
      </aside>
      <BSEditorSidebar v-else />

      <!-- CENTER AREA -->
      <div class="center-stage">
        <main 
          v-if="!isCodeMode"
          class="canvas-area" 
          ref="canvasArea"
          :class="{ 'panning': isPanning, 'ai-building': isAIBuilding }"
          @dragover.prevent 
          @drop="store.handleDrop()"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <BSMultiplayerCursors />
          
          <!-- AI CONVERSATION OVERLAY (CURSOR STYLE) -->
          <BSAIConversationOverlay 
            :isVisible="isAIComposeOpen || isAIBuilding" 
            @submit="handleAISubmit"
            @close="isAIComposeOpen = false"
            :prompt="(store.currentPage as any)?.prompt"
          />

          <div class="canvas-viewport-label" v-if="!isAIBuilding">{{ viewportLabel }} · {{ zoomLabel }}%</div>

          <div class="canvas-frame" :class="[store.currentBreakpoint, { 'ai-active': isAIBuilding }]" :style="{ transform: `scale(${zoom/100})` }">
            <div v-if="!store.currentPage?.blocks.length && !isAIBuilding" class="canvas-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <p>Drag elements here to build your page</p>
            </div>
            <BSBlockRenderer 
              v-for="block in store.currentPage?.blocks" 
              :key="block.id" 
              :block="block" 
            />
          </div>
        </main>

        <div v-else class="ide-editor-container">
           <div class="tabs-row">
              <div class="tab active">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                 blocks.pen
              </div>
              <div class="tab">theme.css</div>
           </div>
           <div class="monaco-wrapper">
              <BSCodeEditor v-model="codeContent" :theme="ui.theme === 'dark' ? 'vs-dark' : 'light'" />
           </div>
           <div class="terminal-container" :class="{ collapsed: isTerminalCollapsed }">
              <div class="terminal-header" @click="isTerminalCollapsed = !isTerminalCollapsed">
                 <span class="active">TERMINAL</span>
                 <span>OUTPUT</span>
                 <span>DEBUG CONSOLE</span>
              </div>
              <div v-if="!isTerminalCollapsed" class="terminal-body font-mono">
                 <p class="text-green-400">buildev@local:~/project$ yarn dev</p>
                 <p>Vite v5.2.6 ready in 150ms</p>
                 <p>Local:   http://localhost:5173/</p>
                 <p class="animate-pulse">_</p>
              </div>
           </div>
        </div>

        <!-- STATUS BAR (VS CODE STYLE) -->
        <div class="vsc-status-bar">
          <div class="status-left">
            <div class="status-item branch" title="main*">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v12M18 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 3v6"/></svg>
               main*
            </div>
            <div class="status-item sync" title="Sync changes">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </div>
          </div>
          <div class="status-right" v-if="isCodeMode">
             <div class="status-item">Spaces: 2</div>
             <div class="status-item">UTF-8</div>
             <div class="status-item">TypeScript JSX</div>
             <div class="status-item bell"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          </div>
          <div class="status-right" v-else>
             <div class="status-item">{{ viewportLabel }}</div>
             <div class="status-item zoom-controls-v12">
                <button class="zoom-btn-mini" @click="zoom = Math.max(25, zoom - 10)" title="Zoom Out">−</button>
                <span class="zoom-val" @click="zoom = 100" title="Reset Zoom">{{ zoom }}%</span>
                <button class="zoom-btn-mini" @click="zoom = Math.min(200, zoom + 10)" title="Zoom In">+</button>
             </div>
             <div class="status-item bell"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          </div>
        </div>
      </div>

      <BSPropertyPanel v-show="!isCodeMode" />
      <BSAIActionPanel v-if="isAIActionOpen" @close="isAIActionOpen = false" />
      <BSShareModal v-if="isShareModalOpen" @close="isShareModalOpen = false" />
      <BSGithubModal 
        v-if="isGithubModalOpen" 
        :projectName="store.currentPage?.name || 'project'" 
        @close="isGithubModalOpen = false" 
      />
      <BSBubbleMenu />
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePagesStore } from "../store/pages";
import { useUIStore } from "../store/ui";
import BSBlockRenderer from "../components/blocks/BSBlockRenderer.vue";
import BSEditorSidebar from "../components/BSEditorSidebar.vue";
import BSPropertyPanel from "../components/BSPropertyPanel.vue";
import BSCodeEditor from "../components/editor/BSCodeEditor.vue";
import BSAIActionPanel from "../components/editor/BSAIActionPanel.vue";
import BSFileExplorer from "../components/editor/BSFileExplorer.vue";
import BSMultiplayerCursors from "../components/canvas/BSMultiplayerCursors.vue";
import BSShareModal from "../components/modals/BSShareModal.vue";
import BSBubbleMenu from "../components/canvas/BSBubbleMenu.vue";
import BSGithubModal from "../components/modals/BSGithubModal.vue";
import BSAIConversationOverlay from "../components/editor/BSAIConversationOverlay.vue";


import { exportToHTML } from "../utils/exporter";
import { useMultiplayerStore } from "../store/multiplayer";

const route = useRoute();
const router = useRouter();
const store = usePagesStore();
const ui = useUIStore();
const multiplayer = useMultiplayerStore();
const activeTool = ref<'select' | 'text' | 'container' | 'image'>('select');
const isShareModalOpen = ref(false);


const zoom = ref(100);
const canvasArea = ref<HTMLElement | null>(null);
const isCodeMode = ref(false);
const isAIBuilding = ref(false);
const isAIActionOpen = ref(false);
const isAIComposeOpen = ref(false);
const isTerminalCollapsed = ref(false);
const isGithubModalOpen = ref(false);



const viewportLabel = computed(() => {
  const map: Record<string, string> = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
  return map[store.currentBreakpoint] ?? 'Desktop';
});
const zoomLabel = computed(() => zoom.value);

// --- Code Mode Logic ---
const codeContent = ref("");
let isUpdatingFromCode = false;

function setManualMode() {
  isCodeMode.value = false;
  isAIBuilding.value = false;
}

function setAIMode() {
  isCodeMode.value = false;
  isAIBuilding.value = true;
  isAIComposeOpen.value = true;
}

function toggleCodeMode() {
  isCodeMode.value = !isCodeMode.value;
  if (isCodeMode.value) {
    isAIBuilding.value = false;
    if (store.currentPage) {
      codeContent.value = JSON.stringify(store.currentPage.blocks, null, 2);
    }
  }
}

watch(() => store.currentPage?.blocks, (newBlocks) => {
  if (isCodeMode.value && !isUpdatingFromCode) {
    codeContent.value = JSON.stringify(newBlocks, null, 2);
  }
}, { deep: true });

watch(codeContent, (newVal) => {
  if (!isCodeMode.value || !store.currentPage) return;
  try {
    const parsed = JSON.parse(newVal);
    isUpdatingFromCode = true;
    store.currentPage.blocks = parsed;
    setTimeout(() => { isUpdatingFromCode = false; }, 0);
  } catch (err) {
    // Invalid JSON, ignore for real-time sync
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    isAIComposeOpen.value = !isAIComposeOpen.value;
  }
}

async function handleAISubmit(query: string) {
  isAIBuilding.value = true;
  isAIComposeOpen.value = false;
  // Mock generation delay
  setTimeout(() => {
    isAIBuilding.value = false;
  }, 3000);
}

// --- Panning State ---
const isSpaceDown = ref(false);
const isPanning = ref(false);
const scrollStartX = ref(0);
const scrollStartY = ref(0);
const scrollLeft = ref(0);
const scrollTop = ref(0);

function onMouseDown(e: MouseEvent) {
  if (!isSpaceDown.value || !canvasArea.value) return;
  isPanning.value = true;
  scrollStartX.value = e.clientX - canvasArea.value.offsetLeft;
  scrollStartY.value = e.clientY - canvasArea.value.offsetTop;
  scrollLeft.value = canvasArea.value.scrollLeft;
  scrollTop.value = canvasArea.value.scrollTop;
}

function onMouseMove(e: MouseEvent) {
  if (canvasArea.value) {
    const rect = canvasArea.value.getBoundingClientRect();
    multiplayer.updateMyPosition(
      e.clientX - rect.left + canvasArea.value.scrollLeft,
      e.clientY - rect.top + canvasArea.value.scrollTop
    );
  }

  if (!isPanning.value || !canvasArea.value) return;
  e.preventDefault();
  const x = e.clientX - canvasArea.value.offsetLeft;
  const y = e.clientY - canvasArea.value.offsetTop;
  const walkX = (x - scrollStartX.value);
  const walkY = (y - scrollStartY.value);
  canvasArea.value.scrollLeft = scrollLeft.value - walkX;
  canvasArea.value.scrollTop = scrollTop.value - walkY;
}


function onMouseUp() {
  isPanning.value = false;
}

// --- Keyboard Shortcuts ---
function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) {
    // If inside an editor or input, don't trigger shortcuts unless they are specific global ones (like save)
    if (!((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'z' || e.key === 'y'))) return;
  }

  // Space for Panning
  if (e.code === 'Space') {
    isSpaceDown.value = true;
    e.preventDefault();
  }

  // Tools
  const key = e.key.toLowerCase();
  
  // Only trigger tool shortcuts if NOT in an input/monaco
  if (!target.classList.contains('monaco-editor') && !/^(INPUT|TEXTAREA)$/.test(target.tagName)) {
    if (key === 'v') activeTool.value = 'select';
    if (key === 't') activeTool.value = 'text';
    if (key === 'r') activeTool.value = 'container';
    if (key === 'i') activeTool.value = 'image';
    if (key === 'c') toggleCodeMode();

    if (key === 'd') store.currentBreakpoint = 'desktop';
    if (key === 'm') store.currentBreakpoint = 'mobile';
    if (key === 't' && activeTool.value !== 'text') store.currentBreakpoint = 'tablet';
  }

  // Zoom (Ctrl + / - / 0)
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      zoom.value = Math.min(200, zoom.value + 10);
    } else if (e.key === '-') {
      e.preventDefault();
      zoom.value = Math.max(25, zoom.value - 10);
    } else if (e.key === '0') {
      e.preventDefault();
      zoom.value = 100;
    } else if (key === 'd') {
      // Duplicate
      e.preventDefault();
      if (store.selectedBlockId) store.duplicateBlock(store.selectedBlockId);
    } else if (key === 's') {
      // Save
      e.preventDefault();
      store.savePage();
    } else if (key === 'z') {
      // Undo/Redo
      e.preventDefault();
      if (e.shiftKey) store.redo();
      else store.undo();
    } else if (key === 'y') {
      // Redo
      e.preventDefault();
      store.redo();
    }
  }

  // Nudging (Arrows)
  if (e.key.startsWith('Arrow') && store.selectedBlockId && !/^(INPUT|TEXTAREA)$/.test(target.tagName)) {
    e.preventDefault();
    const amount = e.shiftKey ? 10 : 1;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -amount;
    if (e.key === 'ArrowRight') dx = amount;
    if (e.key === 'ArrowUp') dy = -amount;
    if (e.key === 'ArrowDown') dy = amount;
    store.nudgeBlock(store.selectedBlockId, dx, dy);
  }

  // Utility
  if ((e.key === 'Delete' || e.key === 'Backspace') && !/^(INPUT|TEXTAREA)$/.test(target.tagName)) {
    if (store.selectedBlockId) store.removeBlock(store.selectedBlockId);
  }
  if (e.key === 'Escape') {
    store.selectBlock(null);
    isCodeMode.value = false;
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    isSpaceDown.value = false;
    isPanning.value = false;
  }
}

onMounted(() => {
  store.loadPage(route.params.id as string);
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown, true);
  window.removeEventListener('keyup', handleKeyUp, true);
});

function downloadHTML() {
  if (!store.currentPage) return;
  const html = exportToHTML(store.currentPage);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${store.currentPage.name || 'page'}.html`;
  a.click();
}

let saveTimeout: any = null;
watch(() => store.currentPage?.blocks, () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => store.savePage(), 2000);
}, { deep: true });
</script>

<style scoped>
.editor-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-main);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden;
}

/* --- REORGANIZED TOP BAR --- */
.top-bar {
  height: 48px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}

.navbar-left, .navbar-center, .navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.brand-isotype { height: 24px; }
.page-name { font-weight: 500; font-size: 13px; opacity: 0.8; }

.viewport-controls {
  display: flex;
  background: var(--bg-main);
  padding: 2px;
  border-radius: 8px;
  border: none;
}

.vp-btn {
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--text-muted);
  transition: all 0.2s;
}

.vp-btn.active {
  background: var(--bg-surface);
  color: var(--brand-primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* --- MAIN EDITOR LAYOUT --- */
.main-editor {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* Activity Bar (VS Code Style) */
.activity-bar {
  width: 48px;
  background: var(--bg-dark-sidebar);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--border-main);
}

.activity-icon {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: 0.2s;
}

.activity-icon:hover, .activity-icon.active {
  color: #fff;
}

.activity-icon.active {
  border-left: 2px solid var(--brand-primary);
}

/* Sidebar Styling */
.ide-sidebar {
  width: 260px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-main);
  display: flex;
  flex-direction: column;
}

/* Center Stage */
.center-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  position: relative;
}

.theme-light .center-stage { background: #f5f5f5; }

/* Canvas Area */
.canvas-area {
  flex: 1;
  position: relative;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.canvas-viewport-label {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  backdrop-filter: blur(4px);
}

.canvas-frame {
  background: #fff;
  box-shadow: 0 0 40px rgba(0,0,0,0.3);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
}

.canvas-frame.desktop { width: 100%; min-height: 100%; }
.canvas-frame.tablet { width: 768px; height: 1024px; border-radius: 24px; }
.canvas-frame.mobile { width: 375px; height: 812px; border-radius: 32px; }

/* Terminal */
.terminal-container {
  height: 200px;
  background: #181818;
  border-top: 1px solid var(--border-main);
  display: flex;
  flex-direction: column;
  transition: height 0.2s;
}

.terminal-container.collapsed { height: 32px; }

.terminal-header {
  height: 32px;
  background: #252526;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #969696;
  cursor: pointer;
}

.terminal-header span.active {
  color: #fff;
  border-bottom: 1px solid #fff;
  height: 100%;
  display: flex;
  align-items: center;
}

.terminal-body {
  flex: 1;
  padding: 12px;
  color: #cccccc;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
}

/* Bottom Status Bar */
.bottom-bar {
  height: 22px;
  background: var(--brand-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 11px;
}

.zoom-controls { display: flex; align-items: center; gap: 8px; }
.zoom-val { cursor: pointer; min-width: 40px; text-align: center; }

/* Buttons & Elements */
.btn-ai-power {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-surface-alt);
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-primary);
  transition: all 0.2s;
}
.btn-ai-power:hover { background: var(--bg-surface); transform: translateY(-1px); }

.mode-toggles { 
  display: flex; 
  background: var(--bg-main); 
  padding: 4px; 
  border-radius: 10px; 
  border: none; 
  gap: 4px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}
.btn-toggle-v2 {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.btn-toggle-v2.active {
  background: var(--bg-surface);
  color: var(--text-main);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.btn-toggle-v2.pink.active {
  background: var(--brand-primary);
  color: #fff;
  box-shadow: 0 4px 12px rgba(138, 77, 245, 0.4);
}

.btn-publish {
  background: var(--brand-primary);
  color: #fff;
  padding: 6px 16px;
  border-radius: 8px;
  font-weight: 600;
}

.btn-github {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: var(--bg-surface-alt);
  color: var(--text-main);
  transition: all 0.2s;
}
.btn-github:hover { background: var(--bg-surface); transform: scale(1.05); }

/* ZOOM MINI */
.zoom-controls-v12 { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.1); border-radius: 4px; padding: 0 4px; }
.zoom-btn-mini { background: transparent; border: none; color: #fff; width: 18px; height: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; opacity: 0.7; }
.zoom-btn-mini:hover { opacity: 1; background: rgba(255,255,255,0.1); border-radius: 2px; }
.zoom-val { font-size: 10px; font-weight: 700; min-width: 36px; text-align: center; cursor: pointer; }

.logo-sep { width: 1px; height: 20px; background: var(--border-main); }

/* Presence Avatars */
.presence-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid var(--bg-surface);
  margin-left: -8px;
}
.presence-avatar:first-child { margin-left: 0; }

.presence-count {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-main);
  border: 1px solid var(--border-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  margin-left: -8px;
}

.shadow-glow { box-shadow: 0 0 15px rgba(138, 77, 245, 0.2); }

/* AI Build Overlay */
.ai-build-overlay {
  position: absolute;
  inset: 0;
  background: rgba(30, 30, 30, 0.4);
  backdrop-filter: blur(2px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40px;
  pointer-events: none;
}

.ai-prompt-box {
  background: var(--bg-surface);
  border: 1px solid var(--brand-primary);
  border-radius: 24px;
  padding: 8px 12px 8px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 600px;
  pointer-events: auto;
  animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

@keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.ai-sparkle { font-size: 20px; animation: rotate 4s linear infinite; }
@keyframes rotate { 100% { transform: rotate(360deg); } }

.prompt-text { flex: 1; font-size: 14px; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.prompt-text strong { color: var(--brand-primary); margin-right: 6px; }

.btn-manual {
  padding: 8px 16px;
  background: var(--bg-main);
  border: 1px solid var(--border-main);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  color: var(--text-main);
}

.ai-status-bar {
  margin-top: 20px;
}

.status-pill {
  background: var(--brand-primary);
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

/* VS Code IDE Styles */
.vsc-status-bar { height: 22px; background: var(--brand-primary); color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 12px; font-size: 11px; z-index: 100; flex-shrink: 0; }
.status-left, .status-right { display: flex; align-items: center; height: 100%; }
.status-item { display: flex; align-items: center; gap: 4px; padding: 0 8px; height: 100%; cursor: pointer; transition: background 0.1s; border-radius: 0; border: none; }
.status-item:hover { background: rgba(255,255,255,0.1); }
.status-item.branch { background: rgba(0,0,0,0.1); }
.status-item.sync { margin-left: -4px; }

.activity-bar { width: 48px; background: #333333; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 12px 0; flex-shrink: 0; }
.activity-item { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); cursor: pointer; transition: color 0.2s; position: relative; }
.activity-item:hover { color: rgba(255,255,255,0.8); }
.activity-item.active { color: #fff; border-left: 2px solid #fff; }

.vsc-breadcrumbs { height: 28px; background: var(--bg-main); border-bottom: 1px solid var(--border-main); display: flex; align-items: center; padding: 0 16px; gap: 8px; font-size: 11px; color: var(--text-muted); }
.vsc-breadcrumbs span { cursor: pointer; }
.vsc-breadcrumbs span:hover { color: var(--text-main); text-decoration: underline; }
.vsc-breadcrumbs span.file-active { color: var(--text-main); font-weight: 600; }

.terminal-header { background: var(--bg-surface); border-top: 1px solid var(--border-main); height: 35px; display: flex; align-items: center; padding: 0 12px; gap: 20px; font-size: 11px; font-weight: 600; color: var(--text-muted); cursor: pointer; }
.term-tab { height: 100%; display: flex; align-items: center; border-bottom: 1px solid transparent; }
.term-tab.active { color: var(--text-main); border-bottom: 1px solid var(--text-main); }

.tabs-row { height: 35px; background: var(--bg-surface-alt); border-bottom: 1px solid var(--border-main); display: flex; }
.tab { padding: 0 16px; display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); border-right: 1px solid var(--border-main); background: rgba(0,0,0,0.05); cursor: pointer; }
.tab.active { background: var(--bg-main); color: var(--text-main); border-top: 1px solid var(--brand-primary); }

.ide-sidebar { width: 260px; background: var(--bg-surface); border-right: 1px solid var(--border-main); flex-shrink: 0; }
.ide-editor-container { flex: 1; display: flex; flex-direction: column; background: var(--bg-main); overflow: hidden; }
.monaco-wrapper { flex: 1; position: relative; }
</style>

