<template>
  <Teleport to="body">
    <div class="acc-root" role="presentation">
      <div class="acc-backdrop" aria-hidden="true" @click="emit('close')" />
      <div
        class="acc-panel"
        :class="{ 'acc-panel--dark': ui.theme === 'dark' }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="acc-dialog-title"
      >
        <div class="acc-panel-inner">
          <nav class="acc-rail" aria-label="Ajustes de cuenta">
            <div class="acc-user">
              <div class="acc-avatar" aria-hidden="true">{{ userInitial }}</div>
              <div class="acc-user-text">
                <span class="acc-user-name">{{ auth.userName || "Usuario" }}</span>
                <span class="acc-user-plan">{{ planLabel }}</span>
              </div>
            </div>
            <p class="acc-rail-title">Cuenta</p>

            <button type="button" class="acc-item" :class="{ active: section === 'overview' }" @click="section = 'overview'">
              <svg class="acc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Resumen
            </button>
            <button type="button" class="acc-item" :class="{ active: section === 'preferences' }" @click="section = 'preferences'">
              <svg class="acc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              Preferencias
            </button>
            <div class="acc-sep" />
            <button type="button" class="acc-item" :class="{ active: section === 'integrations' }" @click="section = 'integrations'">
              <svg class="acc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 22v-5" />
                <path d="M9 8V2" />
                <path d="M15 8V2" />
                <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
              </svg>
              Integraciones
            </button>
            <div class="acc-sep" />
            <button type="button" class="acc-item" :class="{ active: section === 'usage' }" @click="section = 'usage'">
              <svg class="acc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
              Uso
            </button>
            <button type="button" class="acc-item" :class="{ active: section === 'billing' }" @click="section = 'billing'">
              <svg class="acc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Facturación
            </button>
          </nav>

          <div class="acc-main">
            <header class="acc-top">
              <h2 id="acc-dialog-title" class="acc-heading">{{ heading }}</h2>
              <button type="button" class="acc-close" aria-label="Cerrar" @click="emit('close')">×</button>
            </header>
            <div class="acc-scroll">
              <BSAccountSettingsMain
                :section="section"
                :github-oauth-ready="githubOAuthReady"
                :dark="ui.theme === 'dark'"
                @go="onGo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../../store/auth";
import { useUIStore } from "../../store/ui";
import { resolveApiBase } from "../../utils/apiBase";
import BSAccountSettingsMain from "./BSAccountSettingsMain.vue";
import type { AccountSettingsSection } from "./accountSettingsTypes";

const emit = defineEmits<{ close: [] }>();

const auth = useAuthStore();
const ui = useUIStore();
const API = resolveApiBase(import.meta.env.VITE_API_URL);
const section = ref<AccountSettingsSection>("overview");
const githubOAuthReady = ref(true);

const userInitial = computed(() => {
    const n = auth.userName?.trim() || auth.userEmail?.trim() || "?";
    return n.charAt(0).toUpperCase();
});

const planLabel = computed(() => "Community");

const heading = computed(() => {
    const m: Record<AccountSettingsSection, string> = {
        overview: "Resumen",
        preferences: "Preferencias",
        integrations: "Integraciones",
        usage: "Uso",
        billing: "Facturación",
    };
    return m[section.value];
});

function onGo(s: AccountSettingsSection) {
    section.value = s;
}

async function loadOauthReady() {
    try {
        const res = await fetch(`${API}/api/auth/github/oauth-ready`);
        const json = (await res.json()) as { ok?: boolean; data?: { ready?: boolean } };
        githubOAuthReady.value = Boolean(json.ok && json.data?.ready);
    } catch {
        githubOAuthReady.value = false;
    }
}

onMounted(() => {
    void auth.fetchGitHubStatus();
    void loadOauthReady();
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") emit("close");
    };
    window.addEventListener("keydown", onKey);
    onUnmounted(() => window.removeEventListener("keydown", onKey));
});
</script>

<style scoped src="./BSAccountSettingsPanel.css"></style>
