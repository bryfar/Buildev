<template>
  <form 
    class="bs-form" 
    @submit.prevent="handleSubmit"
    :style="formStyle"
  >
    <div v-if="!block.children?.length" class="empty-placeholder">
      Form: Drop input blocks here
    </div>
    <slot></slot>
    <button 
      type="submit" 
      v-if="block.props.showSubmit !== false" 
      :class="['submit-btn', block.props.submitVariant || 'primary']"
    >
      {{ block.props.submitLabel || 'Submit' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { BLOCK_PREVIEW_KEY } from "../../constants/injectionKeys";

const props = defineProps<{ block: BSBlock }>();

const inPreview = inject(BLOCK_PREVIEW_KEY, undefined);

const formStyle = computed(() => {
  const g = props.block.props.gap;
  const gapCss = typeof g === "number" ? `${g}px` : typeof g === "string" && g.endsWith("px") ? g : `${g ?? 16}px`;
  return {
    padding: props.block.props.padding || "20px",
    background: props.block.props.background || "transparent",
    gap: gapCss,
    display: "flex",
    flexDirection: "column",
  };
});

function handleSubmit() {
  if (inPreview?.value) return;
  alert("Form submitted! (Simulation)");
}
</script>

<style scoped>
.bs-form {
  width: 100%;
  border: 1px dashed rgba(99, 102, 241, 0.2);
  border-radius: 8px;
}
.empty-placeholder {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}
.submit-btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}
.submit-btn.primary {
  background: #6366f1;
  color: white;
}
.submit-btn.secondary {
  background: #e2e8f0;
  color: #1e293b;
}
</style>
