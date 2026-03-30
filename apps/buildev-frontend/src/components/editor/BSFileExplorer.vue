<template>
  <div class="file-explorer">
    <div class="explorer-header">
      <span class="explorer-title">EXPLORER: {{ currentSite?.name?.toUpperCase() }}</span>
    </div>
    <div class="explorer-content">
      <div v-for="node in explorerNodes" :key="node.path" class="file-node" :class="{ 'is-dir': node.type === 'dir' }">
        <div class="node-row" :style="{ paddingLeft: (node.depth * 16 + 12) + 'px' }" @click="toggleNode(node)">
          <svg v-if="node.type === 'dir'" class="node-icon" :class="{ open: node.open }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <svg v-else class="node-icon file" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
          <span class="node-name">{{ node.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { usePagesStore } from '../../store/pages';
import { exportService, type ProjectFile } from '../../services/exportService';

const store = usePagesStore();
const currentSite = computed(() => store.sites.find(s => s.id === store.currentSiteId));

interface FileExpandedNode {
  name: string;
  type: 'file' | 'dir';
  path: string;
  depth: number;
  open: boolean;
}

const explorerNodes = ref<FileExpandedNode[]>([]);

const flatNodes: FileExpandedNode[] = [];

function flattenStructure(files: ProjectFile[], depth = 0, parentPath = '') {
  files.forEach(f => {
    const path = parentPath ? `${parentPath}/${f.name}` : f.name;
    flatNodes.push({
      name: f.name,
      type: f.type === 'directory' ? 'dir' : 'file',
      path: path,
      depth: depth,
      open: depth < 1 // Default open first level
    });
    if (f.children) {
      flattenStructure(f.children, depth + 1, path);
    }
  });
}

watchEffect(() => {
  if (store.currentPage) {
    flatNodes.length = 0;
    const struct = exportService.generateProjectExplorer(store.currentPage);
    flattenStructure(struct);
    explorerNodes.value = [...flatNodes];
  }
});

function toggleNode(node: FileExpandedNode) {
  if (node.type === 'dir') {
    node.open = !node.open;
  }
}
</script>

<style scoped>
.file-explorer { height: 100%; width: 100%; background: var(--bg-sidebar); display: flex; flex-direction: column; user-select: none; }
.explorer-header { padding: 10px 16px; border-bottom: 1px solid var(--border-subtle); }
.explorer-title { font-size: 11px; font-weight: 700; color: var(--text-dim); }

.explorer-content { flex: 1; padding: 8px 0; overflow-y: auto; }
.node-row { display: flex; align-items: center; gap: 6px; padding: 4px 12px; cursor: pointer; transition: background 0.1s; border-left: 2px solid transparent; }
.node-row:hover { background: var(--bg-main); }
.node-icon { width: 14px; height: 14px; color: var(--text-dim); transition: transform 0.2s; }
.node-icon.open { transform: rotate(90deg); }
.node-icon.file { color: var(--brand-primary); }
.node-name { font-size: 13px; color: var(--text-muted); }

/* VS Code Specific Colors */
.is-dir .node-name { font-weight: 600; color: var(--text-main); }
</style>
