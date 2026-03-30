<template>
  <div
    class="layer-item"
    :class="{ selected: store.selectedBlockId === block.id }"
    @click.stop="store.selectBlock(block.id)"
  >
    <div class="item-content" :style="{ paddingLeft: depth * 16 + 'px' }">
      <span v-if="block.children?.length" class="expander" @click.stop="expanded = !expanded">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span v-else class="expander-spacer"></span>
      <span class="type-icon">{{ iconFor(block?.type) }}</span>
      <span class="name">{{ block?.name || block?.type || 'Unknown' }}</span>
      <div class="actions">
        <button class="action-btn" @click.stop="store.removeBlock(block.id)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>

    <!-- Nested Children -->
    <div v-if="expanded && block.children?.length" class="children">
      <BSLayerItem
        v-for="child in block.children"
        :key="child.id"
        :block="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePagesStore } from "../store/pages";
import { blockTypes } from "../data/blocks";

const props = defineProps<{
  block: any;
  depth: number;
}>();

const store = usePagesStore();
const expanded = ref(true);

function iconFor(type: string) {
  if (!type) return '□';
  return blockTypes.find(b => b.type === type)?.icon ?? '□';
}
</script>

<style scoped>
.layer-item { user-select: none; }
.item-content {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
  cursor: pointer; position: relative; transition: all 0.2s;
  color: var(--text-muted);
}
.layer-item:hover .item-content { background: var(--bg-surface-alt); color: var(--text-main); }
.layer-item.selected .item-content { background: var(--brand-primary); color: #fff; }

.expander { width: 12px; height: 12px; display: flex; align-items: center; justify-content: center; font-size: 8px; transition: transform 0.2s; color: var(--text-dim); }
.layer-item.selected .expander { color: #fff; }
.expander-spacer { width: 12px; }

.type-icon { font-size: 14px; opacity: 0.7; }
.name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }

.actions { display: none; margin-left: auto; }
.item-content:hover .actions { display: flex; }
.action-btn { background: none; border: none; color: inherit; cursor: pointer; padding: 2px; border-radius: 4px; display: flex; align-items: center; }
.action-btn:hover { background: rgba(0,0,0,0.1); }

.children { border-left: 1px solid var(--border-subtle); margin-left: 18px; }
</style>
