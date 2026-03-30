<template>
  <p 
    ref="el"
    :contenteditable="isEditing"
    @dblclick.stop="startEdit"
    @blur="finishEdit"
    @keydown.enter.prevent="finishEdit"
    class="editable-text"
    data-text-editor="true"
    :class="{ editing: isEditing }"
    :style="computedStyle"
    v-html="block.props.content"
  >
  </p>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ block: BSBlock }>();
const store = usePagesStore();

const isEditing = ref(false);
const el = ref<HTMLElement | null>(null);

const computedStyle = computed(() => {
  const breakpoint = store.currentBreakpoint;
  const base = props.block.props as any;
  const responsive = base.responsive?.[breakpoint] ?? {};
  const merged = { ...base, ...responsive };
  
  return {
    fontSize: (merged.fontSize || 16) + 'px',
    color: merged.color || 'inherit',
    fontWeight: merged.fontWeight || 'normal',
    textAlign: merged.textAlign || 'left'
  };
});

function startEdit() {
  isEditing.value = true;
  nextTick(() => {
    if (el.value) {
      el.value.focus();
      const range = document.createRange();
      range.selectNodeContents(el.value);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  });
}

function finishEdit() {
  if (!isEditing.value) return;
  isEditing.value = false;
  if (el.value) {
    const newContent = el.value.innerHTML;
    if (newContent !== props.block.props.content) {
      store.updateBlock(props.block.id, { content: newContent });
    }
  }
}
</script>

<style scoped>
.editable-text {
  outline: none;
  border-radius: 4px;
  transition: box-shadow 0.2s;
}
.editable-text:hover {
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
}
.editable-text.editing {
  box-shadow: 0 0 0 2px #6366f1;
  background: rgba(99, 102, 241, 0.05);
  cursor: text;
}
</style>
