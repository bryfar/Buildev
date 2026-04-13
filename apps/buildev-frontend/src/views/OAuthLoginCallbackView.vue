<template>
  <div class="wrap">
    <div v-if="loading" class="state">
      <div class="spinner" />
      <p>{{ message }}</p>
    </div>
    <div v-else-if="error" class="state err">
      <p>{{ error }}</p>
      <button type="button" class="btn" @click="goLogin">Volver al inicio de sesión</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { resolveApiBase } from "../utils/apiBase";

const API = resolveApiBase(import.meta.env.VITE_API_URL);
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref<string | null>(null);
const message = ref("Completando inicio de sesión…");

const provider = computed(() => (route.path.includes("google") ? "google" : "github"));

onMounted(async () => {
  const code = typeof route.query.code === "string" ? route.query.code : "";
  const state = typeof route.query.state === "string" ? route.query.state : "";
  if (!code || !state) {
    error.value = "Faltan parámetros de autorización (code o state).";
    loading.value = false;
    return;
  }
  const path = provider.value === "google" ? "google" : "github";
  try {
    const res = await fetch(`${API}/api/auth/login/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      error?: string;
      data?: { token: string; userId: string; siteId: string; role?: string };
    };
    if (!json.ok || !json.data?.token) {
      throw new Error(typeof json.error === "string" ? json.error : "No se pudo iniciar sesión");
    }
    auth.persistSession(json.data);
    await auth.fetchGitHubStatus();
    await router.replace("/");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Error desconocido";
  } finally {
    loading.value = false;
  }
});

function goLogin() {
  void router.replace("/login");
}
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
  font-family: Inter, system-ui, sans-serif;
}
.state {
  text-align: center;
  padding: 32px;
  max-width: 400px;
}
.state.err p {
  color: #b91c1c;
  margin-bottom: 16px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e4e4e7;
  border-top-color: #18181b;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.btn {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: #18181b;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>
