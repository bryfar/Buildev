<template>
  <a :href="block.props.href as string" class="bs-btn" :class="[`bs-btn--${block.props.variant}`]">
    {{ block.props.label }}
  </a>
</template>
<script setup lang="ts">
import type { BSBlock } from "@buildersite/sdk";
defineProps<{ block: BSBlock }>();
</script>
<style scoped>
.bs-btn { display: inline-block; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; }
.bs-btn--primary { background: #6366f1; color: #fff; }
.bs-btn--secondary { background: transparent; border: 2px solid #6366f1; color: #6366f1; }
</style>
