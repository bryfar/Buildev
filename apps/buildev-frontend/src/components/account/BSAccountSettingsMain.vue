<template>
  <div class="main" :class="{ 'main--dark': dark }">
    <!-- Resumen -->
    <template v-if="section === 'overview'">
      <p class="lead">Vista general de tu cuenta y del espacio de trabajo.</p>
      <div class="cards-row">
        <div class="card">
          <span class="card-kicker">Plan</span>
          <strong class="card-title">Open Source</strong>
          <p class="card-desc">Instancia local u OSS sin facturación integrada.</p>
          <button type="button" class="btn-ghost" @click="$emit('go', 'billing')">Ver facturación</button>
        </div>
        <div class="card">
          <span class="card-kicker">GitHub</span>
          <strong class="card-title">{{ auth.githubLinked ? "Conectado" : "Sin conectar" }}</strong>
          <p class="card-desc">
            {{ auth.githubLinked ? `@${auth.githubUsername}` : "Importa repos y sincroniza sin PAT manual." }}
          </p>
          <button type="button" class="btn-ghost" @click="$emit('go', 'integrations')">Integraciones</button>
        </div>
      </div>
      <div class="card wide">
        <span class="card-kicker">Identidad</span>
        <dl class="dl-inline">
          <div><dt>Nombre</dt><dd>{{ auth.userName || "—" }}</dd></div>
          <div><dt>Email</dt><dd>{{ auth.userEmail || "—" }}</dd></div>
          <div><dt>Rol</dt><dd>{{ auth.role || "—" }}</dd></div>
        </dl>
      </div>
    </template>

    <!-- Preferencias -->
    <template v-else-if="section === 'preferences'">
      <p class="lead">Apariencia y comportamiento del editor (solo en este navegador).</p>
      <div class="card wide">
        <div class="row-between">
          <div>
            <strong class="row-title">Tema</strong>
            <p class="card-desc">Claro u oscuro; se guarda en localStorage.</p>
          </div>
          <div class="seg">
            <button type="button" class="seg-btn" :class="{ on: ui.theme === 'light' }" @click="setTheme('light')">
              Claro
            </button>
            <button type="button" class="seg-btn" :class="{ on: ui.theme === 'dark' }" @click="setTheme('dark')">
              Oscuro
            </button>
          </div>
        </div>
      </div>
      <div class="card wide muted">
        <strong class="row-title">Idioma de la UI</strong>
        <p class="card-desc">Por ahora solo español / inglés mixto en etiquetas del producto.</p>
      </div>
    </template>

    <!-- Integraciones -->
    <template v-else-if="section === 'integrations'">
      <p class="lead">Conecta proveedores externos usados por importación, Git y despliegue.</p>
      <div v-if="!props.githubOAuthReady" class="banner-warn">
        <strong>GitHub OAuth no está configurado en el servidor.</strong>
        <p v-if="props.githubOAuthHint" class="oauth-hint">{{ props.githubOAuthHint }}</p>
        <p class="oauth-lead">En el backend (variables de entorno o <code>apps/buildev-backend/.env</code>):</p>
        <ul class="oauth-steps">
          <li>
            <code>GITHUB_CLIENT_ID</code> y <code>GITHUB_CLIENT_SECRET</code> (obligatorios; sin ellos no aparece
            «listo»). Sin valores de plantilla (p. ej. «REEMPLAZA»): el API los detecta y marca OAuth como no listo.
          </li>
          <li>
            Si arrancas el API con <code>yarn dev</code> desde la raíz del repo, define las variables en
            <code>apps/buildev-backend/.env</code> (el servidor las lee desde esa ruta aunque el proceso no tenga cwd ahí).
          </li>
          <li>
            <code>PUBLIC_APP_URL</code>: URL del front <strong>sin</strong> barra final (p. ej.
            <code>https://tu-app.vercel.app</code>). El API usa entonces
            <code>…/github/callback</code> (vincular repo) y <code>…/auth/github</code> (login).
          </li>
          <li>
            O define a mano <code>GITHUB_OAUTH_CALLBACK_URL</code> (vincular) y
            <code>GITHUB_LOGIN_REDIRECT_URI</code> (login); deben coincidir con las URLs autorizadas en la
            <strong>misma</strong> GitHub OAuth App.
          </li>
          <li>Reinicia el API tras guardar cambios.</li>
        </ul>
      </div>
      <div class="card wide">
        <div class="int-head">
          <span class="int-name">GitHub</span>
          <span v-if="auth.githubLinked" class="badge ok">Conectado</span>
          <span v-else class="badge muted">No conectado</span>
        </div>
        <p v-if="auth.githubLinked" class="card-desc">
          Cuenta vinculada como <strong>@{{ auth.githubUsername || "usuario" }}</strong>
        </p>
        <p v-else class="card-desc">Vincula tu cuenta para la API de GitHub sin pegar tokens en cada sesión.</p>
        <p v-if="githubError" class="err">{{ githubError }}</p>
        <button
          type="button"
          class="btn-primary"
          :disabled="githubBusy || !props.githubOAuthReady || !auth.isAuthenticated"
          @click="onGithub"
        >
          <span v-if="githubBusy">Redirigiendo…</span>
          <span v-else>{{ auth.githubLinked ? "Actualizar conexión con GitHub" : "Vincular cuenta de GitHub" }}</span>
        </button>
      </div>
      <div class="card wide muted">
        <div class="int-head">
          <span class="int-name">Vercel</span>
          <span class="badge muted">Próximamente</span>
        </div>
        <p class="card-desc">Despliegue y variables desde el panel de cuenta.</p>
      </div>
    </template>

    <!-- Uso -->
    <template v-else-if="section === 'usage'">
      <p class="lead">Resumen de uso (local / demo). Los límites reales dependerán de tu despliegue.</p>
      <div class="card wide">
        <span class="card-kicker">IA · esta sesión</span>
        <div class="meter">
          <div class="meter-fill" :style="{ width: '8%' }" />
        </div>
        <p class="card-desc">Ejemplo: pocos prompts en el asistente. Conecta telemetría propia para datos reales.</p>
        <button type="button" class="btn-ghost" @click="goAi">Abrir AI Studio</button>
      </div>
    </template>

    <!-- Facturación -->
    <template v-else>
      <p class="lead">Facturación y planes (estilo Cursor): en esta build OSS no hay cobro integrado.</p>
      <div class="cards-row">
        <div class="card">
          <span class="card-kicker">Actual</span>
          <strong class="card-title">Community</strong>
          <p class="card-desc">Sin cargo en instancias autoalojadas.</p>
        </div>
        <div class="card accent">
          <span class="card-kicker">Cloud</span>
          <strong class="card-title">Próximamente</strong>
          <p class="card-desc">Planes gestionados y facturas en PDF cuando exista producto cloud.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, withDefaults } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../store/auth";
import { useUIStore } from "../../store/ui";
import type { AccountSettingsSection } from "./accountSettingsTypes";

const props = withDefaults(
    defineProps<{
        section: AccountSettingsSection;
        githubOAuthReady: boolean;
        dark: boolean;
        githubOAuthHint?: string | null;
    }>(),
    { githubOAuthHint: null },
);

const emit = defineEmits<{
    go: [AccountSettingsSection];
}>();

const auth = useAuthStore();
const ui = useUIStore();
const router = useRouter();
const githubBusy = ref(false);
const githubError = ref("");

function setTheme(mode: "light" | "dark") {
    ui.setTheme(mode);
}

async function onGithub() {
    githubError.value = "";
    githubBusy.value = true;
    try {
        await auth.startGitHubOAuth();
    } catch (e: unknown) {
        githubError.value = e instanceof Error ? e.message : "No se pudo iniciar GitHub OAuth";
    } finally {
        githubBusy.value = false;
    }
}

function goAi() {
    void router.push("/ai-studio");
}
</script>

<style scoped src="./BSAccountSettingsMain.css"></style>
