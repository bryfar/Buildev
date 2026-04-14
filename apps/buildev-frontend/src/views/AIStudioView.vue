<template>
  <div class="ai-studio-root" :class="[ui.theme === 'dark' ? 'theme-dark' : 'theme-light']">
    <!-- TOP NAVIGATION (STUDIO CLEAN) -->
    <header class="studio-header shadow-sm">
      <div class="header-left">
        <button class="back-btn-studio" @click="router.push('/')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to start
        </button>
        <div class="header-sep"></div>
        <div class="project-title-studio">{{ activeProjectName }}</div>
      </div>

      <div class="header-right">
        <button class="btn-studio-ghost" @click="remixProject">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
          Remix
        </button>
        <button class="btn-studio-ghost" @click="shareProject">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
        </button>
        <button class="btn-studio-ghost" @click="publishProject">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Publish
        </button>
        <div class="actions-sep"></div>
        <button class="btn-studio-manual shadow-glow" @click="switchToManualBuilder">
          Manual Builder
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="user-avatar-studio">BF</div>
      </div>
    </header>

    <div class="studio-main-split">
      <!-- LEFT PANEL: INTERACTION & HISTORY -->
      <aside class="interaction-pane">
        <div class="pane-content scroll-area" ref="historyRef">
          <!-- MODEL BADGE -->
          <div class="model-badge-v3">
            <span class="sparkle">✨</span>
            <span class="model-name">Gemini 3 Flash Preview</span>
            <span class="dot">•</span>
            <span class="run-time">Run for 93s</span>
            <button class="btn-model-settings"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
          </div>

          <!-- CHAT & ACTION HISTORY -->
          <div class="chat-container">
            <div v-for="(msg, i) in messages" :key="i" class="history-item-v3" :class="msg.role">
              <div v-if="msg.role === 'assistant'" class="bot-icon-wrapper">
                <div class="bot-icon" :class="msg.agent?.id || 'architect'">
                  <svg v-if="msg.agent?.id === 'painter'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.5 1.5"/><path d="M14.5 3.5L16 2"/></svg>
                  <svg v-else-if="msg.agent?.id === 'researcher'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l2.4 7.2 7.6 2.4-7.6 2.4-2.4 7.2-2.4-7.2-7.6-2.4 7.6-2.4L12 2z"/></svg>
                </div>
                <span class="agent-name-label">{{ msg.agent?.name || 'Architect' }}</span>
              </div>
              <div class="msg-content-v3">
                 <div v-if="msg.type === 'typing'" class="typing-dots"><span></span><span></span><span></span></div>
                 <span v-else>{{ msg.content }}</span>
              </div>
            </div>

            <!-- ACTION HISTORY / CHECKPOINTS -->
            <div class="section-divider">Action history</div>
            <div class="checkpoint-list">
              <div class="checkpoint-item active">
                 <div class="cp-indicator completed"></div>
                 <svg class="checkpoint-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                 <div class="cp-info">
                   <span class="cp-label">Initial Architecture</span>
                   <span class="cp-time">Just now</span>
                 </div>
                 <div class="cp-actions">
                   <button class="btn-checkpoint-action">Restore</button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FIXED BOTTOM INPUT (V0 STYLE) -->
        <div class="prompt-footer-v3">
          <div class="input-container-v3">
            <textarea 
              ref="inputRef"
              v-model="userInput" 
              placeholder="Ask a follow up..." 
              class="composer-textarea-v3"
              rows="1"
              @keydown.enter.exact.prevent="handleInput()"
            ></textarea>
            <div class="footer-actions-v3">
              <div class="left-tools">
                <!-- AGENT SELECTOR -->
                <div class="agent-selector-v3">
                  <button class="agent-tab-btn" 
                    v-for="agent in agents" 
                    :key="agent.id"
                    :class="{ active: selectedAgent.id === agent.id }" 
                    @click="selectedAgent = agent">
                    {{ agent.name.split(' ')[1] || agent.name }}
                  </button>
                </div>
                <div class="tool-sep"></div>
                <button class="tool-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
              </div>
              <button class="btn-send-v3" @click="handleInput()" :disabled="!userInput.trim()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
          <div class="footer-note-v3">AI Architect 2026. Proyectos inteligentes al instante.</div>
        </div>
      </aside>

      <!-- RIGHT PANEL: WORKSPACE (PREVIEW & CODE) -->
      <main class="workspace-pane">
        <!-- WORKSPACE TABS (CURSOR STYLE) -->
        <div class="workspace-tabs shadow-sm">
          <!-- Left Context -->
          <div class="visual-tabs-left">
            <div class="tab-pair">
              <button class="tab-btn" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">Preview</button>
              <button class="tab-btn" :class="{ active: activeTab === 'code' }" @click="activeTab = 'code'">Code</button>
            </div>
            <div class="browser-nav-tools">
              <button class="btn-icon-studio"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
              <button class="btn-icon-studio"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
              <button class="btn-icon-studio" title="Reload" @click="reloadPreview"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
            </div>
          </div>
          
          <!-- Center: URL + Fullscreen -->
          <div class="visual-tabs-center">
             <div class="url-input-studio">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               buildev.local/p/{{ store.currentSiteId?.slice(0,8) }}
             </div>
             <button class="btn-icon-studio" title="Full Screen" @click="toggleFullScreen">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
             </button>
          </div>

          <!-- Right Tools -->
          <div class="visual-tabs-right">
             <div class="edit-stats" v-if="editCount > 0">{{ editCount }} Edits</div>
             <button class="btn-icon-studio" title="Undo" @click="undoLastEdit" :disabled="undoStack.length === 0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-5.7L3 14"/></svg></button>
             <button class="btn-studio-apply" v-if="editCount > 0" @click="applyEdits">Apply</button>
             <div class="tab-sep"></div>
             <button class="btn-live-edit" title="Live Edit — click to select & edit elements" @click="toggleLiveEdit" :class="{ active: liveEditMode }">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
               Live Edit
             </button>
          </div>
        </div>

        <div class="workspace-content-split">
          <div class="workspace-viewport" ref="viewportRef">
          <!-- PREVIEW MODE -->
          <div v-show="activeTab === 'preview'" class="preview-container-v3">
            <div class="preview-iframe-wrapper shadow-preview" :class="{ 'live-mode': liveEditMode }">
              <!-- LIVE EDIT MODE INDICATOR -->
              <div v-if="liveEditMode" class="live-edit-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span>Live Edit — Click any element to select and edit it</span>
                <button class="btn-exit-live" @click="liveEditMode = false">Exit</button>
              </div>

              <div v-if="isGenerating" class="gen-overlay-studio">
                <div class="arch-loader">
                  <div class="arch-ring"></div>
                  <div class="arch-logo">✨</div>
                </div>
                <div class="gen-msg">Architecting project architecture...</div>
              </div>
              <div class="preview-mock-content" v-else-if="messages.length > 0">
                 <!-- Real page content will be injected into iframe here -->
                 <div class="content-placeholder-v3"
                   :class="{ 'node-hovered': hoveredNodeId === 'root', 'node-selected': selectedNode === 'root' }"
                   data-tag="root"
                   :style="previewStyles.root"
                   @mouseenter="hoveredNodeId = 'root'"
                   @mouseleave="hoveredNodeId = null"
                   @click="selectNode('root')">
                   <h1
                     :class="{ 'node-hovered': hoveredNodeId === 'heading', 'node-selected': selectedNode === 'heading' }"
                     data-tag="h1"
                     :style="previewStyles.heading"
                     @mouseenter="hoveredNodeId = 'heading'"
                     @mouseleave="hoveredNodeId = null"
                     @click.stop="selectNode('heading')">
                     {{ activeProjectName }}
                   </h1>
                   <p
                     :class="{ 'node-hovered': hoveredNodeId === 'subtitle', 'node-selected': selectedNode === 'subtitle' }"
                     data-tag="p"
                     :style="previewStyles.subtitle"
                     @mouseenter="hoveredNodeId = 'subtitle'"
                     @mouseleave="hoveredNodeId = null"
                     @click.stop="selectNode('subtitle')">
                     Your AI-architected site is ready for preview.
                   </p>
                   <div class="mock-card-studio"
                     :class="{ 'node-hovered': hoveredNodeId === 'container', 'node-selected': selectedNode === 'container' }"
                     data-tag="div"
                     :style="previewStyles.container"
                     @mouseenter="hoveredNodeId = 'container'"
                     @mouseleave="hoveredNodeId = null"
                     @click.stop="selectNode('container')"></div>
                   <div class="mock-card-studio"></div>
                 </div>

                 <!-- POINT & PROMPT FLOATING BAR -->
                 <transition name="fade">
                   <div v-if="selectedNode" class="point-prompt-overlay" :style="pointPromptStyle">
                     <div class="pp-tag">{{ selectedNodeData?.tag || 'element' }}</div>
                     <div class="pp-input-wrap">
                       <input type="text" placeholder="Explain a change..." v-model="quickEditInput" @keydown.enter="handleQuickEdit">
                       <button @click="handleQuickEdit"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                     </div>
                   </div>
                 </transition>
              </div>
              <div class="empty-preview-v3" v-else>
                 <div class="hero-studio-v3">
                   <h1>Buildev AI Architect</h1>
                   <p>Specify any design or structural needs in the interaction panel.</p>
                 </div>
              </div>
            </div>
          </div>

          <!-- CODE MODE -->
          <div v-show="activeTab === 'code'" class="code-container-v3">
             <div class="code-explorer-v3 shadow-sm">
               <div class="explorer-header">
                 <span>File explorer</span>
                 <div class="explorer-tools">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                 </div>
               </div>
               <div class="explorer-tree">
                 <div class="tree-item file">.env.example</div>
                 <div class="tree-item file">.gitignore</div>
                 <div class="tree-item file">index.html</div>
                 <div class="tree-item file active">metadata.json</div>
                 <div class="tree-item file">package.json</div>
                 <div class="tree-item dir open">
                   <div class="dir-name">src</div>
                   <div class="tree-item file">App.tsx</div>
                   <div class="tree-item dir">pages</div>
                 </div>
               </div>
             </div>
             <div class="code-editor-v3">
                <div class="editor-header">
                  <div class="file-tab active">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    metadata.json
                  </div>
                </div>
                <div class="editor-content">
<pre><code>{
  "name": "{{ activeProjectName }}",
  "description": "AI generated layout for {{ activeProjectName }}",
  "version": "1.0.0",
  "author": "Buildev Architect"
}</code></pre>
                </div>
             </div>
          </div>
          </div><!-- /workspace-viewport -->
          
          <!-- RIGHT PANEL (VISUAL EDITOR SIDEBAR) -->
          <aside v-if="activeTab === 'preview'" class="visual-editor-sidebar shadow-sm">
             <div class="ve-section ve-tree-container">
               <div class="ve-header">Components</div>
               <div class="ve-tree">
                 <div v-for="node in componentTree" :key="node.id"
                   class="ve-tree-item"
                   draggable="true"
                   @dragstart="onDragStart(node.id)"
                   @dragover.prevent
                   @drop="onDrop(node.id)"
                   :class="{ active: selectedNode === node.id, hover: hoveredNodeId === node.id }"
                   :style="{ paddingLeft: (node.depth * 10 + 8) + 'px' }"
                   @click="selectNode(node.id)"
                   @mouseenter="hoveredNodeId = node.id"
                   @mouseleave="hoveredNodeId = null">
                   <svg v-if="node.children.length" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                   <span class="ve-node-icon">{{ node.tag }}</span>
                   <span class="ve-node-classes">{{ node.classes }}</span>
                 </div>
               </div>
             </div>

             <div class="ve-tabs-v2">
               <button class="ve-tab-v2" :class="{ active: veActiveTab === 'design' }" @click="veActiveTab = 'design'">Design</button>
               <button class="ve-tab-v2" :class="{ active: veActiveTab === 'css' }" @click="veActiveTab = 'css'">CSS</button>
               <div style="flex:1"></div>
               <span class="ve-selected-tag" v-if="selectedNodeData">{{ selectedNodeData.tag }}{{ selectedNodeData.classes }}</span>
             </div>

             <!-- DYNAMIC PROPERTY TABLE -->
             <div v-if="veActiveTab === 'design'" class="ve-property-groups">
               <div v-for="group in propertyGroups" :key="group.id" class="ve-prop-group">
                 <div class="ve-prop-group-header">
                   <span>{{ group.title }}</span>
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
                 </div>
                 
                 <div class="ve-prop-table">
                   <div v-for="prop in group.props" :key="prop.key" class="ve-prop-row">
                     <label class="ve-prop-label">{{ prop.label }}</label>
                     
                     <div class="ve-prop-control">
                       <select v-if="prop.type === 'select'" class="ve-prop-select" v-model="(designProps as any)[prop.key]">
                         <option v-for="opt in prop.options" :key="opt" :value="opt">{{ opt }}</option>
                       </select>
                       
                       <select v-else-if="prop.type === 'font'" class="ve-prop-select" v-model="designProps.fontFamily">
                         <option v-for="f in fontOptions" :key="f" :value="f">{{ f }}</option>
                       </select>

                       <select v-else-if="prop.type === 'weight'" class="ve-prop-select" v-model="designProps.fontWeight">
                         <option v-for="w in weightOptions" :key="w" :value="w">{{ w }}</option>
                       </select>

                       <div v-else-if="prop.type === 'range'" class="ve-prop-range-wrap">
                         <input type="range" :min="prop.min" :max="prop.max" v-model.number="(designProps as any)[prop.key]" class="ve-prop-slider">
                         <span class="ve-prop-val">{{ (designProps as any)[prop.key] }}{{ prop.unit }}</span>
                       </div>

                       <div v-else-if="prop.type === 'number'" class="ve-prop-number-wrap">
                         <input type="number" v-model.number="(designProps as any)[prop.key]" class="ve-prop-num-input">
                         <span class="ve-prop-unit">px</span>
                       </div>

                       <div v-else-if="prop.type === 'color'" class="ve-prop-color-wrap">
                         <input type="color" v-model="designProps.colorValue" class="ve-prop-color-picker">
                         <span class="ve-prop-hex">{{ designProps.colorValue }}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <div v-else class="ve-css-code">
                <textarea v-model="rawCSS" class="ve-textarea-v2" spellcheck="false"></textarea>
             </div>
          </aside>
        </div>
      </main>
    </div>

    <!-- GLOBAL PROGRESS (INTEGRATED) -->
    <Transition name="slide-up">
      <div v-if="isGenerating" class="global-gen-footer shadow-lg">
         <div class="gen-progress-bar">
            <div class="gen-p-fill" :style="{ width: genProgress + '%' }"></div>
         </div>
         <div class="gen-details-v3">
           <span>Architect: {{ activeGenStep.label }}</span>
           <span class="gen-timer">{{ genCount }}s</span>
         </div>
      </div>
    </Transition>

    <!-- MODALS INTEGRATION -->
    <BSShareModal v-if="isShareModalOpen" @close="isShareModalOpen = false" />
    <BSGithubModal v-if="isGithubModalOpen" :projectName="activeProjectName" @close="isGithubModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../store/ui';
import { usePagesStore } from '../store/pages';
import BSShareModal from '../components/modals/BSShareModal.vue';
import BSGithubModal from '../components/modals/BSGithubModal.vue';

const router = useRouter();
const ui = useUIStore();
const store = usePagesStore();

const activeTab = ref<'preview' | 'code'>('preview');
const userInput = ref('');
const isGenerating = ref(false);
const isShareModalOpen = ref(false);
const isGithubModalOpen = ref(false);
const liveEditMode = ref(false);
const quickPrompt = ref('');
const viewportRef = ref<HTMLElement | null>(null);
const editCount = ref(0);
const editHistory = ref<{prop: string, oldVal: any, newVal: any, timestamp: number}[]>([]);
const undoStack = ref<any[]>([]);
const quickEditInput = ref('');

const agents = [
  { id: 'architect', name: 'Architect', role: 'System Design & Logic', icon: 'sparkle', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Arch' },
  { id: 'painter', name: 'Painter', role: 'UI/UX & Aesthetics', icon: 'palette', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Paint' },
  { id: 'researcher', name: 'Researcher', role: 'Market & UX Analysis', icon: 'search', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Res' }
];
const selectedAgent = ref(agents[0]);

const models = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' }
];
const selectedModel = ref(models[0]);

const stacks = [
  { id: 'nextjs-tailwind', name: 'Next.js + Tailwind', icon: 'next' },
  { id: 'vue-vite', name: 'Vue 3 + Vite', icon: 'vue' },
  { id: 'react-shadcn', name: 'React + Shadcn/UI', icon: 'react' },
  { id: 'astro-static', name: 'Astro (Static)', icon: 'astro' }
];
const selectedStack = ref(stacks[0]);

const animationLibs = [
  { id: 'gsap', name: 'GSAP', status: 'Active' },
  { id: 'framer-motion', name: 'Framer Motion', status: 'Available' },
  { id: 'animate-css', name: 'Animate.css', status: 'Available' }
];

const messages = ref<{role: string, content: string, type?: string, agent?: any}[]>([]);
const genCount = ref(0);
const genProgress = ref(0);
const inputRef = ref<HTMLTextAreaElement|null>(null);
const historyRef = ref<HTMLElement|null>(null);

const activeProjectName = computed(() => store.currentPage?.name || 'Untitled Project');

const genSteps = [
  { label: 'Analyzing Prompt', duration: 15 },
  { label: 'Generating Blueprint', duration: 30 },
  { label: 'Architecting Components', duration: 40 },
  { label: 'Injecting Animations', duration: 15 }
];
const activeGenStepIdx = ref(0);
const activeGenStep = computed(() => genSteps[activeGenStepIdx.value] || genSteps[3]);

// ─── VISUAL EDITOR STATE ───────────────────────────────────────────
const veActiveTab = ref<'design' | 'css'>('design');

// Component tree - simulated DOM nodes
const componentTree = ref([
  { id: 'root', tag: 'div', classes: '', depth: 0, expanded: true, children: ['container'] },
  { id: 'container', tag: 'div', classes: '.text-left.max-w-pro', depth: 1, expanded: true, children: ['heading', 'subtitle'] },
  { id: 'heading', tag: 'h1', classes: '.type-lg.text-balance', depth: 2, expanded: false, children: [] },
  { id: 'subtitle', tag: 'p', classes: '.type-sm', depth: 2, expanded: false, children: [] },
  { id: 'button', tag: 'button', classes: '.btn-primary', depth: 2, expanded: false, children: [] },
]);
const selectedNode = ref('heading');
const hoveredNodeId = ref<string | null>(null);

function selectNode(nodeId: string) {
  selectedNode.value = nodeId;
}

function toggleNodeExpand(nodeId: string) {
  const node = componentTree.value.find(n => n.id === nodeId);
  if (node) node.expanded = !node.expanded;
}

const selectedNodeData = computed(() => {
  return componentTree.value.find(n => n.id === selectedNode.value);
});

type VeProp =
  | { label: string; type: "select"; options: string[]; key: string }
  | { label: string; type: "font" | "weight"; key: string }
  | { label: string; type: "number"; key: string }
  | { label: string; type: "range"; min: number; max: number; unit: string; key: string }
  | { label: string; type: "color"; key: string };

type VePropGroup = { id: string; title: string; props: VeProp[] };

// ─── DYNAMIC PROPERTY GROUPS ───────────────────────────────────────
const propertyGroups = computed((): VePropGroup[] => {
  const node = selectedNodeData.value;
  if (!node) return [];

  const groups: VePropGroup[] = [
    {
      id: "layout",
      title: "LAYOUT",
      props: [
        { label: "Display", type: "select", options: ["Flex", "Block", "Grid", "None"], key: "display" },
        { label: "Direction", type: "select", options: ["Row", "Column"], key: "flexDirection" },
      ],
    },
    {
      id: "spacing",
      title: "SPACING",
      props: [
        { label: "Padding", type: "number", key: "padding" },
        { label: "Margin", type: "number", key: "margin" },
      ],
    },
  ];

  if (["h1", "p", "span"].includes(node.tag)) {
    groups.push({
      id: "typography",
      title: "TYPOGRAPHY",
      props: [
        { label: "Font", type: "font", key: "fontFamily" },
        { label: "Weight", type: "weight", key: "fontWeight" },
        { label: "Size", type: "number", key: "fontSize" },
        { label: "Color", type: "color", key: "colorValue" },
      ],
    });
  }

  groups.push({
    id: "effects",
    title: "EFFECTS",
    props: [
      { label: "Opacity", type: "range", min: 0, max: 100, unit: "%", key: "opacity" },
      { label: "Radius", type: "range", min: 0, max: 50, unit: "px", key: "borderRadius" },
    ],
  });

  return groups;
});

// ─── DRAG & DROP LOGIC ─────────────────────────────────────────────
const draggingNodeId = ref<string | null>(null);

function onDragStart(nodeId: string) {
  draggingNodeId.value = nodeId;
}

function onDrop(targetNodeId: string) {
  if (!draggingNodeId.value || draggingNodeId.value === targetNodeId) return;
  
  const fromIdx = componentTree.value.findIndex(n => n.id === draggingNodeId.value);
  const toIdx = componentTree.value.findIndex(n => n.id === targetNodeId);
  
  if (fromIdx !== -1 && toIdx !== -1) {
    const [moved] = componentTree.value.splice(fromIdx, 1);
    componentTree.value.splice(toIdx, 0, moved);
    trackEdit('rearrange', `${fromIdx}`, `${toIdx}`);
  }
  draggingNodeId.value = null;
}

// Design properties - reactive
const designProps = reactive({
  opacity: 100,
  borderRadius: 0,
  borderBox: true,
  fontFamily: 'Inter',
  fontWeight: '400',
  fontSize: '16',
  colorMode: 'Solid',
  colorValue: '#111111',
  lineHeight: '24',
  letterSpacing: '0',
});

// Available font options
const fontOptions = ['Inter', 'Roboto', 'Outfit', 'berkeleyMono', 'Fira Code', 'system-ui'];
const weightOptions = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
const colorModes = ['Solid', 'Linear', 'Radial'];
const previewStyles = reactive<Record<string, any>>({
  root: {},
  container: {},
  heading: {},
  subtitle: {},
  button: {}
});

// CSS raw editor
const rawCSS = ref(`/* ${selectedNode.value} styles */
.type-lg {
  font-size: 40px;
  font-weight: 900;
  color: #111;
  letter-spacing: -0.02em;
}`);

// Edit tracking

const pointPromptStyle = computed(() => {
  if (!selectedNode.value) return { display: 'none' };
  
  // Simulation: position near the selected element
  const positions: Record<string, any> = {
    'root': { bottom: '40px', left: '50%' },
    'container': { bottom: '120px', left: '50%' },
    'heading': { bottom: '300px', left: '50%' },
    'subtitle': { bottom: '260px', left: '50%' }
  };
  
  return positions[selectedNode.value] || { bottom: '100px', left: '50%' };
});

function handleQuickEdit() {
  if (!quickEditInput.value.trim()) return;
  
  const text = quickEditInput.value;
  const target = selectedNodeData.value;
  
  messages.value.push({ 
    role: 'assistant', 
    content: `Applying change: "${text}" to &lt;${target?.tag || 'element'}&gt;`,
    agent: agents[1] // Painter
  });
  
  quickEditInput.value = '';
  simulateGeneration();
  
  // Auto-deactivate live edit if it was used for a prompt
  if (liveEditMode.value) liveEditMode.value = false;
}

function toggleLiveEdit() {
  liveEditMode.value = !liveEditMode.value;
  if (liveEditMode.value) {
    // Optionally open design tab if an element is already selected
    if (selectedNode.value) veActiveTab.value = 'design';
  }
}

function trackEdit(prop: string, oldVal: any, newVal: any) {
  editCount.value++;
  editHistory.value.push({ prop, oldVal, newVal, timestamp: Date.now() });
  undoStack.value.push({ prop, oldVal });
}

function undoLastEdit() {
  const last = undoStack.value.pop();
  if (last) {
    (designProps as any)[last.prop] = last.oldVal;
    editCount.value = Math.max(0, editCount.value - 1);
  }
}

function applyEdits() {
  // Record in chat as an action
  const changes = editHistory.value.slice(-editCount.value);
  const summary = changes.map(c => `${c.prop}: ${c.oldVal} → ${c.newVal}`).join(', ');
  messages.value.push({ 
    role: 'assistant', 
    content: `Applied ${editCount.value} visual edits: ${summary}`,
    agent: agents[1] // Painter agent
  });
  scrollToBottom();
  editCount.value = 0;
  editHistory.value = [];
  undoStack.value = [];
}

// Watch all design props for performance and sync with previewStyles
watch(designProps, (newVal) => {
  if (!selectedNode.value) return;
  
  if (!previewStyles[selectedNode.value]) previewStyles[selectedNode.value] = {};
  
  // Use Object.assign to keep the object reactive but update properties fast
  Object.assign(previewStyles[selectedNode.value], {
    opacity: newVal.opacity / 100,
    borderRadius: newVal.borderRadius + 'px',
    fontSize: newVal.fontSize + 'px',
    fontWeight: newVal.fontWeight,
    fontFamily: newVal.fontFamily,
    color: newVal.colorValue,
    lineHeight: newVal.lineHeight + 'px',
    letterSpacing: newVal.letterSpacing + 'px',
  });
  
  // Update rawCSS only if needed (debounced slightly or simplified)
  const node = componentTree.value.find(n => n.id === selectedNode.value);
  if (node) {
    rawCSS.value = `/* ${node.tag}${node.classes} */\n${node.tag}${node.classes} {\n  opacity: ${newVal.opacity}%;\n  border-radius: ${newVal.borderRadius}px;\n  font-family: '${newVal.fontFamily}';\n  font-weight: ${newVal.fontWeight};\n  font-size: ${newVal.fontSize}px;\n  color: ${newVal.colorValue};\n  line-height: ${newVal.lineHeight}px;\n  letter-spacing: ${newVal.letterSpacing}px;\n}`;
  }
}, { deep: true });

function applyStyleToPreview(prop: string, value: string) {
  // Legacy function - now handled by watcher
}

// Update rawCSS when node changes (Keep sync)
watch(selectedNode, (nodeId) => {
  const node = componentTree.value.find(n => n.id === nodeId);
  if (node) {
    rawCSS.value = `/* ${node.tag}${node.classes} */\n${node.tag}${node.classes} {\n  opacity: ${designProps.opacity}%;\n  border-radius: ${designProps.borderRadius}px;\n  font-family: '${designProps.fontFamily}';\n  font-weight: ${designProps.fontWeight};\n  font-size: ${designProps.fontSize}px;\n  color: ${designProps.colorValue};\n  line-height: ${designProps.lineHeight}px;\n  letter-spacing: ${designProps.letterSpacing}px;\n}`;
  }
});

// ─── ORIGINAL METHODS ──────────────────────────────────────────────

onMounted(() => {
  nextTick(() => inputRef.value?.focus());
  
  // Initialize default styles for heading
  if (selectedNode.value === 'heading') {
    previewStyles.heading = {
      opacity: designProps.opacity / 100,
      borderRadius: designProps.borderRadius + 'px',
      fontSize: designProps.fontSize + 'px',
      fontWeight: designProps.fontWeight,
      fontFamily: designProps.fontFamily,
      color: designProps.colorValue,
      lineHeight: designProps.lineHeight + 'px',
      letterSpacing: designProps.letterSpacing + 'px',
    };
  }
});

async function handleInput() {
  const text = userInput.value.trim();
  if (!text || isGenerating.value) return;

  messages.value.push({ role: 'user', content: text });
  userInput.value = '';
  scrollToBottom();

  const currentAgent = selectedAgent.value;

  messages.value.push({ role: 'assistant', content: '', type: 'typing', agent: currentAgent });
  scrollToBottom();
  
  await new Promise(r => setTimeout(r, 800));
  messages.value.pop();
  messages.value.push({ 
    role: 'assistant', 
    content: `Designing a home screen for ${text}. Dealing with ${currentAgent.id} tasks.`, 
    agent: currentAgent 
  });
  scrollToBottom();

  simulateGeneration();
}

async function handleQuickPromptEdit() {
  if (!quickPrompt.value.trim()) return;
  const p = quickPrompt.value;
  quickPrompt.value = '';
  
  messages.value.push({ role: 'user', content: "[Live Edit] " + p, agent: agents[1] });
  simulateGeneration();
}

function toggleFullScreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      console.error(`Error: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

function reloadPreview() {
  if (isGenerating.value) return;
  simulateGeneration();
}

function simulateGeneration() {
  isGenerating.value = true;
  genCount.value = 0;
  genProgress.value = 0;
  activeGenStepIdx.value = 0;

  const interval = setInterval(() => {
    genCount.value++;
    genProgress.value += 5; 
    
    if (genProgress.value > 25) activeGenStepIdx.value = 1;
    if (genProgress.value > 55) activeGenStepIdx.value = 2;
    if (genProgress.value > 85) activeGenStepIdx.value = 3;

    if (genProgress.value >= 100) {
      clearInterval(interval);
      isGenerating.value = false;
      messages.value.push({ 
        role: 'assistant', 
        content: `Architecture for ${activeProjectName.value} defined using ${selectedStack.value.name} and ${selectedModel.value.name}. Ready for review.`,
        agent: selectedAgent.value
      });
      scrollToBottom();
    }
  }, 150);
}

async function switchToManualBuilder() {
  if (isGenerating.value) return;
  
  // Persist current state to store before switching
  if (store.currentPage) {
    store.currentPage.mode = 'normal';
    await store.savePage();
  }

  if (store.currentPage?.id) {
    router.push(`/editor/${store.currentPage.id}`);
  } else {
    router.push('/dashboard');
  }
}

async function remixProject() {
  if (isGenerating.value) return;
  isGenerating.value = true;
  
  const currentName = activeProjectName.value;
  try {
    // 1. Try backend duplication
    let duplicatedSiteId = null;
    if (store.currentPage?.id) {
      await store.duplicatePage(store.currentPage.id);
      // Wait for loadPages to sync
      await store.loadPages();
      const lastPage = store.pages[store.pages.length - 1];
      if (lastPage) duplicatedSiteId = lastPage.id;
    }

    // 2. Local Fallback/Manual Copy (Ensure content is preserved)
    if (!duplicatedSiteId) {
       const newSite = await store.createSite(`${currentName} (Remix)`);
       if (newSite) {
         await store.selectSite(newSite.id);
         const currentBlocks = store.currentPage?.blocks ? JSON.parse(JSON.stringify(store.currentPage.blocks)) : [];
         const newPage = await store.createPage('Home', '/', { 
           mode: 'ai', 
           prompt: `Remix of ${currentName}`,
           blocks: currentBlocks 
         });
         if (newPage) store.currentPage = newPage;
       }
    }

    messages.value.push({ 
      role: 'assistant', 
      content: `✨ Proyecto "${currentName}" remezclado con éxito. Ahora estás trabajando en una copia independiente.`,
      agent: agents[0] // Architect
    });
    scrollToBottom();
  } catch (e) {
    console.error('Remix error:', e);
    messages.value.push({ 
      role: 'assistant', 
      content: `No se pudo realizar el remix. Verifica tu conexión.`,
      agent: agents[0]
    });
    scrollToBottom();
  } finally {
    isGenerating.value = false;
  }
}

function shareProject() {
  isShareModalOpen.value = true;
}

function publishProject() {
  isGithubModalOpen.value = true;
}

// ─── PROJECT STRUCTURE GENERATOR ──────────────────────────────────
const projectFiles = ref<any[]>([]);

function generateProjectStructure(stackId: string) {
  const common = [
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: '.gitignore', type: 'file' }
  ];
  
  if (stackId.includes('nextjs')) {
    projectFiles.value = [
      ...common,
      { name: 'app', type: 'dir', children: [
        { name: 'layout.tsx', type: 'file' },
        { name: 'page.tsx', type: 'file' },
        { name: 'globals.css', type: 'file' }
      ]},
      { name: 'public', type: 'dir', children: [] },
      { name: 'next.config.js', type: 'file' }
    ];
  } else if (stackId.includes('vue')) {
    projectFiles.value = [
      ...common,
      { name: 'src', type: 'dir', children: [
        { name: 'App.vue', type: 'file' },
        { name: 'main.ts', type: 'file' },
        { name: 'components', type: 'dir', children: [] }
      ]},
      { name: 'vite.config.ts', type: 'file' }
    ];
  } else {
    projectFiles.value = common;
  }
}

watch(() => selectedStack.value, (newStack) => {
  generateProjectStructure(newStack.id);
}, { immediate: true });

function scrollToBottom() {
  nextTick(() => {
    if (historyRef.value) {
      historyRef.value.scrollTop = historyRef.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
.ai-studio-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  color: var(--text-main);
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* HEADER (STUDIO CLEAN) */
.studio-header {
  height: 54px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.header-left { display: flex; align-items: center; gap: 12px; }
.back-btn-studio {
  background: var(--bg-surface-alt); border: 1px solid var(--border-main);
  padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 500;
  display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text-muted);
  transition: all 0.2s;
}
.back-btn-studio:hover { background: var(--bg-surface); color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.header-sep { width: 1px; height: 16px; background: var(--border-main); }
.project-title-studio { font-size: 14px; font-weight: 600; color: var(--text-main); }

.header-right { display: flex; align-items: center; gap: 8px; }
.btn-studio-ghost {
  background: transparent; border: none; padding: 6px 12px; border-radius: 6px;
  font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; gap: 6px; transition: all 0.2s;
}
.btn-studio-ghost:hover { background: var(--bg-surface-alt); color: var(--text-main); }
.actions-sep { width: 1px; height: 16px; background: var(--border-main); margin: 0 4px; }

.btn-studio-manual {
  background: linear-gradient(135deg, #4f46e5, #6366f1, #8b5cf6);
  color: #fff; border: none;
  padding: 6px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.btn-studio-manual:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }
.btn-studio-manual svg { transition: transform 0.3s; }
.btn-studio-manual:hover svg { transform: translateX(3px); }

.user-avatar-studio {
  width: 28px; height: 28px; border-radius: 50%; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #6b7280;
  margin-left: 8px; border: 1px solid var(--border-main);
}

/* MAIN SPLIT */
.studio-main-split { flex: 1; display: flex; overflow: hidden; background: #fafafa; }

/* INTERACTION PANE */
.interaction-pane {
  width: 440px;
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 4px 0 20px rgba(0,0,0,0.01);
}

.pane-content { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }

.model-badge-v3 {
  display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px;
  border: 1px solid var(--border-main); background: var(--bg-main);
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.sparkle { color: #8b5cf6; }
.model-name { font-size: 13px; font-weight: 600; }
.dot { opacity: 0.2; }
.run-time { font-size: 12px; color: var(--text-muted); flex: 1; }
.btn-model-settings { background: transparent; border: none; color: var(--text-dim); cursor: pointer; }

.history-item-v3 { display: flex; gap: 16px; line-height: 1.6; }
.bot-icon-wrapper { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.bot-icon {
  width: 32px; height: 32px; border-radius: 10px; border: 1px solid var(--border-main);
  display: flex; align-items: center; justify-content: center;
}
.bot-icon.architect { background: var(--brand-primary); color: #fff; }
.bot-icon.painter { background: #ec4899; color: #fff; }
.bot-icon.researcher { background: #10b981; color: #fff; }
.agent-name-label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em; }

.msg-content-v3 { font-size: 14px; color: var(--text-muted); flex: 1; padding-top: 4px; }
.user .msg-content-v3 { 
  background: var(--bg-surface-alt); padding: 12px 16px; border-radius: 16px; border-bottom-right-radius: 4px;
  color: var(--text-main); font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.section-divider {
  display: flex; align-items: center; gap: 12px; font-size: 11px; font-weight: 700;
  color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em;
  margin-top: 12px;
}
.section-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }

.checkpoint-list { display: flex; flex-direction: column; gap: 10px; }
.checkpoint-item {
  display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 14px;
  background: var(--bg-main); border: 1px solid var(--border-subtle); transition: all 0.2s;
  position: relative;
}
.checkpoint-item.active { border-color: var(--brand-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.cp-indicator { width: 8px; height: 8px; border-radius: 50%; background: var(--border-main); }
.cp-indicator.completed { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.cp-info { flex: 1; display: flex; flex-direction: column; }
.cp-label { font-size: 13px; font-weight: 700; color: var(--text-main); }
.cp-time { font-size: 11px; color: var(--text-dim); }
.checkpoint-ico { color: var(--brand-primary); opacity: 0.6; }
.btn-checkpoint-action {
  background: var(--bg-surface-alt); border: 1px solid var(--border-main);
  padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.btn-checkpoint-action:hover { background: #fff; color: var(--brand-primary); border-color: var(--brand-primary); }

/* PROMPT FOOTER */
.prompt-footer-v3 { padding: 24px; border-top: 1px solid var(--border-subtle); background: var(--bg-surface); }
.input-container-v3 {
  border: 1px solid var(--border-main); border-radius: 20px; padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}
.input-container-v3:focus-within { border-color: var(--brand-primary); box-shadow: 0 10px 50px rgba(99, 102, 241, 0.15); transform: translateY(-2px); }

.composer-textarea-v3 {
  width: 100%; min-height: 44px; max-height: 160px; border: none; outline: none;
  background: transparent; color: var(--text-main); font-size: 15px; resize: none;
  line-height: 1.5;
}

.footer-actions-v3 { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
.left-tools { display: flex; align-items: center; }
.agent-selector-v3 { display: flex; gap: 4px; background: var(--bg-surface-alt); padding: 4px; border-radius: 10px; margin-right: 8px; }
.agent-tab-btn {
  border: none; background: transparent; padding: 4px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 700; color: var(--text-muted); cursor: pointer;
  transition: all 0.2s;
}
.agent-tab-btn.active { background: #fff; color: var(--brand-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.tool-sep { width: 1px; height: 16px; background: var(--border-main); margin: 0 8px; }
.tool-btn { background: transparent; border: none; color: var(--text-dim); cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.2s; }
.tool-btn:hover { background: var(--bg-surface-alt); color: var(--text-main); }

.btn-send-v3 {
  width: 36px; height: 36px; border-radius: 12px; background: var(--brand-primary); color: #fff;
  border: none; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s;
}
.btn-send-v3:hover { transform: scale(1.05); background: var(--brand-primary-hover); }
.btn-send-v3:disabled { opacity: 0.2; transform: none !important; }
.footer-note-v3 { font-size: 11px; color: var(--text-dim); text-align: center; margin-top: 16px; font-weight: 500; }

/* WORKSPACE PANE */
.workspace-pane { flex: 1; display: flex; flex-direction: column; background: #fdfdfd; }

.workspace-tabs {
  height: 54px; background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px; gap: 16px;
}
.visual-tabs-left, .visual-tabs-right, .visual-tabs-center { display: flex; align-items: center; }
.visual-tabs-left { width: 33%; gap: 16px; }
.visual-tabs-right { width: 33%; justify-content: flex-end; gap: 10px; }
.visual-tabs-center { width: 34%; justify-content: center; }

.browser-nav-tools { display: flex; align-items: center; gap: 6px; }

.tab-pair { display: flex; gap: 4px; background: var(--bg-surface-alt); padding: 4px; border-radius: 10px; }
.tab-btn {
  border: none; background: transparent; padding: 4px 14px; border-radius: 8px;
  font-size: 13px; font-weight: 700; color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; gap: 6px; transition: all 0.2s;
}
.tab-btn.active { background: #fff; color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.url-input-studio {
  background: rgba(243, 244, 246, 0.6); border: 1px solid var(--border-subtle);
  padding: 6px 14px; border-radius: 12px; font-size: 12px; color: var(--text-muted);
  display: flex; align-items: center; gap: 10px; width: 100%; max-width: 400px; font-weight: 500;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.02); transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.url-input-studio:focus-within { border-color: var(--brand-primary); background: #fff; }
.url-input-studio svg { opacity: 0.6; }

.visual-tabs-center { gap: 6px; }

.edit-stats { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-right: 8px; }
.btn-studio-apply { 
  background: var(--brand-primary); color: #fff; border: none; padding: 6px 14px; 
  border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; margin-left: 4px;
}
.btn-icon-studio { background: transparent; border: none; color: var(--text-dim); cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center;}
.btn-icon-studio:hover { background: var(--bg-surface-alt); color: var(--text-main); }
.btn-icon-studio.active { color: var(--brand-primary); background: var(--bg-surface-alt); }

/* LIVE EDIT BUTTON */
.btn-live-edit {
  display: flex; align-items: center; gap: 6px; background: transparent;
  border: 1px solid var(--border-main); padding: 5px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 700; color: var(--text-muted); cursor: pointer;
  transition: all 0.2s;
}
.btn-live-edit:hover { border-color: var(--brand-primary); color: var(--brand-primary); background: rgba(99,102,241,0.04); }
.btn-live-edit.active {
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06));
  border-color: var(--brand-primary); color: var(--brand-primary);
  box-shadow: 0 0 0 2px rgba(99,102,241,0.15);
}

/* MAIN SPLIT CONTAINERS */
.workspace-content-split { flex: 1; display: flex; overflow: hidden; }

/* VIEWPORT */
.workspace-viewport { flex: 1; position: relative; overflow: hidden; padding: 0; background: #f3f3f6; }

/* PREVIEW */
.preview-container-v3 { height: 100%; position: relative; padding: 32px; box-sizing: border-box; display: flex; justify-content: center; align-items: flex-start; overflow: auto;}
.preview-iframe-wrapper {
  height: 100%; width: 100%; max-width: 1440px; background: #fff; position: relative; min-height: 800px;
  display: flex; flex-direction: column; overflow: hidden; margin: 0 auto;
  box-shadow: 0 20px 80px rgba(0,0,0,0.08); border-radius: 12px; border: 1px solid var(--border-subtle);
}

/* VISUAL EDITOR SIDEBAR */
.visual-editor-sidebar {
  width: 280px; background: #fff; border-left: 1px solid var(--border-subtle);
  display: flex; flex-direction: column; overflow-y: auto; font-family: 'Inter', sans-serif;
  color: #333; z-index: 10;
}
.ve-section { padding: 16px; border-bottom: 1px solid var(--border-subtle); }
.ve-header { font-size: 12px; font-weight: 800; color: #111; margin-bottom: 12px; }
.ve-tree { display: flex; flex-direction: column; gap: 2px; }
.ve-tree-item { 
  font-size: 12px; padding: 4px 8px; border-radius: 6px; cursor: pointer; color: #555; font-family: 'Fira Code', monospace;
  display: flex; align-items: center; gap: 6px;
}
.ve-tree-item:hover { background: #f1f5f9; }
.ve-tree-item.active { background: #e0e7ff; color: #4338ca; font-weight: 600; }
.ve-tree-item svg { opacity: 0.5; }
.ve-tree-item.active svg { opacity: 1; color: #4338ca; }
.pl-4 { padding-left: 16px; }
.pl-8 { padding-left: 24px; }

.ve-prop-group { border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface); }
.ve-prop-group-header { 
  padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; 
  background: var(--bg-surface-alt); font-size: 10px; font-weight: 800; color: var(--text-dim); 
  text-transform: uppercase; cursor: pointer;
}
.ve-prop-table { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.ve-prop-row { display: grid; grid-template-columns: 80px 1fr; align-items: center; gap: 12px; }
.ve-prop-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: capitalize; }

.ve-prop-control { width: 100%; }
.ve-prop-select { 
  width: 100%; height: 32px; border: 1px solid var(--border-main); border-radius: 8px; 
  font-size: 12px; font-weight: 600; color: var(--text-main); padding: 0 10px; outline: none; 
  background: var(--bg-surface); transition: all 0.2s;
}
.ve-prop-select:focus { border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

.ve-prop-range-wrap { display: flex; align-items: center; gap: 10px; }
.ve-prop-slider { flex: 1; height: 4px; -webkit-appearance: none; background: var(--border-main); border-radius: 2px; outline: none; }
.ve-prop-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--brand-primary); cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.ve-prop-val { font-size: 11px; font-weight: 700; color: var(--text-main); width: 32px; text-align: right; }

.ve-prop-number-wrap { 
  display: flex; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-main); 
  border-radius: 8px; padding: 0 10px; height: 32px; transition: all 0.2s;
}
.ve-prop-number-wrap:focus-within { border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.ve-prop-num-input { border: none; width: 100%; outline: none; font-size: 12px; font-weight: 700; background: transparent; color: var(--text-main); }
.ve-prop-unit { font-size: 10px; color: var(--text-dim); font-weight: 700; }

.ve-prop-color-wrap { display: flex; align-items: center; gap: 10px; }
.ve-prop-color-picker { 
  width: 24px; height: 24px; border: 1px solid var(--border-main); border-radius: 6px; 
  cursor: pointer; padding: 0; background: none; overflow: hidden;
}
.ve-prop-color-picker::-webkit-color-swatch { border: none; }
.ve-prop-hex { font-size: 11px; font-weight: 700; font-family: 'Fira Code', monospace; color: var(--text-muted); }

.ve-textarea-v2 {
  width: 100%; height: 100%; border: none; background: #0f172a; 
  color: #94a3b8; padding: 20px; font-family: var(--font-mono); 
  font-size: 13px; line-height: 1.6; resize: none; outline: none;
}


/* QUICK AI EDITOR */
.quick-ai-overlay {
  position: absolute; top: 24px; left: 50%; transform: translateX(-50%); z-index: 100;
  width: 480px;
}
.quick-ai-box {
  background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(24px);
  border: 1px solid var(--border-subtle); border-radius: 20px; padding: 20px;
  display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--brand-primary);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.quick-ai-header { display: flex; justify-content: space-between; align-items: center; }
.quick-ai-header span { font-size: 12px; font-weight: 800; color: var(--brand-primary); text-transform: uppercase; letter-spacing: 0.1em; }
.quick-ai-header button { background: transparent; border: none; color: var(--text-dim); cursor: pointer; }
.quick-ai-box textarea {
  width: 100%; border: none; background: transparent; resize: none; outline: none;
  font-size: 16px; color: #111; min-height: 80px; font-weight: 500; line-height: 1.5;
}
.quick-ai-footer { display: flex; justify-content: flex-end; }
.btn-quick-run {
  background: var(--brand-primary); color: #fff; border: none;
  padding: 8px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.btn-quick-run:hover { background: var(--brand-primary-hover); transform: translateY(-1px); }

.empty-preview-v3 { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; }
.hero-studio-v3 h1 { font-size: 40px; font-weight: 900; color: #111; margin-bottom: 16px; letter-spacing: -0.02em; }
.hero-studio-v3 p { color: #6b7280; font-size: 18px; max-width: 500px; line-height: 1.6; }

.content-placeholder-v3 { padding: 60px; }
.mock-card-studio { height: 160px; background: #f9fafb; border-radius: 24px; margin-top: 32px; border: 1px solid #f1f5f9; }

/* CODE MODE */
.code-container-v3 { height: 100%; display: flex; }
.code-explorer-v3 { width: 260px; border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; background: var(--bg-surface); }
.explorer-header { padding: 20px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; }
.explorer-tree { padding: 16px; display: flex; flex-direction: column; gap: 6px; }
.tree-item { padding: 8px 12px; border-radius: 8px; font-size: 13px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
.tree-item:hover { background: var(--bg-surface-alt); }
.tree-item.active { background: var(--bg-surface-alt); color: var(--text-main); font-weight: 700; }
.tree-item.dir { font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px; }

.code-editor-v3 { flex: 1; display: flex; flex-direction: column; background: #fff; }
.editor-header { height: 44px; background: #fcfcfd; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; padding: 0 16px; }
.file-tab { padding: 0 16px; height: 100%; display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; color: #64748b; border-right: 1px solid #f1f5f9; }
.file-tab.active { background: #fff; color: #0f172a; }
.editor-content { flex: 1; padding: 32px; font-family: 'Fira Code', 'Monaco', monospace; font-size: 14px; line-height: 1.7; color: #334155; overflow: auto; }

/* GENERATION */
.gen-overlay-studio {
  position: absolute; inset: 0; background: rgba(255,255,255,0.96); z-index: 10;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.arch-loader { position: relative; width: 80px; height: 80px; margin-bottom: 32px; }
.arch-ring { position: absolute; inset: 0; border: 5px solid #f1f5f9; border-top-color: var(--brand-primary); border-radius: 50%; animation: spin 1s infinite cubic-bezier(0.5,0,0.5,1); }
.arch-logo { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 32px; }

.global-gen-footer {
  position: fixed; bottom: 32px; right: 32px; width: 380px;
  background: #0f172a; color: #fff; border-radius: 20px; padding: 24px; z-index: 1000;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}
.gen-progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
.gen-p-fill { height: 100%; background: linear-gradient(90deg, #fff, #94a3b8); transition: width 0.3s; }
.gen-details-v3 { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; }
.gen-timer { opacity: 0.6; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }

@keyframes spin { to { transform: rotate(360deg); } }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100px); opacity: 0; }

/* VISUAL EDITOR CONTROLS */
.ve-node-icon { font-size: 10px; color: #94a3b8; font-weight: 700; width: 14px; text-align: center; }
.ve-tree-item.active .ve-node-icon { color: #4338ca; }

.ve-selected-tag { font-size: 10px; color: #64748b; font-family: 'Fira Code', monospace; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }

.ve-slider { 
  width: 100%; height: 4px; -webkit-appearance: none; appearance: none; background: #e2e8f0; 
  border-radius: 2px; outline: none; cursor: pointer; margin-bottom: 6px;
}
.ve-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--brand-primary); cursor: pointer; }

.ve-num-input { 
  border: none; background: transparent; width: 40px; outline: none; 
  font-size: 11px; color: #111; font-weight: 600; text-align: right;
  -moz-appearance: textfield;
}
.ve-num-input::-webkit-outer-spin-button,
.ve-num-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.ve-color-row { display: flex; align-items: center; gap: 8px; }
.ve-color-picker { 
  width: 28px; height: 28px; border: 1px solid #e2e8f0; border-radius: 6px; 
  cursor: pointer; -webkit-appearance: none; appearance: none; padding: 0;
}
.ve-color-picker::-webkit-color-swatch-wrapper { padding: 2px; }
.ve-color-picker::-webkit-color-swatch { border: none; border-radius: 3px; }
.ve-color-text { 
  flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; 
  font-size: 11px; color: #111; font-weight: 600; font-family: 'Fira Code', monospace; outline: none;
}
.ve-color-text:focus { border-color: var(--brand-primary); }
.ve-select-sm { width: 80px; flex-shrink: 0; }

.ve-css-editor { flex: 1; }
.ve-css-textarea { 
  width: 100%; min-height: 300px; border: none; background: #1e293b; color: #e2e8f0; 
  font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.6; 
  padding: 16px; border-radius: 8px; resize: vertical; outline: none;
}
.ve-css-textarea::selection { background: rgba(99, 102, 241, 0.4); }

/* ═══ ELEMENT SELECTION (always active) ═══ */
.node-hovered {
  outline: 1.5px dashed rgba(99, 102, 241, 0.8) !important;
  outline-offset: 3px;
  cursor: pointer;
  z-index: 40;
}

.node-selected {
  outline: 3px solid #6366f1 !important;
  outline-offset: 4px;
  position: relative;
  z-index: 1000 !important; /* Force to top */
  background: rgba(99, 102, 241, 0.12) !important;
  box-shadow: 0 0 0 10px rgba(99, 102, 241, 0.05);
}

.node-selected::after {
  content: attr(data-tag);
  position: absolute;
  top: -26px;
  left: -2px;
  background: #6366f1;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  pointer-events: none !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  display: block !important;
  visibility: visible !important;
}

.studio-status-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.8);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 20px;
  z-index: 2000;
  pointer-events: none;
}

/* ═══ POINT & PROMPT FLOATING BAR ═══ */
.point-prompt-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 12px;
  padding: 8px 14px;
  border: 1px solid var(--brand-primary);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  z-index: 1000;
  transform: translateX(-50%);
}

.pp-tag {
  font-size: 10px;
  font-weight: 800;
  background: #eef2ff;
  color: #4338ca;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  white-space: nowrap;
}

.pp-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pp-input-wrap input {
  border: none;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  width: 220px;
  background: transparent;
  color: var(--text-main);
}

.pp-input-wrap button {
  background: var(--brand-primary);
  color: #fff;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
  flex-shrink: 0;
}
.pp-input-wrap button:hover { transform: scale(1.1); }

/* ═══ LIVE EDIT MODE ENHANCEMENTS ═══ */
.preview-iframe-wrapper.live-mode {
  cursor: crosshair;
}

.live-mode .content-placeholder-v3 > * {
  transition: outline 0.1s ease, background 0.1s ease;
}

/* ═══ TRANSITIONS ═══ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ═══ UTILITY STYLES ═══ */
.btn-icon-studio svg { transition: transform 0.2s; }
.btn-icon-studio:active svg { transform: scale(0.9); }
.btn-icon-studio:disabled { opacity: 0.3; cursor: not-allowed; }

.typing-dots { display: flex; gap: 4px; padding: 6px 0; }
.typing-dots span { width: 5px; height: 5px; background: var(--brand-primary); border-radius: 50%; animation: bounce 1s infinite alternate; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }

@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes slideInUp {
  from { transform: translateY(5px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
