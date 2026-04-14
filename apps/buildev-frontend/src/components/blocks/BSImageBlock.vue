<template>
  <img
    :src="String(block.props.src ?? '')"
    :alt="String(block.props.alt ?? '')"
    :style="imgStyle"
  />
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ block: BSBlock }>();
const store = usePagesStore();

const imgStyle = computed(() => {
  const breakpoint = store.currentBreakpoint;
  const base = props.block.props as Record<string, unknown>;
  const responsive = (base.responsive as Record<string, Record<string, unknown>> | undefined)?.[breakpoint] ?? {};
  const m = { ...base, ...responsive };
  const s: Record<string, string> = {};
  if (m.width) s.width = String(m.width);
  if (m.height) s.height = String(m.height);
  if (m.maxWidth) s.maxWidth = String(m.maxWidth);
  if (m.borderRadius) s.borderRadius = String(m.borderRadius);
  if (m.opacity) s.opacity = String(m.opacity);
  if (m.objectFit) s.objectFit = String(m.objectFit);
  if (m.objectPosition) s.objectPosition = String(m.objectPosition);
  if (m.filter) s.filter = String(m.filter);
  if (m.boxShadow) s.boxShadow = String(m.boxShadow);
  return s;
});
</script>
<style scoped>
img {
  display: block;
  max-width: 100%;
}
</style>
