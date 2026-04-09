<template>
  <div class="file-explorer">
    <div class="explorer-header">
      <span class="explorer-title">Explorer</span>
      <span class="explorer-sub">{{ currentSite?.name ?? 'Workspace' }}</span>
    </div>
    <div class="explorer-content">
      <div
        v-for="node in visibleNodes"
        :key="node.path"
        class="file-node"
        :class="{ 'is-dir': node.type === 'dir', 'is-selected': node.path === selectedPath }"
      >
        <div
          class="node-row"
          :style="{ paddingLeft: (node.depth * 12 + 8) + 'px' }"
          @click="onRowClick(node)"
        >
          <svg
            v-if="node.type === 'dir'"
            class="node-icon chevron"
            :class="{ open: openDirPaths.includes(node.path) }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span v-else class="node-icon-spacer" />
          <svg
            v-if="node.type === 'dir'"
            class="node-icon folder"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <svg
            v-else
            class="node-icon file"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <span class="node-name">{{ node.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePagesStore } from '../../store/pages';
import { exportService, type ProjectFile } from '../../services/exportService';

defineProps<{
  selectedPath?: string | null;
}>();

const emit = defineEmits<{
  openFile: [{ path: string; name: string; language: string }];
}>();

const store = usePagesStore();
const currentSite = computed(() => store.sites.find(s => s.id === store.currentSiteId));

interface VisibleNode {
  name: string;
  type: 'file' | 'dir';
  path: string;
  depth: number;
}

/** Use array so Vue tracks expands/collapses (Set is awkward in reactive land). */
const openDirPaths = ref<string[]>([]);
const visibleNodes = ref<VisibleNode[]>([]);
const lastPageId = ref<string | null>(null);

function guessLanguage(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.vue')) return 'vue';
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.html')) return 'html';
  return 'plaintext';
}

function defaultOpenForStructure(files: ProjectFile[]): string[] {
  return files.filter(f => f.type === 'directory').map(f => f.name);
}

function isDirOpen(path: string): boolean {
  return openDirPaths.value.includes(path);
}

function walkVisible(
  files: ProjectFile[],
  depth: number,
  parentPath: string,
  parentOpen: boolean,
  acc: VisibleNode[]
) {
  if (!parentOpen) return;
  for (const f of files) {
    const path = parentPath ? `${parentPath}/${f.name}` : f.name;
    const isDir = f.type === 'directory';
    acc.push({ name: f.name, type: isDir ? 'dir' : 'file', path, depth });
    if (isDir && f.children?.length) {
      walkVisible(f.children, depth + 1, path, isDirOpen(path), acc);
    }
  }
}

function rebuildTree() {
  if (!store.currentPage) {
    visibleNodes.value = [];
    return;
  }
  const struct = exportService.generateProjectExplorer(store.currentPage);
  const acc: VisibleNode[] = [];
  walkVisible(struct, 0, '', true, acc);
  visibleNodes.value = acc;
}

watch(
  () => store.currentPage?.id,
  (id) => {
    if (!id) {
      visibleNodes.value = [];
      return;
    }
    if (lastPageId.value !== id) {
      lastPageId.value = id;
      if (store.currentPage) {
        const struct = exportService.generateProjectExplorer(store.currentPage);
        openDirPaths.value = defaultOpenForStructure(struct);
      }
    }
    rebuildTree();
  },
  { immediate: true }
);

watch(openDirPaths, () => rebuildTree(), { deep: true });

function onRowClick(node: VisibleNode) {
  if (node.type === 'dir') {
    const paths = [...openDirPaths.value];
    const i = paths.indexOf(node.path);
    if (i >= 0) paths.splice(i, 1);
    else paths.push(node.path);
    openDirPaths.value = paths;
    return;
  }
  emit('openFile', { path: node.path, name: node.name, language: guessLanguage(node.name) });
}
</script>

<style scoped>
.file-explorer {
  height: 100%;
  width: 100%;
  background: var(--bg-surface, #252526);
  display: flex;
  flex-direction: column;
  user-select: none;
}
.explorer-header {
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--border-subtle, #3c3c3c);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.explorer-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-main, #ccc);
  letter-spacing: 0.04em;
}
.explorer-sub {
  font-size: 10px;
  color: var(--text-dim, #888);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.explorer-content {
  flex: 1;
  padding: 4px 0;
  overflow-y: auto;
}
.node-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  cursor: pointer;
  transition: background 0.1s;
  border-left: 2px solid transparent;
}
.node-row:hover {
  background: var(--bg-main, #2a2d2e);
}
.file-node.is-selected .node-row {
  background: rgba(138, 77, 245, 0.15);
  border-left-color: var(--brand-primary, #8a4df5);
}
.node-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--text-dim, #858585);
}
.node-icon.chevron {
  margin-right: -2px;
  transition: transform 0.15s;
}
.node-icon.chevron.open {
  transform: rotate(90deg);
}
.node-icon.folder {
  color: #dcb67a;
}
.node-icon.file {
  color: var(--brand-primary, #8a4df5);
}
.node-icon-spacer {
  width: 14px;
  flex-shrink: 0;
}
.node-name {
  font-size: 13px;
  color: var(--text-muted, #c8c8c8);
}
.is-dir .node-name {
  font-weight: 600;
  color: var(--text-main, #e0e0e0);
}
</style>
