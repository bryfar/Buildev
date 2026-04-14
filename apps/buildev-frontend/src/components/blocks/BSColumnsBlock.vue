<template>
  <div 
    class="bs-columns" 
    :style="columnsStyle"
  >
    <div 
      v-for="i in Number(block.props.columns || 2)" 
      :key="i"
      class="bs-column"
    >
      <!-- Each column is essentially a mini container -->
      <div v-if="!getColumnChildren(i-1).length" class="empty-col">
        Col {{ i }}
      </div>
      <slot :column="i-1"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";

const props = defineProps<{ block: BSBlock }>();

function gapCss(g: unknown): string {
  if (g === undefined || g === null) return "20px";
  if (typeof g === "number") return `${g}px`;
  const s = String(g);
  if (s.endsWith("px") || s.endsWith("rem") || s.endsWith("%")) return s;
  if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
  return s || "20px";
}

const columnsStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(${props.block.props.columns || 2}, 1fr)`,
  gap: gapCss(props.block.props.gap),
  padding: props.block.props.padding || "0",
}));

function getColumnChildren(index: number) {
  return props.block.children?.filter((c) => (c.props as { column?: number }).column === index) || [];
}
</script>

<style scoped>
.bs-columns {
  width: 100%;
}
.bs-column {
  min-height: 50px;
  border: 1px dashed rgba(99, 102, 241, 0.1);
  border-radius: 4px;
}
.empty-col {
  padding: 10px;
  text-align: center;
  color: #94a3b8;
  font-size: 11px;
}
</style>
