<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from './store/ui';

const ui = useUIStore();

onMounted(() => {
  ui.applyTheme();
});
</script>

<style>
@import "./assets/theme.css";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-main);
  color: var(--text-main);
}
</style>
