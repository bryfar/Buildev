<template>
  <div class="dashboard-root" :class="{ 'theme-dark': ui.theme === 'dark' }">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-group">
          <div class="logo-box">
             <img src="../assets/isotype.svg" alt="Buildev" class="sidebar-isotype" />
          </div>
          <span class="brand-name">Buildev</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <p class="section-title">Main</p>
          <a class="nav-item" :class="{ active: view === 'projects' }" @click="view = 'projects'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Projects
          </a>
          <a v-if="store.currentSiteId" class="nav-item" :class="{ active: view === 'pages' }" @click="view = 'pages'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Pages
          </a>
        </div>
        
        <div class="nav-section">
          <p class="section-title">Library</p>
          <a class="nav-item" :class="{ active: view === 'symbols' }" @click="view = 'symbols'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            Symbols
          </a>
          <a class="nav-item" :class="{ active: view === 'assets' }" @click="view = 'assets'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Assets
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle-v12" @click="ui.toggleTheme()">
           <span v-if="ui.theme === 'light'">🌙 Dark</span>
           <span v-else>☀️ Light</span>
        </button>

        <div v-if="currentSite" class="active-workspace-card">
          <div class="workspace-header">
             <span class="pulse-dot"></span>
             <span class="label">CURRENT WORKSPACE</span>
          </div>
          <p class="workspace-name">{{ currentSite.name }}</p>
        </div>

        <button class="logout-btn-v12" @click="handleLogout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- CONTENT -->
    <main class="main-content">
      <header class="content-header">
        <div v-if="view === 'projects'" class="header-left">
          <h1>Projects</h1>
          <p class="subtitle">Manage and build your high-converting websites</p>
        </div>
        <div v-else class="header-left">
          <div class="breadcrumb-nav-v12">
             <span class="crumb-link" @click="view = 'projects'">Projects</span>
             <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
             <span class="crumb-current">{{ currentSite?.name }}</span>
          </div>
          <h1 class="view-title">{{ view === 'pages' ? 'Site Pages' : view }}</h1>
        </div>

        <div class="header-actions">
          <div class="search-box">
             <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
             <input type="text" placeholder="Search projects..." />
          </div>
          <button v-if="view === 'projects'" class="btn-create shadow-glow" @click="openProjectModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
          <button v-else class="btn-create shadow-glow" @click="openPageModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Page
          </button>
        </div>
      </header>

      <section class="scroll-area">
        <!-- PROJECTS GRID -->
        <div v-if="view === 'projects'" class="grid-container">
          <div v-if="store.isLoading" class="skeleton-grid">
             <div v-for="i in 4" :key="i" class="skeleton-card"></div>
          </div>
          <div v-else class="projects-grid">
            <div 
              v-for="site in store.sites" 
              :key="site.id" 
              class="project-card" 
              :class="{ active: store.currentSiteId === site.id }"
              @click="handleSelectSite(site.id)"
            >
              <div class="card-preview">
                <div class="preview-overlay">
                   <button class="btn-open">Open Editor</button>
                </div>
                <div class="pattern-bg"></div>
                <div class="card-initial">{{ site.name[0] }}</div>
              </div>
              <div class="card-body">
                <div class="card-main-info">
                   <h3 class="card-title">{{ site.name }}</h3>
                   <p class="card-url">{{ site.subdomain || 'site-' + site.id.slice(0,4) }}.buildev.live</p>
                </div>
                <div class="card-footer">
                   <span class="tag">Production</span>
                   <span class="timestamp">Last updated 2 days ago</span>
                </div>
              </div>
            </div>
            
            <div v-if="store.sites.length === 0 && !store.isLoading" class="empty-state">
               <div class="empty-icon-v12">
                 <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
               </div>
               <h3>No projects yet</h3>
               <p>Start your journey by creating your first awesome website.</p>
               <button class="btn-create" @click="openProjectModal">Create my first project</button>
            </div>
          </div>
        </div>

        <!-- PAGES GRID -->
        <div v-if="view === 'pages'" class="grid-container">
           <div v-if="store.isLoading" class="skeleton-grid">
             <div v-for="i in 6" :key="i" class="skeleton-card mini"></div>
          </div>
          <div v-else class="pages-grid">
            <div v-for="page in store.pages" :key="page.id" class="page-row" @click="router.push(`/editor/${page.id}`)">
              <div class="page-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="page-details">
                <span class="page-name">{{ page.name }}</span>
                <span class="page-path">{{ page.urlPath }}</span>
              </div>
              <div class="page-status">
                <span class="dot-badge" :class="page.status"></span>
                {{ page.status }}
              </div>
              <div class="page-actions">
                <button class="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
            </div>

            <div v-if="store.pages.length === 0 && !store.isLoading" class="empty-state">
               <h3>This project is empty</h3>
               <p>Create a page to start building your design.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- MODALS -->
    <Transition name="fade">
      <div v-if="showCreateProject || showCreatePage" class="modal-backdrop" @click.self="closeModals">
        <div class="modal-box premium-card bounce-in" :class="{ 'modal-wide': showCreateProject, 'modal-ai-architect': showCreateProject && selectedMode === 'ai' && creationStep === 2 }">
          <div class="modal-header">
            <div class="header-with-steps" v-if="showCreateProject">
              <h2>{{ selectedMode === 'ai' ? 'AI Project Architect' : 'Create Project' }}</h2>
              <div class="step-indicator" v-if="selectedMode !== 'ai'">Step {{ creationStep }} of 3</div>
            </div>
            <h2 v-else>New Page</h2>
            <button class="btn-close" @click="closeModals">×</button>
          </div>
          
          <div class="modal-body">
            <!-- CREATE PROJECT WIZARD -->
            <template v-if="showCreateProject">
              <!-- Mode Selection -->
              <div v-if="creationStep === 1" class="mode-selection">
                <p class="step-desc">Choose your starting point</p>
                <div class="mode-grid-horizontal">
                  <div class="mode-card-v2 ai" :class="{ active: selectedMode === 'ai' }" @click="navToAIStudio">
                    <div class="mode-badge">✨ Recommended</div>
                    <div class="mode-viz">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h3>AI Assistant</h3>
                    <p>Conversational building with real-time architecting.</p>
                  </div>
                  <div class="mode-card-v2 figma" :class="{ active: selectedMode === 'figma' }" @click="selectedMode = 'figma'">
                    <div class="mode-viz">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zM12 2h3.5A3.5 3.5 0 1 1 12 5.5V2zM5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5zM12 9h3.5A3.5 3.5 0 1 1 12 12.5V9zM5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/></svg>
                    </div>
                    <h3>Figma Import</h3>
                    <p>Convert your designs into pixel-perfect code instantly.</p>
                  </div>
                  <div class="mode-card-v2 reverse" :class="{ active: selectedMode === 'reverse' }" @click="selectedMode = 'reverse'">
                     <div class="mode-viz">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                     </div>
                     <h3>Reverse UI</h3>
                     <p>Upload a screenshot and AI will detect its structure.</p>
                  </div>
                  <div class="mode-card-v2 normal" :class="{ active: selectedMode === 'normal' }" @click="selectedMode = 'normal'">
                    <div class="mode-viz">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                    </div>
                    <h3>Normal Start</h3>
                    <p>Traditional setup with your choice of frontend stack.</p>
                  </div>
                </div>
              </div>

              <!-- AI Flow -->
              <BSAIChatWizard
                v-else-if="selectedMode === 'ai' && creationStep === 2"
                :key="aiWizardKey"
                @complete="handleAIComplete"
                @cancel="creationStep = 1"
              />

              <!-- Figma/Normal/Reverse Details -->
              <div v-else-if="creationStep === 2" class="details-entry">
                <!-- Reverse Mode Upload -->
                <div v-if="selectedMode === 'reverse'" class="reverse-upload-zone">
                   <div class="upload-box" @click="fileInput?.click()" :class="{ loading: isReverseAnalyzing }">
                      <input type="file" ref="fileInput" hidden accept="image/*" @change="handleReverseUpload" />
                      <template v-if="!isReverseAnalyzing">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                        <p>Click to upload screenshot</p>
                      </template>
                      <template v-else>
                        <div class="pulse-ring"></div>
                        <p>AI analyzing structure...</p>
                      </template>
                   </div>
                </div>

                <template v-else>
                  <div class="input-group">
                    <label>Project Name</label>
                    <input v-model="newProject.name" type="text" placeholder="e.g. My SaaS Product" autofocus />
                  </div>
                  <div v-if="selectedMode === 'figma'" class="input-group">
                    <label>Figma File URL</label>
                    <input v-model="newProject.figmaUrl" type="text" placeholder="https://www.figma.com/file/..." />
                  </div>
                  <div v-if="selectedMode === 'normal'" class="input-group">
                    <label>Frontend Stack</label>
                    <div class="stack-grid">
                       <div class="stack-item" :class="{ selected: newProject.stack === 'vite-vue' }" @click="newProject.stack = 'vite-vue'">Vite + Vue</div>
                       <div class="stack-item" :class="{ selected: newProject.stack === 'next-react' }" @click="newProject.stack = 'next-react'">Next.js + React</div>
                       <div class="stack-item" :class="{ selected: newProject.stack === 'nuxt' }" @click="newProject.stack = 'nuxt'">Nuxt.js</div>
                    </div>
                  </div>
                </template>
              </div>
            </template>

            <!-- NEW PAGE (KEEPING IT SIMPLE) -->
            <template v-else>
              <div class="input-group">
                <label>Page Title</label>
                <input v-model="newPage.name" type="text" placeholder="e.g. Landing Page" />
              </div>
              <div class="input-group">
                <label>URL Path</label>
                <div class="path-input">
                   <span>/</span>
                   <input v-model="newPage.urlPath" type="text" placeholder="home" />
                </div>
              </div>
            </template>
          </div>

          <div class="modal-footer" v-if="showCreateProject || showCreatePage">
            <template v-if="showCreateProject">
              <template v-if="selectedMode === 'ai' && creationStep === 2">
                <button type="button" class="btn-cancel" @click="creationStep = 1">
                  Back to modes
                </button>
              </template>
              <template v-else>
                <button type="button" class="btn-cancel" @click="creationStep > 1 ? creationStep-- : closeModals()">
                  {{ creationStep === 1 ? 'Cancel' : 'Back' }}
                </button>
                <button
                  type="button"
                  class="btn-submit"
                  v-if="creationStep < 2"
                  @click="selectedMode === 'ai' ? navToAIStudio() : creationStep++"
                >
                  Continue
                </button>
                <button
                  type="button"
                  class="btn-submit"
                  v-else-if="selectedMode !== 'ai'"
                  :disabled="!newProject.name || (selectedMode === 'figma' && !newProject.figmaUrl)"
                  @click="handleCreateProject"
                >
                  {{ isSaving ? 'Launching...' : 'Create Project' }}
                </button>
              </template>
            </template>
            <template v-else>
              <button type="button" class="btn-cancel" @click="closeModals">Cancel</button>
              <button type="button" class="btn-submit" :disabled="isSaving" @click="handleCreatePage()">
                <span v-if="isSaving" class="spinner-sm"></span>
                {{ isSaving ? 'Processing...' : 'Create Page' }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/auth";
import { usePagesStore } from "../store/pages";
import { useUIStore } from "../store/ui";
import BSAIChatWizard from "../components/modals/BSAIChatWizard.vue";
import { aiService } from "../services/aiService";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const store = usePagesStore();
const ui = useUIStore();

const view = ref<'projects' | 'pages' | 'symbols' | 'assets'>('projects');
const showCreateProject = ref(false);
const showCreatePage = ref(false);
const isSaving = ref(false);
const isReverseAnalyzing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Wizard State
const creationStep = ref(1);
const selectedMode = ref<'ai' | 'normal' | 'figma' | 'reverse'>('ai');
const newProject = reactive({ 
  name: "", 
  prompt: "", 
  figmaUrl: "", 
  stack: "vite-vue", 
  backend: "none" 
});

const newPage = ref({ name: "", urlPath: "" });
const aiWizardKey = ref(0);

function navToAIStudio() {
  closeModals();
  router.push('/ai-studio');
}

const currentSite = computed(() => store.sites.find((s: any) => s.id === store.currentSiteId));

async function refreshDashboard() {
  try {
    await store.loadSites();
    if (store.currentSiteId && store.sites.length > 0) {
      view.value = 'pages';
      await Promise.all([store.loadPages(), store.loadComponents()]);
    }
  } catch (err) {
    console.error("Dashboard Load Error:", err);
  }
}

watch(
  () => route.path,
  (path) => {
    if (path !== "/" && path !== "/dashboard") return;
    refreshDashboard();
  },
  { immediate: true }
);

function openProjectModal() {
  creationStep.value = 1;
  selectedMode.value = 'ai';
  newProject.name = "";
  newProject.prompt = "";
  newProject.figmaUrl = "";
  newProject.stack = "vite-vue";
  newProject.backend = "none";
  aiWizardKey.value += 1;
  showCreateProject.value = true;
}

function openPageModal() {
  newPage.value = { name: "", urlPath: "" };
  showCreatePage.value = true;
}

function closeModals() {
  showCreateProject.value = false;
  showCreatePage.value = false;
  isSaving.value = false;
}

async function handleSelectSite(id: string) {
  await store.selectSite(id);
  view.value = 'pages';
  store.loadComponents();
}

async function handleAIComplete(data: { name: string; prompt: string; architecture?: unknown }) {
  newProject.name = data.name;
  newProject.prompt = data.prompt;
  await handleCreateProject();
}

async function handleCreateProject() {
  if (!newProject.name || isSaving.value) return;
  isSaving.value = true;
  try {
    const site = await store.createSite(newProject.name, {
      mode: selectedMode.value,
      prompt: newProject.prompt,
      figmaUrl: newProject.figmaUrl,
      stack: newProject.stack,
      backend: newProject.backend
    });
    
    if (site) {
      showCreateProject.value = false;
      await store.selectSite(site.id);
      view.value = 'pages';
    }
  } catch (err) {
    console.error("Project Creation Error:", err);
  } finally {
    isSaving.value = false;
  }
}

async function handleCreatePage() {
  if (!newPage.value.name || isSaving.value) return;
  isSaving.value = true;
  try {
    const path = newPage.value.urlPath.startsWith('/') ? newPage.value.urlPath : '/' + (newPage.value.urlPath || '');
    const page = await store.createPage(newPage.value.name, path);
    if (page) {
       showCreatePage.value = false;
       router.push(`/editor/${page.id}`);
    }
  } catch (err) {
    console.error("Page Creation Error:", err);
  } finally {
    isSaving.value = false;
  }
}

async function handleReverseUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  isReverseAnalyzing.value = true;
  try {
    const blocks = await aiService.reverseUI(file);
    const siteName = `Reverse UI - ${file.name.split('.')[0]}`;
    const site = await store.createSite(siteName, {
      mode: 'reverse',
      prompt: `Generated from screenshot: ${file.name}`,
      blocks
    });
    if (site) {
      showCreateProject.value = false;
      await store.selectSite(site.id);
      view.value = 'pages';
    }
  } catch (err) {
    alert("AI Analysis failed: " + err);
  } finally {
    isReverseAnalyzing.value = false;
  }
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}

</script>

<style scoped>
.dashboard-root { display: flex; height: 100vh; background: var(--bg-main); color: var(--text-main); font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }

/* SIDEBAR */
.sidebar { width: 260px; background: var(--bg-sidebar); border-right: 1px solid var(--border-main); display: flex; flex-direction: column; padding: 32px 16px; flex-shrink: 0; box-shadow: 4px 0 24px rgba(0,0,0,0.02); z-index: 10; }
.sidebar-header { margin-bottom: 40px; padding: 0 12px; }
.logo-group { display: flex; align-items: center; gap: 12px; }
.logo-box { width: 32px; height: 32px; background: var(--brand-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
.sidebar-isotype { width: 20px; height: 20px; filter: brightness(0) invert(1); }
.brand-name { font-weight: 800; font-size: 20px; letter-spacing: -0.02em; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 28px; }
.section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.12em; margin-bottom: 12px; padding-left: 12px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.nav-icon { width: 18px; height: 18px; opacity: 0.7; }
.nav-item:hover { background: var(--bg-surface-alt); color: var(--text-main); }
.nav-item.active { background: var(--brand-primary); color: #fff; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25); }
.nav-item.active .nav-icon { opacity: 1; }

.sidebar-footer { padding-top: 24px; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 16px; }

.theme-toggle-v12 {
  width: 100%; padding: 12px; background: var(--bg-surface-alt); border: 1px solid var(--border-main); border-radius: 12px;
  color: var(--text-main); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s;
}
.theme-toggle-v12:hover { border-color: var(--brand-primary); transform: translateY(-1px); background: var(--bg-surface); }

.active-workspace-card { 
  background: var(--bg-surface-alt); border: 1px solid var(--border-main); border-radius: 14px; padding: 14px; 
  display: flex; flex-direction: column; gap: 6px; 
}
.workspace-header { display: flex; align-items: center; gap: 8px; }
.pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
.workspace-header .label { font-size: 9px; font-weight: 800; color: var(--text-dim); letter-spacing: 0.05em; }
.workspace-name { font-size: 13px; font-weight: 700; color: var(--text-main); }

.logout-btn-v12 { 
  display: flex; align-items: center; justify-content: center; gap: 10px; background: transparent; 
  border: 1px solid transparent; color: var(--text-dim); padding: 10px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; 
}
.logout-btn-v12:hover { color: #ef4444; background: #fef2f2; }

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; background: var(--bg-main); overflow: hidden; }
.content-header { padding: 40px 48px; display: flex; justify-content: space-between; align-items: flex-end; }
.breadcrumb-nav-v12 { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 13px; font-weight: 500; margin-bottom: 8px; }
.crumb-link { cursor: pointer; transition: color 0.2s; }
.crumb-link:hover { color: var(--brand-primary); }
.crumb-current { color: var(--text-dim); }
.view-title { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }

.header-actions { display: flex; align-items: center; gap: 16px; }
.search-box { background: var(--bg-surface-alt); border: none; border-radius: 12px; padding: 0 14px; display: flex; align-items: center; gap: 10px; height: 40px; width: 280px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
.search-icon { color: var(--text-dim); }
.search-box input { background: transparent; border: none; color: var(--text-main); font-size: 14px; outline: none; flex: 1; }

.btn-create { background: var(--brand-primary); color: #fff; border: none; border-radius: 10px; height: 40px; padding: 0 20px; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
.btn-create:hover { background: var(--brand-primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }

.scroll-area { flex: 1; padding: 0 48px 48px; overflow-y: auto; }

/* GRIDS */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px; }
.project-card { background: var(--bg-surface); border: 1px solid var(--border-main); border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.project-card:hover { border-color: var(--brand-primary); transform: translateY(-6px); box-shadow: var(--shadow-lg); }
.project-card.active { border-color: var(--brand-primary); background: var(--bg-surface-alt); }

.card-preview { height: 160px; background: var(--bg-surface-alt); position: relative; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: var(--text-dim); overflow: hidden; }
.pattern-bg { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(var(--text-main) 1px, transparent 1px); background-size: 20px 20px; }
.preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; backdrop-filter: blur(2px); }
.project-card:hover .preview-overlay { opacity: 1; }
.btn-open { background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; transform: translateY(10px); transition: all 0.3s; }
.project-card:hover .btn-open { transform: translateY(0); }

.card-body { padding: 20px; }
.card-title { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
.card-url { font-size: 12px; color: var(--text-muted); }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); }
.tag { font-size: 10px; font-weight: 800; background: var(--bg-main); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-main); }
.timestamp { font-size: 11px; color: var(--text-dim); }

/* PAGES LIST */
.pages-grid { display: flex; flex-direction: column; gap: 12px; }
.page-row { background: var(--bg-surface); border: 1px solid var(--border-main); border-radius: 14px; padding: 16px 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.2s; }
.page-row:hover { border-color: var(--brand-primary); transform: translateX(4px); box-shadow: var(--shadow-sm); }
.page-icon-box { width: 40px; height: 40px; background: var(--bg-surface-alt); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--brand-primary); }
.page-details { flex: 1; display: flex; flex-direction: column; }
.page-name { font-weight: 700; font-size: 15px; color: var(--text-main); }
.page-path { font-size: 13px; color: var(--text-muted); }
.page-status { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.dot-badge { width: 8px; height: 8px; border-radius: 50%; }
.dot-badge.published { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.dot-badge.draft { background: #6b7280; }

/* MODALS */
.premium-card { background: var(--bg-surface); border: 1px solid var(--border-main); box-shadow: 0 20px 50px rgba(0,0,0,0.2); border-radius: 24px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { width: 100%; max-width: 460px; overflow: hidden; }
.modal-wide { max-width: 800px; }
.modal-header { padding: 32px 32px 16px; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.btn-close { background: var(--bg-surface-alt); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--text-dim); cursor: pointer; transition: all 0.2s; }
.btn-close:hover { background: #ef4444; color: #fff; }

.modal-body { padding: 0 32px 32px; display: flex; flex-direction: column; gap: 20px; }
.input-group label { display: block; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
.input-group input { width: 100%; height: 48px; background: var(--bg-main); border: 1px solid var(--border-main); border-radius: 12px; padding: 0 16px; color: var(--text-main); font-size: 15px; outline: none; transition: all 0.2s; }
.input-group input:focus { border-color: var(--brand-primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

.modal-footer { padding: 24px 32px; background: var(--bg-surface-alt); border-top: 1px solid var(--border-main); display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel { background: var(--bg-surface-alt); border: none; color: var(--text-muted); padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-cancel:hover { background: var(--bg-main); color: var(--text-main); }
.btn-submit { background: var(--brand-primary); color: #fff; border: none; padding: 10px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
.btn-submit:hover { background: var(--brand-primary-hover); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

/* STACK SELECTION */
.stack-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.stack-item { 
  padding: 14px 16px; background: var(--bg-main); border: 2px solid transparent; border-radius: 14px; 
  cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 600; color: var(--text-muted);
  display: flex; align-items: center; justify-content: space-between;
}
.stack-item::after { content: ''; width: 18px; height: 18px; border: 2px solid var(--border-main); border-radius: 50%; transition: all 0.2s; }
.stack-item:hover { background: var(--bg-surface-alt); color: var(--text-main); }
.stack-item.selected { border-color: var(--brand-primary); background: var(--bg-surface-alt); color: var(--text-main); }
.stack-item.selected::after { background: var(--brand-primary); border-color: var(--brand-primary); box-shadow: inset 0 0 0 3px var(--bg-surface-alt); }

/* AI MODES */
.mode-grid-horizontal { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.mode-card-v2 { border: 1px solid var(--border-main); border-radius: 20px; padding: 20px 12px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; align-items: center; gap: 12px; position: relative; }
.mode-card-v2.active { border-color: var(--brand-primary); background: var(--bg-surface-alt); transform: scale(1.02); box-shadow: 0 10px 30px rgba(79, 70, 229, 0.15); }
.mode-viz { width: 64px; height: 64px; border-radius: 16px; background: var(--bg-main); display: flex; align-items: center; justify-content: center; color: var(--brand-primary); }
.mode-card-v2.active .mode-viz { background: var(--brand-primary); color: #fff; }
.mode-card-v2 h3 { font-size: 14px; font-weight: 700; margin: 0; }
.mode-card-v2 p { font-size: 11px; color: var(--text-muted); line-height: 1.4; margin: 0; }

/* ANIMATIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.bounce-in { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
@keyframes bounceIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
/* AI ARCHITECT MODAL ADJUSTMENT */
.modal-ai-architect { background: transparent !important; border: none !important; box-shadow: none !important; max-width: 640px !important; }
.modal-ai-architect .modal-header, .modal-ai-architect .modal-footer { display: none; }
.modal-ai-architect .modal-body { padding: 0; }
</style>
