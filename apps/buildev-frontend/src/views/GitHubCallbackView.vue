<template>
  <div class="callback-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Connecting to GitHub...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <div class="error-icon">×</div>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn-retry">Try Again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const code = route.query.code as string;
  if (!code) {
    error.value = "Authorization code missing from GitHub";
    loading.value = false;
    return;
  }

  try {
    const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${API}/api/auth/github/callback?code=${code}`);
    const json = await res.json();

    if (!json.ok) throw new Error(json.error ?? "Failed to link account");

    // Persist the github data in our store
    auth.connectGitHub(json.data);

    // Redirect to studio
    router.push("/ai-studio");
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

function goBack() {
  router.push("/ai-studio");
}
</script>

<style scoped>
.callback-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f1117;
  color: white;
  font-family: sans-serif;
}

.loading-state, .error-state {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #ef4444;
  color: white;
  font-size: 32px;
  line-height: 60px;
  border-radius: 50%;
  margin: 0 auto 16px;
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background: #6366f1;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
</style>
