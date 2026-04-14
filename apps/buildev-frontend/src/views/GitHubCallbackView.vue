<template>
  <div class="page">
    <div class="shell">
      <main class="panel" aria-live="polite">
        <div class="brand">
          <img src="../assets/isotype.svg" alt="" width="36" height="36" />
          <span>Buildev</span>
        </div>

        <div v-if="loading" class="card">
          <div class="provider">
            <span class="provider-icon" aria-hidden="true">
              <svg class="ico" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.05 1.755 2.805 1.26 3.495.945.105-.75.42-1.26.765-1.56-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
            </span>
            <span class="provider-label">GitHub</span>
          </div>

          <div class="spinner-wrap" aria-hidden="true">
            <div class="spinner" />
          </div>

          <h1 class="title">Vinculando GitHub</h1>
          <p class="lead">Estamos guardando el enlace con tu cuenta Buildev para importar repos sin PAT manual.</p>
          <p class="hint">No cierres esta pestaña hasta que terminemos.</p>
        </div>

        <div v-else-if="error" class="card card--err">
          <div class="err-badge" aria-hidden="true">
            <svg class="err-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v5M12 16h.01" stroke-linecap="round" />
            </svg>
          </div>
          <h1 class="title">No se pudo vincular</h1>
          <p class="err-text">{{ error }}</p>
          <button type="button" class="btn-primary" @click="goHome">Volver al panel</button>
        </div>
      </main>

      <aside class="hero" aria-hidden="true">
        <div class="hero-mark">B</div>
        <p class="hero-kicker">Integración</p>
        <h2 class="hero-title">Repos y push desde el editor</h2>
        <p class="hero-copy">
          Al vincular GitHub, el servidor puede actuar en tu nombre con los permisos que aceptaste en la pantalla de
          autorización.
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

import { resolveApiBase } from "../utils/apiBase";

const API = resolveApiBase(import.meta.env.VITE_API_URL);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref<string | null>(null);

const LOGIN_HTML_CLASS = "login-fullpage-active";

function buildApiUrl(path: string): string {
  return API.length > 0 ? `${API}${path}` : path;
}

onMounted(async () => {
  document.documentElement.classList.add(LOGIN_HTML_CLASS);
  document.body.classList.add(LOGIN_HTML_CLASS);

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
    const endpoint = buildApiUrl("/api/auth/github/callback");
    const res = await fetch(endpoint, {
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
    await router.push("/");
  } catch (err: unknown) {
    if (err instanceof TypeError) {
      error.value =
        "No se pudo contactar al API (Failed to fetch). Revisa VITE_API_URL y que el backend sea accesible desde el navegador.";
    } else {
      error.value = err instanceof Error ? err.message : "Error desconocido";
    }
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  document.documentElement.classList.remove(LOGIN_HTML_CLASS);
  document.body.classList.remove(LOGIN_HTML_CLASS);
});

function goHome() {
  void router.push("/");
}
</script>

<style scoped src="./oauthCallbackShell.css"></style>
