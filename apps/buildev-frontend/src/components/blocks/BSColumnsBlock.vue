<template>
  <div 
    class="bs-columns" 
    :style="{ 
      display: 'grid',
      gridTemplateColumns: `repeat(${block.props.columns || 2}, 1fr)`,
      gap: (block.props.gap as any) + 'px' || '20px',
      padding: block.props.padding || '0'
    }"
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
import type { BSBlock } from "@buildersite/sdk";
const props = defineProps<{ block: BSBlock }>();

function getColumnChildren(index: number) {
  return props.block.children?.filter(c => c.props.column === index) || [];
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
