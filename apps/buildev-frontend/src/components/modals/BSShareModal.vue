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
import { ref, computed } from 'vue';
import { useMultiplayerStore } from '../../store/multiplayer';

const emit = defineEmits(['close']);
const multiplayer = useMultiplayerStore();
const shareUrl = ref(window.location.href);
const email = ref("");
const copied = ref(false);

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
});

async function copyLink() {
  await navigator.clipboard.writeText(shareUrl.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function sendInvite() {
  if (!isValidEmail.value) return;
  alert(`Invitation sent to ${email.value}`);
  email.value = "";
}
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

.invite-form { display: flex; gap: 8px; }
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
