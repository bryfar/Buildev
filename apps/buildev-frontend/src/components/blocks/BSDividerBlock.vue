<template>
  <hr 
    class="bs-divider"
    :style="{ 
      borderTop: `${block.props.thickness || 1}px ${block.props.style || 'solid'} ${block.props.color || '#e2e8f0'}`,
      marginTop: block.props.marginTop || '16px',
      marginBottom: block.props.marginBottom || '16px',
      width: block.props.width || '100%'
    }"
  />
</template>

<script setup lang="ts">
import type { BSBlock } from "@buildersite/sdk";
defineProps<{ block: BSBlock }>();
</script>

<style scoped>
.bs-divider {
  border: none;
}
</style>
