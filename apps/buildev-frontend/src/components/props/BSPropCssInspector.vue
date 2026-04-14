<template>
  <div class="css-inspector">
    <p class="hint">
      Declarations are merged on top of Design. Use standard CSS syntax, one property per line or separated by
      semicolons.
    </p>
    <label class="lbl">Custom CSS</label>
    <textarea
      class="code"
      :value="cssText"
      spellcheck="false"
      placeholder="opacity: 0.95;&#10;transform: translateY(-2px);"
      @input="onCssInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ block: BSBlock }>();
const store = usePagesStore();

/** `customStyleCss` vive siempre en la raíz de props (no por breakpoint). */
const cssText = computed(() => String((props.block.props as Record<string, unknown>).customStyleCss ?? ""));

function onCssInput(e: Event) {
  const v = (e.target as HTMLTextAreaElement).value;
  store.updateBlock(props.block.id, { customStyleCss: v });
}
</script>

<style scoped>
.css-inspector {
  padding: 12px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hint {
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.45;
  margin: 0;
}
.lbl {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.code {
  min-height: 220px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  background: var(--bg-input);
  border: 1px solid var(--border-main);
  border-radius: 8px;
  padding: 10px;
  color: var(--text-main);
  resize: vertical;
  outline: none;
}
.code:focus {
  border-color: var(--brand-primary);
}
</style>
