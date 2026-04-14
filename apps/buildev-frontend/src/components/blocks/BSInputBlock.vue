<template>
  <div class="bs-input-group">
    <label v-if="block.props.label" class="bs-label">{{ block.props.label }}</label>
    <input
      v-if="block.props.type !== 'textarea'"
      :type="inputType"
      :placeholder="placeholderText"
      class="bs-input"
    />
    <textarea v-else :placeholder="placeholderText" class="bs-input bs-textarea"></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";

const props = defineProps<{ block: BSBlock }>();

const inputType = computed((): string => {
  const t = props.block.props.type;
  if (t === "textarea") return "text";
  if (typeof t === "string" && t.length > 0) return t;
  return "text";
});

const placeholderText = computed((): string | undefined => {
  const p = props.block.props.placeholder;
  return typeof p === "string" ? p : undefined;
});
</script>

<style scoped>
.bs-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.bs-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}
.bs-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.bs-textarea {
  min-height: 80px;
  resize: vertical;
}
</style>
