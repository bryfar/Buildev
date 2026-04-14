<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-box share-modal bounce-in">
      <div class="modal-header">
        <h2>Share Project</h2>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="share-section">
          <label class="section-label">Share via link</label>
          <div class="copy-link-box">
            <input type="text" readonly :value="shareUrl" class="link-input" />
            <button class="btn-copy" @click="copyLink">
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <p class="section-hint">Anyone with this link can view and edit the project.</p>
        </div>

        <div class="divider"></div>

        <div class="share-section">
          <p v-if="inviteHint" class="invite-hint">{{ inviteHint }}</p>
          <label class="section-label">Invite by email</label>
          <div class="invite-form">
            <input 
              v-model="email" 
              type="email" 
              placeholder="colleague@example.com" 
              class="email-input"
              @keyup.enter="sendInvite"
            />
            <button class="btn-invite" :disabled="!isValidEmail" @click="sendInvite">
              Invite
            </button>
          </div>
          <div v-if="invites.length" class="invites-list">
            <div v-for="inv in invites" :key="inv.id" class="invite-item">
              <div class="invite-main">
                <span>{{ inv.email }}</span>
                <span class="invite-status">{{ inv.status }}</span>
              </div>
              <div v-if="inv.acceptPath" class="invite-link-row">
                <input type="text" readonly class="invite-link-input" :value="fullInviteUrl(inv.acceptPath)" />
                <button type="button" class="btn-copy-mini" @click="copyInviteLink(inv.acceptPath)">
                  {{ copiedToken === inv.id ? 'Copiado' : 'Copiar enlace' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="presence-list" v-if="multiplayer.remoteCursors">
          <label class="section-label">Active now</label>
          <div class="presence-items">
             <div class="presence-user me">
                <div class="avatar">ME</div>
                <span class="user-name">You (Editor)</span>
             </div>
             <div v-for="(cursor, id) in multiplayer.remoteCursors" :key="id" class="presence-user">
                <div class="avatar" :style="{ backgroundColor: cursor.color }">
                  {{ cursor.userName.charAt(0) }}
                </div>
                <span class="user-name">{{ cursor.userName }}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMultiplayerStore } from '../../store/multiplayer';
import { useAuthStore } from '../../store/auth';
import { usePagesStore } from '../../store/pages';
import { apiBase } from '../../utils/apiBase';
import { readBuildevApiJson } from '../../utils/apiResponse';

const emit = defineEmits(['close']);
const multiplayer = useMultiplayerStore();
const auth = useAuthStore();
const pages = usePagesStore();
const shareUrl = ref(window.location.href);
const email = ref("");
const copied = ref(false);
const inviteHint = ref("");
const invites = ref<
  Array<{ id: string; email: string; invitedAt: string; status: string; acceptPath?: string }>
>([]);
const copiedToken = ref<string | null>(null);

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
});

async function copyLink() {
  await navigator.clipboard.writeText(shareUrl.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

/**
 * URL absoluta del flujo de aceptación de invitación.
 *
 * @param acceptPath Ruta relativa (`/invite?token=…`) devuelta por el API.
 * @returns Origen actual + ruta.
 */
function fullInviteUrl(acceptPath: string): string {
  if (acceptPath.startsWith("http://") || acceptPath.startsWith("https://")) {
    return acceptPath;
  }
  return `${window.location.origin}${acceptPath.startsWith("/") ? "" : "/"}${acceptPath}`;
}

/**
 * Copia al portapapeles el enlace de invitación con token.
 *
 * @param acceptPath Ruta devuelta por el API.
 */
async function copyInviteLink(acceptPath: string): Promise<void> {
  await navigator.clipboard.writeText(fullInviteUrl(acceptPath));
  const inv = invites.value.find((i) => i.acceptPath === acceptPath);
  copiedToken.value = inv?.id ?? "x";
  setTimeout(() => {
    copiedToken.value = null;
  }, 2000);
}

function sendInvite() {
  if (!isValidEmail.value) return;
  void createInvite();
}

async function loadInvites(): Promise<void> {
  if (!pages.currentSiteId || !auth.token) {
    inviteHint.value = "Selecciona un sitio e inicia sesión para gestionar invitados.";
    return;
  }
  const res = await fetch(`${apiBase}/api/sites/${pages.currentSiteId}/collaborators/invites`, {
    headers: auth.authHeaders(),
  });
  const json = await readBuildevApiJson(res);
  if (!json.ok) {
    inviteHint.value = json.error ?? "No se pudieron cargar invitaciones.";
    return;
  }
  const raw = json.data;
  if (Array.isArray(raw)) {
    invites.value = raw
      .map((i) => {
        if (typeof i !== "object" || i === null) return null;
        const item = i as Record<string, unknown>;
        const invitedAt =
          typeof item.invitedAt === "string"
            ? item.invitedAt
            : typeof item.createdAt === "string"
              ? item.createdAt
              : "";
        if (typeof item.email !== "string" || invitedAt.length === 0 || typeof item.status !== "string") {
          return null;
        }
        const id = typeof item.id === "string" ? item.id : `${item.email}-${invitedAt}`;
        return {
          id,
          email: item.email,
          invitedAt,
          status: item.status,
          acceptPath: typeof item.acceptPath === "string" ? item.acceptPath : undefined,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }
}

async function createInvite(): Promise<void> {
  if (!pages.currentSiteId || !auth.token) {
    inviteHint.value = "Inicia sesión y selecciona un sitio para invitar colaboradores.";
    return;
  }
  const res = await fetch(`${apiBase}/api/sites/${pages.currentSiteId}/collaborators/invites`, {
    method: "POST",
    headers: auth.authHeaders(),
    body: JSON.stringify({ email: email.value }),
  });
  const json = await readBuildevApiJson(res);
  if (!json.ok) {
    inviteHint.value = json.error ?? "No se pudo crear la invitación.";
    return;
  }
  inviteHint.value = `Invitación registrada para ${email.value}.`;
  email.value = "";
  await loadInvites();
}

onMounted(() => {
  void loadInvites();
});
</script>

<style scoped>
.modal-backdrop { 
  position: fixed; inset: 0; 
  background: rgba(10, 10, 10, 0.7); 
  backdrop-filter: blur(8px); 
  z-index: 9999; 
  display: flex; align-items: center; justify-content: center; 
}
.share-modal { 
  width: 90%; 
  max-width: 440px; 
  background: rgba(30,30,30,0.8); 
  backdrop-filter: blur(20px);
  border-radius: 24px; 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); 
  border: 1px solid rgba(255,255,255,0.1); 
  overflow: hidden;
}
.modal-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
.modal-header h2 { font-size: 18px; font-weight: 700; color: #fff; }
.btn-close { background: none; border: none; font-size: 24px; color: rgba(255,255,255,0.4); cursor: pointer; }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.section-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px; }

.copy-link-box { 
  display: flex; gap: 8px; 
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 12px; padding: 6px; 
}
.link-input { flex: 1; background: transparent; border: none; color: rgba(255,255,255,0.7); font-size: 13px; padding-left: 12px; outline: none; }
.btn-copy { background: var(--brand-primary); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; }

.section-hint { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; }
.divider { height: 1px; background: rgba(255,255,255,0.05); }

.invite-hint { font-size: 12px; color: #aaa; margin: 0 0 10px; line-height: 1.4; }
.invite-form { display: flex; gap: 8px; }
.invites-list { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.invite-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: #d0d0d0;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.invite-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.invite-link-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.invite-link-input {
  flex: 1;
  min-width: 0;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}
.btn-copy-mini {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.invite-status { text-transform: uppercase; font-size: 10px; color: #9ca3af; }
.email-input { 
  flex: 1; 
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 12px; padding: 12px 16px; 
  font-size: 14px; color: #fff; outline: none; 
}
.email-input:focus { border-color: var(--brand-primary); }
.btn-invite { background: #fff; color: #000; border: none; padding: 0 16px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; }

.presence-list { margin-top: 8px; }
.presence-items { display: flex; flex-direction: column; gap: 14px; margin-top: 12px; }
.presence-user { display: flex; align-items: center; gap: 12px; }
.avatar { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; background: rgba(255,255,255,0.1); }
.user-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); }
.me .avatar { background: var(--brand-primary); box-shadow: 0 0 15px rgba(138, 77, 245, 0.4); }
</style>
