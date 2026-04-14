<template>
  <component 
    :is="`h${block.props.level || 2}`" 
    ref="el"
    :contenteditable="isEditing"
    @dblclick.stop="startEdit"
    @blur="finishEdit"
    @keydown.enter.prevent="finishEdit"
    class="editable-heading"
    data-text-editor="true"
    :class="{ editing: isEditing }"
    :style="computedStyle"
    v-html="block.props.content"
  >
  </component>
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
  const base = props.block.props as Record<string, unknown>;
  const responsive = (base.responsive as Record<string, Record<string, unknown>> | undefined)?.[breakpoint] ?? {};
  const merged = { ...base, ...responsive };
  const fs = merged.fontSize;
  const fontSize =
    fs === undefined || fs === ""
      ? undefined
      : typeof fs === "number"
        ? `${fs}px`
        : String(fs).match(/px|rem|em|%$/)
          ? String(fs)
          : `${fs}px`;
  const out: Record<string, string> = {
    color: merged.color ? String(merged.color) : "inherit",
    fontWeight: merged.fontWeight ? String(merged.fontWeight) : "700",
    textAlign: merged.textAlign ? String(merged.textAlign) : "left",
  };
  if (fontSize) out.fontSize = fontSize;
  if (merged.fontFamily) out.fontFamily = String(merged.fontFamily);
  if (merged.lineHeight !== undefined && merged.lineHeight !== "") out.lineHeight = String(merged.lineHeight);
  if (merged.letterSpacing) out.letterSpacing = String(merged.letterSpacing);
  if (merged.textDecoration) out.textDecoration = String(merged.textDecoration);
  if (merged.textTransform) out.textTransform = String(merged.textTransform);
  if (merged.whiteSpace) out.whiteSpace = String(merged.whiteSpace);
  if (merged.fontStyle) out.fontStyle = String(merged.fontStyle);
  if (merged.textShadow) out.textShadow = String(merged.textShadow);
  return out;
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
.editable-heading {
  outline: none;
  border-radius: 4px;
  transition: box-shadow 0.2s;
  margin: 0 0 8px;
  line-height: 1.2;
}
.editable-heading:hover {
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
}
.editable-heading.editing {
  box-shadow: 0 0 0 2px #6366f1;
  background: rgba(99, 102, 241, 0.05);
  cursor: text;
}
</style>
