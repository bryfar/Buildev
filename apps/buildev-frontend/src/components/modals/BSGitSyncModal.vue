<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content git-sync-modal shadow-glow">
      <div class="modal-header-v2">
        <h3>Git: importar y sincronizar</h3>
        <button type="button" class="btn-close-v3" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body-v2">
        <div class="tabs">
          <button type="button" class="tab" :class="{ active: tab === 'sync' }" @click="tab = 'sync'">Sync</button>
          <button type="button" class="tab" :class="{ active: tab === 'branches' }" @click="tab = 'branches'">Branches</button>
          <button type="button" class="tab" :class="{ active: tab === 'pr' }" @click="tab = 'pr'">Pull request</button>
          <button type="button" class="tab" :class="{ active: tab === 'history' }" @click="tab = 'history'">History</button>
        </div>

        <template v-if="tab === 'sync'">
        <div v-if="auth.githubLinked" class="github-account-strip">
          GitHub vinculado: <strong>@{{ auth.githubUsername || "cuenta" }}</strong>
        </div>
        <div v-else class="github-connect-block">
          <p class="hint">Conecta tu cuenta de GitHub para usar la API sin pegar tokens.</p>
          <button type="button" class="btn-primary-v3" @click="connectGithub">Vincular GitHub</button>
        </div>

        <p class="hint">
          El archivo del proyecto vive en <code>{{ exportPathDefault }}</code> (JSON exportable del builder).
          Puedes usar la <strong>URL del repositorio</strong> o <code>owner/repo</code>.
        </p>

        <details class="adv-pat">
          <summary>PAT opcional (anula la cuenta vinculada)</summary>
          <label class="field-label">Token (solo en local)</label>
          <input
            v-model="githubToken"
            type="password"
            class="bs-input-v2"
            autocomplete="off"
            placeholder="ghp_..."
            @change="persistToken"
          />
        </details>

        <label class="field-label">URL del repositorio o owner/repo</label>
        <input
          v-model="repoFullName"
          type="text"
          class="bs-input-v2"
          placeholder="https://github.com/acme/mi-sitio"
          @blur="normalizeRepoField"
        />

        <div class="row-2">
          <div>
            <label class="field-label">Rama</label>
            <input v-model="branch" type="text" class="bs-input-v2" placeholder="main" />
          </div>
          <div>
            <label class="field-label">Ruta del JSON</label>
            <input v-model="exportPath" type="text" class="bs-input-v2" :placeholder="exportPathDefault" />
          </div>
        </div>

        <div v-if="statusMessage" class="status-banner" :class="statusKind">{{ statusMessage }}</div>

        <div v-if="linkedInfo" class="linked-pill">
          Enlazado: {{ linkedInfo.repoFullName }} @ {{ linkedInfo.branch }}
        </div>

        <div class="actions-row">
          <button type="button" class="btn-secondary-v2" :disabled="busy" @click="runImport">
            Importar repo
          </button>
          <button type="button" class="btn-secondary-v2" :disabled="busy" @click="runLink">
            Solo enlazar
          </button>
          <button type="button" class="btn-secondary-v2" :disabled="busy || !linkedInfo" @click="runPull">
            Pull
          </button>
        </div>

        <div class="push-block">
          <label class="field-label">Commit y push (exporta el sitio al JSON en el repo)</label>
          <input v-model="commitMessage" type="text" class="bs-input-v2" placeholder="chore: sync desde Buildev" />
          <button type="button" class="btn-primary-v3 w-full" :disabled="busy || !linkedInfo" @click="runPush">
            Commit &amp; push
          </button>
        </div>

        <label class="inline-check">
          <input v-model="livePoll" type="checkbox" @change="onLiveToggle" />
          Sync en vivo (cada 25s comprobar cambios remotos)
        </label>
        </template>

        <template v-else-if="tab === 'branches'">
          <p class="hint">Crea ramas y selecciona el origen.</p>
          <div class="actions-row">
            <button type="button" class="btn-secondary-v2" :disabled="busy || !linkedInfo" @click="loadBranches">Refrescar</button>
          </div>
          <div v-if="branches.length" class="branch-list">
            <div v-for="b in branches" :key="b" class="branch-item">{{ b }}</div>
          </div>
          <div class="row-2">
            <div>
              <label class="field-label">Base</label>
              <input v-model="newBranchFrom" type="text" class="bs-input-v2" placeholder="main" />
            </div>
            <div>
              <label class="field-label">Nueva rama</label>
              <input v-model="newBranchName" type="text" class="bs-input-v2" placeholder="feat/my-change" />
            </div>
          </div>
          <button type="button" class="btn-primary-v3 w-full" :disabled="busy || !linkedInfo || !newBranchName" @click="runCreateBranch">
            Crear branch
          </button>
        </template>

        <template v-else-if="tab === 'pr'">
          <p class="hint">Crea un Pull Request. Recomendado: primero commit & push en tu branch.</p>
          <div class="row-2">
            <div>
              <label class="field-label">Head (branch)</label>
              <input v-model="prHead" type="text" class="bs-input-v2" placeholder="feat/my-change" />
            </div>
            <div>
              <label class="field-label">Base</label>
              <input v-model="prBase" type="text" class="bs-input-v2" placeholder="main" />
            </div>
          </div>
          <label class="field-label">Título</label>
          <input v-model="prTitle" type="text" class="bs-input-v2" placeholder="feat: ..." />
          <label class="field-label">Descripción</label>
          <textarea v-model="prBody" class="bs-textarea" placeholder="Describe el cambio..."></textarea>
          <button type="button" class="btn-primary-v3 w-full" :disabled="busy || !linkedInfo || !prTitle || !prHead" @click="runCreatePr">
            Crear Pull Request
          </button>
          <div v-if="createdPrUrl" class="linked-pill">PR: {{ createdPrUrl }}</div>
        </template>

        <template v-else>
          <p class="hint">Historial de actividades Git del proyecto. Puedes restaurar un snapshot previo.</p>
          <div class="actions-row">
            <button type="button" class="btn-secondary-v2" :disabled="busy || !linkedInfo" @click="loadHistory">Refrescar</button>
          </div>
          <div v-if="history.length" class="history-list">
            <div v-for="item in history" :key="String((item as any).id ?? (item as any).createdAt)" class="history-item">
              <div class="history-main">
                <strong>{{ (item as any).type }}</strong>
                <span class="muted">{{ (item as any).branch || '' }}</span>
              </div>
              <div class="history-meta">
                <span class="muted">{{ (item as any).createdAt || '' }}</span>
                <button type="button" class="btn-secondary-v2 small" :disabled="busy" @click="selectedHistory = item; showDiff = true">Ver cambios</button>
                <button type="button" class="btn-secondary-v2 small" :disabled="busy" @click="runRestore(String((item as any).id || ''))">Restore</button>
              </div>
            </div>
          </div>
          <div v-if="showDiff && selectedHistory" class="diff-panel">
            <div class="diff-header">
              <strong>Cambios</strong>
              <button type="button" class="btn-secondary-v2 small" @click="showDiff = false">Cerrar</button>
            </div>
            <div class="muted">Resumen</div>
            <pre class="diff-pre">{{ safeStringify((selectedHistory as any).diffSummary ?? null) }}</pre>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from "vue";
import { useAuthStore } from "../../store/auth";
import { gitService, GITHUB_PAT_STORAGE_KEY } from "../../services/gitService";
import { parseGithubRepoUrl } from "../../utils/parseGithubRepoUrl";

const props = defineProps<{
  siteId: string;
}>();

const emit = defineEmits<{
  close: [];
  synced: [];
  requestDeploy: [{ branch: string }];
}>();

const auth = useAuthStore();
const exportPathDefault = ".buildev/buildev-site.json";

const tab = ref<"sync" | "branches" | "pr" | "history">("sync");

const githubToken = ref(localStorage.getItem(GITHUB_PAT_STORAGE_KEY) ?? "");
const repoFullName = ref("");
const branch = ref("main");
const exportPath = ref(exportPathDefault);
const commitMessage = ref("chore: sync desde Buildev");
const busy = ref(false);
const statusMessage = ref("");
const statusKind = ref<"ok" | "warn" | "err">("ok");
const linkedInfo = ref<{ repoFullName: string; branch: string } | null>(null);
/** Por defecto activo salvo que el usuario desactive explícitamente (valor "0"). */
const livePoll = ref(localStorage.getItem(`bs_git_poll_${props.siteId}`) !== "0");

const branches = ref<string[]>([]);
const newBranchName = ref("");
const newBranchFrom = ref("main");

const prHead = ref("");
const prBase = ref("main");
const prTitle = ref("");
const prBody = ref("");
const createdPrUrl = ref("");

const history = ref<unknown[]>([]);
const selectedHistory = ref<unknown | null>(null);
const showDiff = ref(false);

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

function persistToken() {
  if (githubToken.value.trim()) {
    localStorage.setItem(GITHUB_PAT_STORAGE_KEY, githubToken.value.trim());
  }
}

/** PAT manual; si está vacío el backend usa el token OAuth vinculado al usuario. */
function patOverride(): string | undefined {
  const t = githubToken.value.trim();
  return t.length > 0 ? t : undefined;
}

function hasGitAuth(): boolean {
  return Boolean(patOverride()) || auth.githubLinked;
}

function normalizeRepoField() {
  const p = parseGithubRepoUrl(repoFullName.value);
  if (p) {
    repoFullName.value = p;
  }
}

function resolvedRepoFullName(): string | null {
  const raw = repoFullName.value.trim();
  const parsed = parseGithubRepoUrl(raw);
  if (parsed) {
    return parsed;
  }
  return /^[\w.-]+\/[\w.-]+$/.test(raw) ? raw : null;
}

async function connectGithub() {
  try {
    await auth.startGitHubOAuth();
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "No se pudo abrir GitHub", "err");
  }
}

function setStatus(msg: string, kind: "ok" | "warn" | "err") {
  statusMessage.value = msg;
  statusKind.value = kind;
}

async function refreshStatus() {
  if (!props.siteId) return;
  await auth.fetchGitHubStatus();
  if (!hasGitAuth()) return;
  try {
    const data = await gitService.getStatus(auth.authHeaders(), props.siteId, patOverride());
    if (!data.linked) {
      linkedInfo.value = null;
      return;
    }
    linkedInfo.value = { repoFullName: data.repoFullName ?? "", branch: data.branch ?? "main" };
    if (data.inSync === false) {
      setStatus("Hay cambios en el remoto. Pulsa Pull para traerlos.", "warn");
    } else if (data.inSync === true) {
      setStatus("En sync con el último SHA conocido.", "ok");
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error de estado";
    setStatus(msg, "err");
  }
}

async function runImport() {
  if (!hasGitAuth()) {
    setStatus("Vincula GitHub o introduce un PAT en «opciones avanzadas».", "err");
    return;
  }
  const repo = resolvedRepoFullName();
  if (!repo) {
    setStatus("URL del repositorio no válida (usa https://github.com/org/repo u org/repo).", "err");
    return;
  }
  busy.value = true;
  try {
    await gitService.importRepository(auth.authHeaders(), props.siteId, patOverride(), {
      repoFullName: repo,
      branch: branch.value.trim() || "main",
      exportPath: exportPath.value.trim() || exportPathDefault,
      linkAfterImport: true,
    });
    persistToken();
    setStatus("Importación completada. Páginas y componentes actualizados.", "ok");
    await refreshStatus();
    emit("synced");
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "Import error", "err");
  } finally {
    busy.value = false;
  }
}

async function runLink() {
  if (!hasGitAuth()) {
    setStatus("Vincula GitHub o introduce un PAT en «opciones avanzadas».", "err");
    return;
  }
  const repo = resolvedRepoFullName();
  if (!repo) {
    setStatus("URL del repositorio no válida.", "err");
    return;
  }
  busy.value = true;
  try {
    await gitService.linkRepository(auth.authHeaders(), props.siteId, patOverride(), {
      repoFullName: repo,
      branch: branch.value.trim() || "main",
      exportPath: exportPath.value.trim() || exportPathDefault,
    });
    persistToken();
    setStatus("Repositorio enlazado. Ya puedes hacer push o pull.", "ok");
    await refreshStatus();
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "Link error", "err");
  } finally {
    busy.value = false;
  }
}

async function runPull() {
  if (!hasGitAuth()) {
    setStatus("Vincula GitHub o introduce un PAT en «opciones avanzadas».", "err");
    return;
  }
  busy.value = true;
  try {
    await gitService.pull(auth.authHeaders(), props.siteId, patOverride());
    setStatus("Pull completado.", "ok");
    await refreshStatus();
    emit("synced");
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "Pull error", "err");
  } finally {
    busy.value = false;
  }
}

async function runPush() {
  if (!hasGitAuth()) {
    setStatus("Vincula GitHub o introduce un PAT en «opciones avanzadas».", "err");
    return;
  }
  busy.value = true;
  try {
    await gitService.push(
      auth.authHeaders(),
      props.siteId,
      patOverride(),
      commitMessage.value.trim() || "chore: sync desde Buildev",
    );
    setStatus("Push completado.", "ok");
    await refreshStatus();
    emit("synced");
    emit("requestDeploy", { branch: branch.value.trim() || "main" });
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "Push error", "err");
  } finally {
    busy.value = false;
  }
}

async function loadBranches() {
  if (!hasGitAuth() || !linkedInfo.value) return;
  busy.value = true;
  try {
    branches.value = await gitService.listBranches(auth.authHeaders(), props.siteId, patOverride());
    setStatus("Branches cargados.", "ok");
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "Branches error", "err");
  } finally {
    busy.value = false;
  }
}

async function runCreateBranch() {
  if (!hasGitAuth() || !linkedInfo.value) return;
  busy.value = true;
  try {
    await gitService.createBranch(
      auth.authHeaders(),
      props.siteId,
      patOverride(),
      newBranchName.value.trim(),
      newBranchFrom.value.trim() || "main",
    );
    setStatus("Branch creado.", "ok");
    newBranchName.value = "";
    await loadBranches();
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "Create branch error", "err");
  } finally {
    busy.value = false;
  }
}

async function runCreatePr() {
  if (!hasGitAuth() || !linkedInfo.value) return;
  busy.value = true;
  try {
    const pr = await gitService.createPullRequest(
      auth.authHeaders(),
      props.siteId,
      patOverride(),
      prTitle.value.trim(),
      prBody.value,
      prHead.value.trim(),
      prBase.value.trim() || "main",
    );
    createdPrUrl.value = pr.html_url;
    setStatus("Pull Request creado.", "ok");
    emit("synced");
    emit("requestDeploy", { branch: prHead.value.trim() });
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "PR error", "err");
  } finally {
    busy.value = false;
  }
}

async function loadHistory() {
  if (!linkedInfo.value) return;
  busy.value = true;
  try {
    history.value = await gitService.history(auth.authHeaders(), props.siteId, patOverride(), 30);
    setStatus("Historial cargado.", "ok");
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "History error", "err");
  } finally {
    busy.value = false;
  }
}

async function runRestore(activityId: string) {
  if (!activityId) return;
  busy.value = true;
  try {
    await gitService.restore(auth.authHeaders(), props.siteId, patOverride(), activityId);
    setStatus("Restaurado. Refrescando...", "ok");
    emit("synced");
    await loadHistory();
  } catch (e: unknown) {
    setStatus(e instanceof Error ? e.message : "Restore error", "err");
  } finally {
    busy.value = false;
  }
}

function onLiveToggle() {
  localStorage.setItem(`bs_git_poll_${props.siteId}`, livePoll.value ? "1" : "0");
  setupPoll();
}

function setupPoll() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (!livePoll.value) return;
  pollTimer = setInterval(() => {
    void refreshStatus();
  }, 25000);
}

watch(
  () => props.siteId,
  (id) => {
    livePoll.value = localStorage.getItem(`bs_git_poll_${id}`) !== "0";
    void refreshStatus();
    setupPoll();
  },
  { immediate: true },
);

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.git-sync-modal {
  width: 100%;
  max-width: 520px;
  background: var(--bg-surface, #fff);
  border-radius: 16px;
  border: 1px solid var(--border-main, #e5e7eb);
  max-height: 90vh;
  overflow: auto;
}
.modal-header-v2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
}
.modal-header-v2 h3 {
  margin: 0;
  font-size: 18px;
}
.btn-close-v3 {
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  color: var(--text-muted, #666);
}
.modal-body-v2 {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hint {
  font-size: 12px;
  color: var(--text-muted, #666);
  margin: 0 0 8px;
  line-height: 1.45;
}
.github-account-strip {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(35, 134, 54, 0.1);
  border: 1px solid rgba(35, 134, 54, 0.35);
  font-size: 13px;
  margin-bottom: 8px;
}
.github-connect-block {
  margin-bottom: 12px;
}
.github-connect-block .hint {
  margin-bottom: 10px;
}
.adv-pat {
  margin: 10px 0;
  font-size: 13px;
}
.adv-pat summary {
  cursor: pointer;
  color: var(--text-muted, #666);
}
.adv-pat .field-label {
  margin-top: 10px;
}
.field-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-dim, #888);
}
.bs-input-v2 {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-main, #ddd);
  font-size: 14px;
}
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.tab {
  border: 1px solid var(--border-main, #ddd);
  background: var(--bg-main, #fff);
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}
.tab.active {
  background: rgba(79, 70, 229, 0.12);
  border-color: rgba(79, 70, 229, 0.35);
  color: var(--brand-primary, #4f46e5);
}
.branch-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 8px 0;
}
.branch-item {
  border: 1px solid var(--border-subtle, #eee);
  background: var(--bg-surface-alt, #f3f4f6);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main, #111);
}
.bs-textarea {
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-main, #ddd);
  font-size: 13px;
  resize: vertical;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.diff-panel {
  margin-top: 10px;
  border: 1px solid var(--border-subtle, #eee);
  background: var(--bg-surface-alt, #f3f4f6);
  border-radius: 12px;
  padding: 10px 12px;
}
.diff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.diff-pre {
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  background: rgba(0,0,0,0.05);
  overflow: auto;
  max-height: 220px;
  font-size: 11px;
}
:global(.theme-dark) .diff-pre {
  background: rgba(255,255,255,0.06);
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid var(--border-subtle, #eee);
  background: var(--bg-main, #fff);
  border-radius: 12px;
  padding: 10px 12px;
}
.history-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.muted {
  color: var(--text-muted, #666);
  font-size: 12px;
}
.btn-secondary-v2.small {
  padding: 6px 10px;
  min-width: unset;
  font-size: 12px;
}
.status-banner {
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 10px;
}
.status-banner.ok {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}
.status-banner.warn {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}
.status-banner.err {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}
.linked-pill {
  font-size: 12px;
  padding: 8px 10px;
  background: var(--bg-surface-alt, #f3f4f6);
  border-radius: 8px;
}
.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.btn-secondary-v2 {
  flex: 1;
  min-width: 120px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-main, #ddd);
  background: var(--bg-main, #fff);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}
.btn-secondary-v2:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.push-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle, #eee);
}
.btn-primary-v3 {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: var(--brand-primary, #4f46e5);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.btn-primary-v3:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.w-full {
  width: 100%;
}
.inline-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-top: 8px;
  cursor: pointer;
}
</style>
