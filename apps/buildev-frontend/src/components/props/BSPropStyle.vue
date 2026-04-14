<template>
  <section class="prop-section">
    <p class="section-title">Content</p>
    <div class="prop-list">
      <div v-if="val('content') !== undefined" class="prop-item">
        <label>Text / HTML</label>
        <textarea :value="String(val('content') ?? '')" @input="update('content', $event)"></textarea>
      </div>

      <div v-if="block.type === 'heading'" class="prop-item">
        <label>Heading level</label>
        <select :value="String(val('level') ?? '2')" @change="update('level', $event)">
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
        </select>
      </div>

      <div v-if="block.type === 'button'" class="prop-item">
        <label>Label</label>
        <input type="text" :value="String(val('label') ?? '')" @input="update('label', $event)" />
      </div>
      <div v-if="block.type === 'button'" class="prop-item">
        <label>Link (href)</label>
        <input type="text" :value="String(val('href') ?? '')" @input="update('href', $event)" placeholder="#" />
      </div>

      <div v-if="block.type === 'image'" class="prop-item">
        <label>Source URL</label>
        <div class="input-with-button">
          <input type="text" :value="String(val('src') ?? '')" @input="update('src', $event)" />
          <button type="button" class="btn-icon" @click="emit('openGallery')">🖼</button>
        </div>
      </div>

      <div v-if="block.type === 'image'" class="prop-item">
        <label>Alt text</label>
        <input type="text" :value="String(val('alt') ?? '')" @input="update('alt', $event)" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePagesStore } from "../../store/pages";
import type { BSBlock } from "@buildersite/sdk";

const props = defineProps<{ block: BSBlock }>();
const emit = defineEmits<{ (e: "openGallery"): void }>();
const store = usePagesStore();

function val(prop: string) {
  const breakpoint = store.currentBreakpoint;
  const base = props.block.props;
  return (base.responsive as Record<string, Record<string, unknown>> | undefined)?.[breakpoint]?.[prop] ?? base[prop];
}

function update(prop: string, e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  const value = target.value;
  const breakpoint = store.currentBreakpoint;
  if (breakpoint === "desktop") {
    store.updateBlock(props.block.id, { [prop]: value });
  } else {
    const responsive = { ...(props.block.props.responsive as Record<string, Record<string, unknown>>) || {} };
    responsive[breakpoint] = { ...(responsive[breakpoint] || {}), [prop]: value };
    store.updateBlock(props.block.id, { responsive });
  }
}
</script>

<style scoped>
.prop-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.section-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 12px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}
.prop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.prop-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.prop-item label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
}
.prop-item input,
.prop-item textarea {
  background: var(--bg-input);
  border: 1px solid var(--border-main);
  border-radius: 6px;
  padding: 8px;
  color: var(--text-main);
  font-size: 12px;
  outline: none;
}
.prop-item textarea {
  height: 80px;
  resize: vertical;
}
.input-with-button {
  display: flex;
  gap: 4px;
}
.input-with-button input {
  flex: 1;
}
.btn-icon {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-main);
  color: var(--text-main);
  border-radius: 6px;
  padding: 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background: var(--border-subtle);
}
</style>
