<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content github-modal shadow-glow">
      <div class="modal-header">
        <div class="header-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          <h3>GitHub Repository</h3>
        </div>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Repository Name</label>
          <input type="text" v-model="repoName" placeholder="my-awesome-site" class="bs-input" />
        </div>
        <div class="form-group">
          <label>Description (Optional)</label>
          <textarea v-model="description" placeholder="A website built with Buildev" class="bs-input"></textarea>
        </div>
        
        <div class="repo-options">
          <div class="option-item">
            <input type="checkbox" id="isPrivate" v-model="isPrivate" />
            <label for="isPrivate">Private Repository</label>
          </div>
          <div class="option-item">
            <input type="checkbox" id="genReadme" v-model="genReadme" />
            <label for="genReadme">Generate AI README.md</label>
          </div>
        </div>

        <div class="github-actions">
           <button class="btn-primary w-full" @click="handleCreateRepo" :disabled="isCreating || !repoName">
             <span v-if="!isCreating">Create Repository</span>
             <span v-else class="loading-spinner">Creating...</span>
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

const repoName = ref(props.projectName.toLowerCase().replace(/\s+/g, '-'));
const description = ref('');
const isPrivate = ref(true);
const genReadme = ref(true);
const isCreating = ref(false);

const handleCreateRepo = async () => {
  isCreating.value = true;
  try {
    const repo = await githubService.createRepository({
      name: repoName.value,
      description: description.value,
      private: isPrivate.value
    });
    emit('success', repo);
    emit('close');
  } catch (err: any) {
    alert("GitHub Error: " + err.message);
  } finally {
    isCreating.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.github-modal {
  width: 440px;
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: space-between;
}

.header-title { display: flex; align-items: center; gap: 12px; color: #fff; }
.header-title h3 { margin: 0; font-size: 18px; font-weight: 700; }

.btn-close { background: none; border: none; font-size: 24px; color: rgba(255,255,255,0.4); cursor: pointer; }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.form-group label { display: block; font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }

.bs-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
}
.bs-input:focus { border-color: var(--brand-primary); }

.repo-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.option-item { display: flex; align-items: center; gap: 10px; }
.option-item label { font-size: 13px; color: rgba(255,255,255,0.8); }

.btn-primary {
  background: var(--brand-primary);
  color: #fff;
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(138, 77, 245, 0.3);
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(138, 77, 245, 0.4); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.loading-spinner { opacity: 0.8; }
</style>
