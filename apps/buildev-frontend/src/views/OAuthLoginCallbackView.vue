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

const providerLabel = computed(() => "GitHub");

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
    error.value = "Faltan parámetros de autorización (code o state). Vuelve a iniciar sesión con GitHub.";
    loading.value = false;
    return;
  }
  const endpoint = buildApiUrl("/api/auth/login/github");
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
        `El API respondió ${res.status} sin JSON válido. Comprueba VITE_API_URL, CORS y que la URI de redirección en GitHub coincida con ${window.location.origin}/auth/github.`,
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
