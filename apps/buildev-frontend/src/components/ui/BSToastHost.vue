<template>
  <div class="toast-host">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.kind">
      <div class="title">{{ t.title }}</div>
      <div v-if="t.message" class="message">{{ t.message }}</div>
      <a v-if="t.href" class="link" :href="t.href" target="_blank" rel="noreferrer">Abrir</a>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ToastItem {
  id: string;
  kind: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  href?: string;
}

defineProps<{
  toasts: ToastItem[];
}>();
</script>

<style scoped>
.toast-host {
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 20000;
}
.toast {
  width: 320px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 12px 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
}
.title {
  font-weight: 800;
  font-size: 13px;
}
.message {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(0,0,0,0.65);
  line-height: 1.35;
}
.link {
  display: inline-block;
  margin-top: 8px;
  font-weight: 800;
  font-size: 12px;
  color: #4f46e5;
  text-decoration: none;
}
.toast.success { border-color: rgba(16,185,129,0.35); }
.toast.error { border-color: rgba(239,68,68,0.35); }
.toast.warning { border-color: rgba(245,158,11,0.35); }
.toast.info { border-color: rgba(59,130,246,0.35); }

:global(.theme-dark) .toast {
  background: rgba(24,24,27,0.92);
  border-color: rgba(255,255,255,0.08);
}
:global(.theme-dark) .message { color: rgba(255,255,255,0.72); }
:global(.theme-dark) .title { color: rgba(255,255,255,0.92); }
</style>

