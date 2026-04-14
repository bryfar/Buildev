<template>
  <a
    :href="hrefAttr"
    class="bs-btn"
    :class="[`bs-btn--${block.props.variant}`]"
    @click="onAnchorClick"
  >
    {{ block.props.label }}
  </a>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";

const props = defineProps<{ block: BSBlock }>();

const hrefAttr = computed(() => {
  const h = props.block.props.href;
  return typeof h === "string" && h.length > 0 ? h : "#";
});

function onAnchorClick(e: MouseEvent) {
  const h = props.block.props.href;
  if (typeof h !== "string" || h.length === 0 || h === "#") {
    e.preventDefault();
  }
}
</script>
<style scoped>
.bs-btn { display: inline-block; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; }
.bs-btn--primary { background: #6366f1; color: #fff; }
.bs-btn--secondary { background: transparent; border: 2px solid #6366f1; color: #6366f1; }
</style>
