<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content github-workflow shadow-glow" :class="step">
      
      <!-- STEP 1: SETUP (IMAGE 3) -->
      <div v-if="step === 'setup'" class="workflow-step">
        <div class="modal-header-v2">
          <h3>Sync to GitHub</h3>
          <button class="btn-close-v3" @click="$emit('close')">×</button>
        </div>
        
        <div class="modal-body-v2">
          <div class="form-group-v2">
            <label>New repository name</label>
            <input type="text" v-model="repoName" class="bs-input-v2" placeholder="Enter repo name" />
          </div>
          
          <div class="form-group-v2">
            <label>New repository description</label>
            <input type="text" v-model="description" class="bs-input-v2" placeholder="Optional description" />
          </div>

          <div class="visibility-section">
            <label class="section-label">Visibility</label>
            <div class="radio-group">
              <label class="radio-item" :class="{ active: isPrivate }">
                <input type="radio" :value="true" v-model="isPrivate" />
                <div class="radio-custom"></div>
                <div class="radio-text">
                  <div class="radio-title">Private</div>
                  <div class="radio-desc">Only you can access this repo on GitHub.com</div>
                </div>
              </label>
              <label class="radio-item" :class="{ active: !isPrivate }">
                <input type="radio" :value="false" v-model="isPrivate" />
                <div class="radio-custom"></div>
                <div class="radio-text">
                  <div class="radio-title">Public</div>
                  <div class="radio-desc">This repo will be discoverable by everyone on GitHub.com</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer-v2">
          <button class="btn-primary-v3 w-full" @click="proceedToSync" :disabled="!repoName">
            Create GitHub repository
          </button>
        </div>
      </div>

      <!-- STEP 2: SYNCING (IMAGE 4) -->
      <div v-if="step === 'syncing'" class="workflow-step syncing-view">
        <div class="github-logo-large">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </div>
        <h2 class="syncing-title">Syncing your changes</h2>
        <p class="syncing-subtitle">We're creating your repository</p>
        <div class="large-spinner"></div>
      </div>

      <!-- STEP 3: COMMIT (IMAGE 5) -->
      <div v-if="step === 'commit'" class="workflow-step commit-view">
        <div class="modal-header-v2">
          <h3>Sync to GitHub</h3>
          <button class="btn-close-v3" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body-v2 no-padding">
          <div class="repo-info-banner">
             <span class="repo-path">bryfar/{{ repoName }}</span>
             <span class="branch-tag">on main</span>
          </div>

          <div class="commit-section">
            <label>What changes did you make?</label>
            <textarea v-model="commitMessage" class="commit-input-v2" placeholder="feat: Initial project setup"></textarea>
          </div>

          <div class="files-changed-header">
            <span>{{ changedFiles.length }} changed files</span>
          </div>

          <div class="files-list-v2">
            <div v-for="file in changedFiles" :key="file.name" class="file-item-v2">
              <div class="file-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="file-icon"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <span class="file-name">{{ file.name }}</span>
              </div>
              <span class="file-status" :class="file.status">{{ file.status }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer-v2">
          <button class="btn-primary-v3 w-full" @click="handleFinalCommit" :disabled="isPushing">
             <span v-if="!isPushing">Stage and commit all changes</span>
             <span v-else>Syncing...</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { githubService } from '../../services/githubService';

const props = defineProps<{
  projectName: string;
}>();

const emit = defineEmits(['close', 'success']);

const step = ref<'setup' | 'syncing' | 'commit'>('setup');
const repoName = ref(props.projectName.toLowerCase().replace(/\s+/g, '-'));
const description = ref('');
const isPrivate = ref(true);
const commitMessage = ref('feat: Setup project for AI Studio app integration');
const isPushing = ref(false);

const changedFiles = ref([
  { name: 'README.md', status: 'Modified' },
  { name: '.env.example', status: 'Added' },
  { name: '.gitignore', status: 'Added' },
  { name: 'index.html', status: 'Added' },
  { name: 'metadata.json', status: 'Added' },
  { name: 'package-lock.json', status: 'Added' },
  { name: 'package.json', status: 'Added' },
  { name: 'references/skills-rules.md', status: 'Added' },
  { name: 'references/tokens.md', status: 'Added' }
]);

async function proceedToSync() {
  step.value = 'syncing';
  try {
    // Artificial delay to show the nice syncing UI from the image
    await new Promise(r => setTimeout(r, 2000));
    
    // Actually create the repo
    await githubService.createRepository({
      name: repoName.value,
      description: description.value,
      private: isPrivate.value
    });
    
    step.value = 'commit';
  } catch (err: any) {
    alert("GitHub Error: " + err.message);
    step.value = 'setup';
  }
}

async function handleFinalCommit() {
  isPushing.value = true;
  try {
    await githubService.pushToBranch(repoName.value, 'main', commitMessage.value);
    await new Promise(r => setTimeout(r, 1000));
    emit('success');
    emit('close');
  } catch (err: any) {
    alert("Sync Error: " + err.message);
  } finally {
    isPushing.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}

.github-workflow {
  width: 480px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-dark .github-workflow { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.05); }

/* SYNCING VIEW (IMAGE 4) */
.syncing-view {
  padding: 80px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.github-logo-large { color: #000; margin-bottom: 32px; animation: bounce 2s infinite ease-in-out; }
.theme-dark .github-logo-large { color: #fff; }
.syncing-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
.syncing-subtitle { font-size: 16px; color: #666; margin-bottom: 40px; }
.large-spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: #000; border-radius: 50%; animation: spin 1s linear infinite; }
.theme-dark .large-spinner { border-color: #333; border-top-color: #fff; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* SETUP & COMMIT SHARED STYLES */
.modal-header-v2 { padding: 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; }
.theme-dark .modal-header-v2 { border-color: #222; }
.modal-header-v2 h3 { font-size: 18px; font-weight: 700; margin: 0; }
.btn-close-v3 { background: none; border: none; font-size: 24px; color: #999; cursor: pointer; }

.modal-body-v2 { padding: 24px; }
.modal-body-v2.no-padding { padding: 0; }

.form-group-v2 { margin-bottom: 24px; }
.form-group-v2 label { display: block; font-size: 14px; color: #555; margin-bottom: 8px; font-weight: 500; }
.theme-dark .form-group-v2 label { color: #aaa; }

.bs-input-v2 {
  width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 10px;
  font-size: 14px; outline: none; transition: all 0.2s;
}
.theme-dark .bs-input-v2 { background: #222; border-color: #333; color: #fff; }
.bs-input-v2:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }

/* VISIBILITY RADIO BUTTONS (IMAGE 3) */
.section-label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.radio-group { display: flex; flex-direction: column; gap: 12px; }
.radio-item {
  display: flex; gap: 16px; padding: 16px; border-radius: 12px; border: 1px solid #eee;
  cursor: pointer; transition: all 0.2s; position: relative;
}
.theme-dark .radio-item { border-color: #222; }
.radio-item:hover { background: #f9f9f9; }
.theme-dark .radio-item:hover { background: #222; }
.radio-item.active { border-color: #000; background: #fcfcfc; }
.theme-dark .radio-item.active { border-color: #fff; background: #222; }

.radio-item input { position: absolute; opacity: 0; }
.radio-custom {
  width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-top: 2px;
}
.radio-item.active .radio-custom { border-color: #000; }
.theme-dark .radio-item.active .radio-custom { border-color: #fff; }
.radio-item.active .radio-custom::after { content: ''; width: 10px; height: 10px; background: #000; border-radius: 50%; }
.theme-dark .radio-item.active .radio-custom::after { background: #fff; }

.radio-title { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
.radio-desc { font-size: 13px; color: #666; }

/* COMMIT VIEW (IMAGE 5) */
.repo-info-banner { padding: 12px 24px; background: #f8f8fb; display: flex; gap: 8px; font-size: 14px; }
.theme-dark .repo-info-banner { background: #222; }
.repo-path { color: #1a73e8; font-weight: 700; }
.branch-tag { color: #666; }

.commit-section { padding: 24px; border-bottom: 1px solid #eee; }
.theme-dark .commit-section { border-color: #222; }
.commit-section label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.commit-input-v2 {
  width: 100%; height: 100px; padding: 12px; border: 1px solid #ddd; border-radius: 8px;
  resize: none; font-size: 14px; font-family: inherit;
}
.theme-dark .commit-input-v2 { background: #111; border-color: #333; color: #fff; }

.files-changed-header { padding: 12px 24px; background: #fcfcfc; border-bottom: 1px solid #eee; font-size: 13px; font-weight: 600; color: #666; }
.theme-dark .files-changed-header { background: #1a1a1e; border-color: #222; }

.files-list-v2 { max-height: 200px; overflow-y: auto; }
.file-item-v2 { padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f9f9f9; }
.theme-dark .file-item-v2 { border-color: #222; }
.file-left { display: flex; align-items: center; gap: 10px; }
.file-icon { color: #999; }
.file-name { font-size: 13px; font-weight: 500; }
.file-status { font-size: 11px; font-weight: 700; color: #666; }
.file-status.Modified { color: #e67e22; }
.file-status.Added { color: #27ae60; }

.modal-footer-v2 { padding: 24px; }
.btn-primary-v3 {
  background: #000; color: #fff; border: none; padding: 14px; border-radius: 12px;
  font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.theme-dark .btn-primary-v3 { background: #fff; color: #000; }
.btn-primary-v3:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary-v3:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
