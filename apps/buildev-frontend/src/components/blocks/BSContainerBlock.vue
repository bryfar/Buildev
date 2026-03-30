<template>
  <div 
    class="bs-container" 
    :class="block.props.customClasses as string"
    :style="computedStyle"
  >
    <div v-if="!block.children?.length" class="empty-placeholder">
      Container: Drop blocks here
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ block: BSBlock }>();
const store = usePagesStore();

const computedStyle = computed(() => {
  const breakpoint = store.currentBreakpoint;
  const base = props.block.props as any;
  const responsive = base.responsive?.[breakpoint] ?? {};
  const merged = { ...base, ...responsive };
  
  return {
    padding: merged.padding || '20px',
    backgroundColor: merged.backgroundColor || merged.background || 'transparent',
    display: merged.display || 'flex',
    flexDirection: merged.flexDirection || 'column',
    justifyContent: merged.justifyContent || 'flex-start',
    alignItems: merged.alignItems || 'stretch',
    flexWrap: merged.flexWrap || 'nowrap',
    gap: merged.gap ? (merged.gap.toString().includes('px') || merged.gap.toString().includes('rem') ? merged.gap : `${merged.gap}px`) : '16px',
    width: merged.width || '100%',
    margin: merged.margin || '0 auto',
    minHeight: '50px',
    borderRadius: merged.borderRadius || '0',
    border: merged.border || 'none'
  };
});
</script>

<style scoped>
.bs-container {
  width: 100%;
  border: 1px dashed rgba(99, 102, 241, 0.2);
  border-radius: 4px;
  transition: border-color 0.2s;
}
.bs-container:hover {
  border-color: rgba(99, 102, 241, 0.5);
}
.empty-placeholder {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 12px;
  background: rgba(15, 17, 23, 0.05);
  border-radius: 4px;
}
</style>
