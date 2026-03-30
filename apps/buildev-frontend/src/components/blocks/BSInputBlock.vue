<template>
  <div class="bs-input-group">
    <label v-if="block.props.label" class="bs-label">{{ block.props.label }}</label>
    <input 
      v-if="block.props.type !== 'textarea'"
      :type="block.props.type || 'text'" 
      :placeholder="block.props.placeholder"
      class="bs-input"
    />
    <textarea 
      v-else 
      :placeholder="block.props.placeholder"
      class="bs-input bs-textarea"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import type { BSBlock } from "@buildersite/sdk";
defineProps<{ block: BSBlock }>();
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
  transition: border-color 0.2s;
}
.bs-input:focus {
  border-color: #6366f1;
}
.bs-textarea {
  min-height: 100px;
  resize: vertical;
}
</style>
