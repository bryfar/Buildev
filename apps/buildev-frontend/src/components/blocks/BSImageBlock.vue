<template>
  <img :src="block.props.src as string" :alt="block.props.alt as string" :style="{ width: block.props.width as string }" />
</template>
<script setup lang="ts">
import type { BSBlock } from "@buildersite/sdk";
defineProps<{ block: BSBlock }>();
</script>
<style scoped>
img { display: block; max-width: 100%; }
</style>
