<template>
  <div class="page">
    <div class="shell">
      <main class="panel" aria-live="polite">
        <div class="brand">
          <img src="../assets/isotype.svg" alt="" width="36" height="36" />
          <span>Buildev</span>
        </div>

        <div v-if="loading" class="card">
          <h1 class="title">Invitación</h1>
          <p class="lead">Cargando datos de la invitación…</p>
          <div class="spinner-wrap" aria-hidden="true">
            <div class="spinner" />
          </div>
        </div>

        <div v-else-if="fetchError" class="card card--err">
          <h1 class="title">No se pudo cargar</h1>
          <p class="err-text">{{ fetchError }}</p>
          <button type="button" class="btn-primary" @click="reload">Reintentar</button>
        </div>

        <div v-else-if="preview" class="card">
          <h1 class="title">Invitación al proyecto</h1>

          <template v-if="preview.status === 'invalid'">
            <p class="lead">Este enlace no es válido o el token no existe.</p>
          </template>

          <template v-else-if="preview.status === 'expired'">
            <p class="lead">
              La invitación a <strong>{{ preview.siteName }}</strong> para
              <strong>{{ preview.email }}</strong> ha caducado.
            </p>
          </template>

          <template v-else-if="preview.status === 'accepted'">
            <p class="lead">
              Esta invitación a <strong>{{ preview.siteName }}</strong> ya fue aceptada.
            </p>
            <button v-if="auth.isAuthenticated" type="button" class="btn-primary" @click="goHome">Ir al panel</button>
            <button v-else type="button" class="btn-primary" @click="goLogin">Iniciar sesión</button>
          </template>

          <template v-else-if="preview.status === 'pending'">
            <p class="lead">
              Te han invitado a colaborar en <strong>{{ preview.siteName }}</strong> con el correo
              <strong>{{ preview.email }}</strong>.
            </p>

            <p v-if="!auth.isAuthenticated" class="hint">
              Inicia sesión con esa cuenta para unirte al proyecto.
            </p>
            <p v-else-if="emailMismatch" class="err-inline">
              Tu sesión es <strong>{{ auth.userEmail }}</strong>. Cierra sesión e inicia con
              <strong>{{ preview.email }}</strong>.
            </p>

            <div v-if="!auth.isAuthenticated" class="actions">
              <button type="button" class="btn-primary" @click="goLogin">Iniciar sesión</button>
            </div>
            <div v-else-if="!emailMismatch" class="actions">
              <button type="button" class="btn-primary" :disabled="acceptBusy" @click="acceptInvite">
                {{ acceptBusy ? "Uniendo…" : "Unirme al proyecto" }}
              </button>
            </div>
            <p v-if="acceptError" class="err-text">{{ acceptError }}</p>
          </template>
        </div>
      </main>

      <aside class="hero" aria-hidden="true">
        <div class="hero-mark">B</div>
        <p class="hero-kicker">Colaboración</p>
        <h2 class="hero-title">Trabaja en el mismo sitio</h2>
        <p class="hero-copy">
          Tras aceptar, tu espacio de trabajo activo será este proyecto. Puedes cambiar de sitio desde el panel cuando
          quieras.
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
import { readBuildevApiJson } from "../utils/apiResponse";

type InvitePreview =
  | { status: "invalid"; siteName: null; siteId: null; email: null; expiresAt: null }
  | {
      status: "pending" | "accepted" | "expired";
      siteName: string;
      siteId: string;
      email: string;
      expiresAt: string | null;
    };

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const fetchError = ref<string | null>(null);
const preview = ref<InvitePreview | null>(null);
const acceptBusy = ref(false);
const acceptError = ref<string | null>(null);

const rawToken = computed(() =>
  typeof route.query.token === "string" && route.query.token.length > 0 ? route.query.token : "",
);

const emailMismatch = computed(() => {
  if (!preview.value || preview.value.status !== "pending") return false;
  const a = (auth.userEmail ?? "").trim().toLowerCase();
  const b = preview.value.email.trim().toLowerCase();
  if (!a || !b) return false;
  return a !== b;
});

const LOGIN_HTML_CLASS = "login-fullpage-active";

function parsePreviewData(data: unknown): InvitePreview | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.status === "invalid") {
    return { status: "invalid", siteName: null, siteId: null, email: null, expiresAt: null };
  }
  if (d.status === "pending" || d.status === "accepted" || d.status === "expired") {
    const siteName = typeof d.siteName === "string" ? d.siteName : "";
    const siteId = typeof d.siteId === "string" ? d.siteId : "";
    const email = typeof d.email === "string" ? d.email : "";
    const expiresAt = d.expiresAt === null ? null : typeof d.expiresAt === "string" ? d.expiresAt : null;
    return {
      status: d.status,
      siteName,
      siteId,
      email,
      expiresAt,
    };
  }
  return null;
}

async function loadPreview(): Promise<void> {
  const token = rawToken.value;
  if (!token) {
    fetchError.value = "Falta el parámetro token en la URL.";
    preview.value = null;
    return;
  }
  loading.value = true;
  fetchError.value = null;
  try {
    const res = await fetch(
      `${apiBase}/api/auth/invite/preview?token=${encodeURIComponent(token)}`,
    );
    const json = await readBuildevApiJson(res);
    if (!json.ok) {
      fetchError.value = json.error ?? `Error HTTP ${res.status}`;
      preview.value = null;
      return;
    }
    const parsed = parsePreviewData(json.data ?? null);
    preview.value = parsed;
    if (!parsed) {
      fetchError.value = "Respuesta del servidor inesperada.";
    }
  } catch (e: unknown) {
    fetchError.value = e instanceof Error ? e.message : "Error de red";
    preview.value = null;
  } finally {
    loading.value = false;
  }
}

function goLogin(): void {
  const token = rawToken.value;
  const redirect =
    token.length > 0 ? `/invite?token=${encodeURIComponent(token)}` : "/invite";
  void router.push({ path: "/login", query: { redirect } });
}

function goHome(): void {
  void router.replace("/");
}

function reload(): void {
  void loadPreview();
}

async function acceptInvite(): Promise<void> {
  const token = rawToken.value;
  if (!token || !auth.token) return;
  acceptBusy.value = true;
  acceptError.value = null;
  try {
    const res = await fetch(`${apiBase}/api/auth/invite/accept`, {
      method: "POST",
      headers: auth.authHeaders(),
      body: JSON.stringify({ token }),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) {
      acceptError.value = json.error ?? `Error HTTP ${res.status}`;
      return;
    }
    const data = json.data;
    if (
      !data ||
      typeof data !== "object" ||
      typeof (data as { token?: string }).token !== "string" ||
      typeof (data as { userId?: string }).userId !== "string"
    ) {
      acceptError.value = "Respuesta inválida del servidor.";
      return;
    }
    const d = data as { token: string; userId: string; siteId?: string; role?: string };
    auth.persistSession({
      token: d.token,
      userId: d.userId,
      siteId: d.siteId,
      role: d.role,
    });
    await auth.fetchGitHubStatus();
    await router.replace("/");
  } catch (e: unknown) {
    acceptError.value = e instanceof Error ? e.message : "Error desconocido";
  } finally {
    acceptBusy.value = false;
  }
}

onMounted(async () => {
  document.documentElement.classList.add(LOGIN_HTML_CLASS);
  document.body.classList.add(LOGIN_HTML_CLASS);
  if (auth.token) {
    await auth.fetchGitHubStatus();
  }
  await loadPreview();
});

onUnmounted(() => {
  document.documentElement.classList.remove(LOGIN_HTML_CLASS);
  document.body.classList.remove(LOGIN_HTML_CLASS);
});
</script>

<style scoped src="./oauthCallbackShell.css"></style>

<style scoped>
.spinner-wrap {
  margin-top: 16px;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e4e4e7;
  border-top-color: #18181b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.actions {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.err-inline {
  color: #b91c1c;
  font-size: 14px;
  line-height: 1.5;
  margin: 12px 0 0;
}
.hint {
  color: #52525b;
  font-size: 14px;
  margin: 8px 0 0;
}
</style>
