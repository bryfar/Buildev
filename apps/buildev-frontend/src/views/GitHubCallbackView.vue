<template>
  <div class="callback-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Conectando con GitHub...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <div class="error-icon">×</div>
      <p>{{ error }}</p>
      <button type="button" @click="goHome" class="btn-retry">Volver al inicio</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

import { resolveApiBase } from "../utils/apiBase";

const API = resolveApiBase(import.meta.env.VITE_API_URL);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const code = typeof route.query.code === "string" ? route.query.code : "";
  const state = typeof route.query.state === "string" ? route.query.state : "";
  if (!code || !state) {
    error.value = "Faltan parámetros de autorización de GitHub (code o state).";
    loading.value = false;
    return;
  }

  const bearer = auth.token;
  if (!bearer) {
    error.value =
      "No hay sesión Buildev en este navegador. Inicia sesión, abre de nuevo «Vincular GitHub» y completa el flujo sin cerrar sesión.";
    loading.value = false;
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/github/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ code, state }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      error?: string;
      data?: { githubUsername?: string | null };
    };

    if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "No se pudo vincular GitHub");

    auth.setGitHubLinked(true, json.data?.githubUsername ?? null);
    await auth.fetchGitHubStatus();
    router.push("/");
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Error desconocido";
  } finally {
    loading.value = false;
  }
});

function goHome() {
  router.push("/");
}
</script>

<style scoped>
.callback-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f1117;
  color: white;
  font-family: sans-serif;
}

.loading-state,
.error-state {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #ef4444;
  color: white;
  font-size: 32px;
  line-height: 60px;
  border-radius: 50%;
  margin: 0 auto 16px;
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background: #6366f1;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
</style>
