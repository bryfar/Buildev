<template>
  <div 
    class="bs-spacer"
    :style="{ height: (block.props.height as any) + 'px' || '20px' }"
  ></div>
</template>

<script setup lang="ts">
import type { BSBlock } from "@buildersite/sdk";
defineProps<{ block: BSBlock }>();
</script>

<style scoped>
.bs-spacer {
  width: 100%;
}
</style>
