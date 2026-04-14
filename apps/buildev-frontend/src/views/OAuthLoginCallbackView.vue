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
              <svg v-if="provider === 'github'" class="ico" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.05 1.755 2.805 1.26 3.495.945.105-.75.42-1.26.765-1.56-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              <svg v-else class="ico ico-google" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </span>
            <span class="provider-label">{{ providerLabel }}</span>
          </div>

          <div class="spinner-wrap" aria-hidden="true">
            <div class="spinner" />
          </div>

          <h1 class="title">Completando acceso</h1>
          <p class="lead">{{ message }}</p>
          <p class="hint">Puedes dejar esta ventana abierta; te redirigiremos al panel en unos segundos.</p>
        </div>

        <div v-else-if="error" class="card card--err">
          <div class="err-badge" aria-hidden="true">
            <svg class="err-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v5M12 16h.01" stroke-linecap="round" />
            </svg>
          </div>
          <h1 class="title">No pudimos iniciar sesión</h1>
          <p class="err-text">{{ error }}</p>
          <button type="button" class="btn-primary" @click="goLogin">Volver al inicio de sesión</button>
        </div>
      </main>

      <aside class="hero" aria-hidden="true">
        <div class="hero-mark">B</div>
        <p class="hero-kicker">Acceso seguro</p>
        <h2 class="hero-title">Un solo clic, sin contraseña extra</h2>
        <p class="hero-copy">
          Validamos tu cuenta con {{ providerLabel }} y te llevamos al panel. Si algo falla, siempre puedes entrar con
          correo y contraseña.
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { apiBase } from "../utils/apiBase";
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref<string | null>(null);
const message = ref("Intercambiando el código de autorización con el servidor…");

const provider = computed(() => (route.path.includes("google") ? "google" : "github"));
const providerLabel = computed(() => (provider.value === "google" ? "Google" : "GitHub"));

const LOGIN_HTML_CLASS = "login-fullpage-active";

function buildApiUrl(path: string): string {
  return apiBase.length > 0 ? `${apiBase}${path}` : path;
}

onMounted(async () => {
  document.documentElement.classList.add(LOGIN_HTML_CLASS);
  document.body.classList.add(LOGIN_HTML_CLASS);

  const code = typeof route.query.code === "string" ? route.query.code : "";
  const state = typeof route.query.state === "string" ? route.query.state : "";
  if (!code || !state) {
    error.value = "Faltan parámetros de autorización (code o state). Vuelve a iniciar sesión con Google o GitHub.";
    loading.value = false;
    return;
  }
  const path = provider.value === "google" ? "google" : "github";
  const endpoint = buildApiUrl(`/api/auth/login/${path}`);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    });
    const raw = await res.text();
    let json: {
      ok?: boolean;
      error?: string;
      data?: { token: string; userId: string; siteId?: string; role?: string };
    };
    try {
      json = JSON.parse(raw) as typeof json;
    } catch {
      throw new Error(
        `El API respondió ${res.status} sin JSON válido. Comprueba VITE_API_URL, CORS y que las URIs de redirección en GitHub/Google coincidan con ${window.location.origin}/auth/github o …/auth/google.`,
      );
    }
    if (!json.ok || !json.data?.token) {
      throw new Error(typeof json.error === "string" ? json.error : "No se pudo iniciar sesión");
    }
    message.value = "Sesión lista. Redirigiendo…";
    auth.persistSession(json.data);
    await auth.fetchGitHubStatus();
    const stored = sessionStorage.getItem("bs_post_oauth_redirect");
    sessionStorage.removeItem("bs_post_oauth_redirect");
    const next =
      stored && stored.startsWith("/") ? stored : "/";
    await router.replace(next);
  } catch (e: unknown) {
    if (e instanceof TypeError) {
      error.value = `No se pudo contactar al API (Failed to fetch). Destino: ${endpoint}. Revisa VITE_API_URL y que el backend sea accesible desde el navegador.`;
    } else {
      error.value = e instanceof Error ? e.message : "Error desconocido";
    }
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  document.documentElement.classList.remove(LOGIN_HTML_CLASS);
  document.body.classList.remove(LOGIN_HTML_CLASS);
});

function goLogin() {
  void router.replace("/login");
}
</script>

<style scoped src="./oauthCallbackShell.css"></style>
