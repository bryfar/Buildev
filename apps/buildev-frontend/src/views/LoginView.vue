<template>
  <div class="page">
    <div class="shell">
      <div class="panel">
        <div class="brand">
          <img src="../assets/isotype.svg" alt="" width="36" height="36" />
          <span>Buildev</span>
        </div>

        <div v-if="showProdApiMissingBanner" class="deploy-config-banner" role="alert">
          <strong>Falta la URL del API en el build</strong>
          <p>
            No se configura editando un archivo en Git: hay que definir la variable en
            <strong>Vercel</strong> (proyecto del <em>frontend</em>), luego generar un deploy nuevo.
          </p>
          <ol class="deploy-config-steps">
            <li>Abre <a href="https://vercel.com/dashboard" rel="noopener noreferrer" target="_blank">vercel.com/dashboard</a> y entra en el proyecto que despliega el editor.</li>
            <li><strong>Settings</strong> → <strong>Environment Variables</strong>.</li>
            <li>
              Nombre: <code>VITE_API_URL</code> · Valor: la URL pública de tu backend (sin <code>/</code> final), p. ej.
              <code>https://tu-api.vercel.app</code> · Marca Production (y Preview si quieres previews con API).
            </li>
            <li><strong>Deployments</strong> → los tres puntos del último deploy → <strong>Redeploy</strong> (así Vite inyecta la variable en el bundle).</li>
          </ol>
        </div>

        <h1>{{ isRegister ? "Crear cuenta" : "Iniciar sesión" }}</h1>
        <p class="sub">
          {{
            isRegister
              ? "Visualiza, edita y exporta sitios con IA. Crea tu espacio de trabajo."
              : "Accede a tu panel para seguir construyendo sitios de alto impacto."
          }}
        </p>

        <form @submit.prevent="submit">
          <template v-if="isRegister">
            <div class="field">
              <label for="reg-name">Nombre</label>
              <div class="input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input id="reg-name" v-model="form.name" type="text" required autocomplete="name" placeholder="Tu nombre" />
              </div>
            </div>
            <div class="field">
              <label for="reg-site">Nombre del sitio</label>
              <div class="input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                <input id="reg-site" v-model="form.siteName" type="text" required placeholder="Mi proyecto" />
              </div>
            </div>
          </template>

          <div class="field">
            <label for="email">Correo electrónico</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div class="field">
            <label for="password">{{ isRegister ? "Contraseña (mín. 8)" : "Contraseña" }}</label>
            <div class="input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                :autocomplete="isRegister ? 'new-password' : 'current-password'"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div v-if="!isRegister" class="row">
            <label class="remember">
              <input v-model="rememberMe" type="checkbox" />
              Recordarme
            </label>
            <button type="button" class="forgot" @click="onForgot">¿Olvidaste tu contraseña?</button>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button type="submit" class="submit" :disabled="loading">
            {{ loading ? "Cargando…" : isRegister ? "Crear cuenta" : "Iniciar sesión" }}
          </button>
        </form>

        <p class="toggle">
          {{ isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?" }}
          <button type="button" @click="toggleMode">{{ isRegister ? "Inicia sesión" : "Regístrate" }}</button>
        </p>

        <div class="divider">o con GitHub</div>

        <div class="sso">
          <button
            type="button"
            class="sso-btn"
            title="GitHub"
            :disabled="ssoBusy || !oauthReady || Boolean(oauthFetchError)"
            aria-label="Iniciar sesión con GitHub"
            @click="onGithub"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#18181b" aria-hidden="true">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.05 1.755 2.805 1.26 3.495.945.105-.75.42-1.26.765-1.56-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
          </button>
        </div>
        <p v-if="oauthFetchError" class="oauth-hint err">{{ oauthFetchError }}</p>
        <p v-else-if="oauthHint" class="oauth-hint">{{ oauthHint }}</p>
      </div>

      <aside class="hero" aria-hidden="true">
        <div class="hero-mark">B</div>
        <div class="hero-body">
          <p class="hero-kicker">Buildev</p>
          <h2>Bienvenido a Buildev</h2>
          <p>
            Diseña en canvas o con IA, exporta código limpio a React, Vue u HTML. Únete y empieza a construir tu próximo
            sitio hoy.
          </p>
          <div class="hero-card">
            <strong>Construye con confianza</strong>
            <span>Plantillas, design system y despliegue pensados para equipos que publican con frecuencia.</span>
            <div class="avatars" aria-hidden="true">
              <span class="av" />
              <span class="av" />
              <span class="av" />
              <span class="av" />
              <span class="av-more">+2</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { apiBase } from "../utils/apiBase";

/** En producción, el build debe incluir la URL del API; si no, las peticiones a /api van al dominio del SPA (Vercel 404). */
const showProdApiMissingBanner = computed(() => {
  if (!import.meta.env.PROD) {
    return false;
  }
  const raw = import.meta.env.VITE_API_URL;
  return typeof raw !== "string" || raw.trim() === "";
});

/**
 * Texto breve para mensajes de error de red (login / OAuth ready).
 *
 * @param resolved Resultado de `resolveApiBase` / `apiBase`
 * @returns Descripción legible del destino del API
 */
function describeApiFetchTarget(resolved: string): string {
  if (import.meta.env.DEV && resolved === "") {
    return "proxy Vite /api (véase VITE_DEV_API_PROXY en .env del front; por defecto 127.0.0.1:4000)";
  }
  if (resolved === "") return "origen actual + /api";
  return resolved;
}

/**
 * Extrae un fragmento legible de un cuerpo que no es JSON (p. ej. HTML de error de Express).
 *
 * @param raw Cuerpo de respuesta en texto
 * @param max Longitud máxima aproximada
 * @returns Fragmento recortado
 */
function truncateNonJsonBodyHint(raw: string, max = 220): string {
  const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const t = stripped.slice(0, max);
  return stripped.length > max ? `${t}…` : t;
}

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const isRegister = ref(false);
const loading = ref(false);
const ssoBusy = ref(false);
const error = ref<string | null>(null);
const rememberMe = ref(true);
const form = ref({ name: "", email: "", password: "", siteName: "" });
const oauthReady = ref(false);
const oauthHint = ref<string | null>(null);
const oauthFetchError = ref<string | null>(null);

const LOGIN_HTML_CLASS = "login-fullpage-active";

onMounted(async () => {
  document.documentElement.classList.add(LOGIN_HTML_CLASS);
  document.body.classList.add(LOGIN_HTML_CLASS);
  oauthFetchError.value = null;
  oauthHint.value = null;
  const endpoint = `${apiBase}/api/auth/oauth/login-ready`;
  try {
    const res = await fetch(endpoint);
    const rawBody = await res.text();
    let json: {
      ok?: boolean;
      error?: string;
      data?: {
        github?: boolean;
        hints?: { github?: string | null };
      };
    };
    try {
      json = JSON.parse(rawBody) as typeof json;
    } catch {
      const hint = truncateNonJsonBodyHint(rawBody);
      const looksLikeVercel404 =
        import.meta.env.PROD &&
        apiBase === "" &&
        (res.status === 404 ||
          /\bNOT_FOUND\b/i.test(rawBody) ||
          /page could not be found/i.test(rawBody));
      if (looksLikeVercel404) {
        oauthFetchError.value =
          "No hay API en este dominio: falta VITE_API_URL en el proyecto del front en Vercel (URL del backend, sin / al final) y un nuevo deploy. El 404 «NOT_FOUND» es la página de Vercel, no tu servidor.";
      } else {
        const portHint =
          import.meta.env.PROD && apiBase === ""
            ? " Si acabas de configurar VITE_API_URL, genera un nuevo deploy del front."
            : " Comprueba que el proceso en ese puerto sea este backend (p. ej. GET /api/health debe devolver JSON) y que no haya otro servicio usando el mismo puerto.";
        oauthFetchError.value = `El API respondió HTTP ${res.status} pero el cuerpo no es JSON. Destino: ${describeApiFetchTarget(apiBase)}.${hint ? ` Vista previa: «${hint}».` : ""}${portHint}`;
      }
      oauthReady.value = false;
      return;
    }
    if (!res.ok) {
      const apiErr = typeof json.error === "string" && json.error.trim() !== "" ? json.error.trim() : null;
      oauthFetchError.value = apiErr
        ? `El API respondió ${res.status}: ${apiErr}. Destino: ${describeApiFetchTarget(apiBase)}.`
        : `El API respondió ${res.status}. Destino: ${describeApiFetchTarget(apiBase)}. Arranca el backend y revisa puerto/proxy.`;
      oauthReady.value = false;
      return;
    }
    if (json.ok && json.data) {
      oauthReady.value = Boolean(json.data.github);
      const h = json.data.hints;
      if (h && typeof h === "object") {
        oauthHint.value = typeof h.github === "string" ? h.github : null;
      }
    }
  } catch (e: unknown) {
    const reason = e instanceof Error ? e.message : "Error desconocido";
    const dest = describeApiFetchTarget(apiBase);
    const devExtra = import.meta.env.DEV
      ? apiBase !== ""
        ? " Quita VITE_API_URL del .env del frontend (así se usa el proxy /api) o arranca el backend en esa URL exacta."
        : " Desde la raíz del monorepo ejecuta «yarn dev» (levanta API + editor) o en otra terminal «yarn dev:backend»."
        : apiBase === ""
        ? " En Vercel, define VITE_API_URL en el proyecto del front con la URL pública del backend y redespliega."
        : " Revisa VITE_API_URL y que el backend sea accesible desde el navegador (CORS, HTTPS).";
    oauthFetchError.value = `No se pudo contactar al API (${reason}). Destino: ${dest}.${devExtra}`;
    oauthReady.value = false;
  }
  const saved = localStorage.getItem("bs_remember_email");
  if (saved) form.value.email = saved;
  if (typeof route.query.redirect === "string" && route.query.redirect.startsWith("/")) {
    sessionStorage.setItem("bs_post_oauth_redirect", route.query.redirect);
  } else {
    sessionStorage.removeItem("bs_post_oauth_redirect");
  }
});

onUnmounted(() => {
  document.documentElement.classList.remove(LOGIN_HTML_CLASS);
  document.body.classList.remove(LOGIN_HTML_CLASS);
});

function toggleMode() {
  isRegister.value = !isRegister.value;
  error.value = null;
}

function onForgot() {
  error.value = "Recuperación de contraseña no está activada en esta instancia. Contacta al administrador.";
}

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    if (isRegister.value) {
      await auth.register(form.value.name, form.value.email, form.value.password, form.value.siteName);
    } else {
      await auth.login(form.value.email, form.value.password);
    }
    if (rememberMe.value && form.value.email) {
      localStorage.setItem("bs_remember_email", form.value.email);
    } else {
      localStorage.removeItem("bs_remember_email");
    }
    const next =
      typeof route.query.redirect === "string" && route.query.redirect.startsWith("/") ? route.query.redirect : "/";
    await router.push(next);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Algo salió mal";
  } finally {
    loading.value = false;
  }
}

async function onGithub() {
  ssoBusy.value = true;
  error.value = null;
  try {
    await auth.startGitHubLogin();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "No se pudo abrir GitHub";
    ssoBusy.value = false;
  }
}

</script>

<style scoped src="./LoginView.css"></style>

<style>
/* Asegura que #app estire a toda la ventana solo en la ruta de login */
html.login-fullpage-active,
html.login-fullpage-active body,
html.login-fullpage-active #app {
    min-height: 100dvh;
    min-height: 100vh;
    height: 100%;
    margin: 0;
}
</style>
