<template>
  <section 
    :class="block.props.customClasses as string"
    :style="computedStyle"
  >
    <slot />
  </section>
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
    padding: merged.padding || '40px 20px',
    backgroundColor: merged.backgroundColor || merged.background || 'transparent',
    color: merged.color || 'inherit',
    textAlign: merged.textAlign || 'left',
    display: merged.display || 'block',
    flexDirection: merged.flexDirection || 'row',
    justifyContent: merged.justifyContent || 'flex-start',
    alignItems: merged.alignItems || 'stretch',
    flexWrap: merged.flexWrap || 'nowrap',
    gap: merged.gap ? (merged.gap.toString().includes('px') || merged.gap.toString().includes('rem') ? merged.gap : `${merged.gap}px`) : undefined,
    width: merged.width || '100%',
    margin: merged.margin || '0',
    borderRadius: merged.borderRadius || '0',
    border: merged.border || 'none'
  };
});
</script>
