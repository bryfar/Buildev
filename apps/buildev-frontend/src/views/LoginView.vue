<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">
        <span class="logo-icon">⬡</span>
        <span class="logo-name">Buildev</span>
      </div>
      <h1>{{ isRegister ? "Create account" : "Sign in" }}</h1>

      <form @submit.prevent="submit">
        <template v-if="isRegister">
          <label>Name<input v-model="form.name" type="text" required placeholder="Your name" /></label>
          <label>Site name<input v-model="form.siteName" type="text" required placeholder="My awesome site" /></label>
        </template>
        <label>Email<input v-model="form.email" type="email" required placeholder="you@example.com" /></label>
        <label>Password<input v-model="form.password" type="password" required placeholder="••••••••" /></label>

        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? "Loading…" : isRegister ? "Create account" : "Sign in" }}
        </button>
      </form>

      <p class="toggle">
        {{ isRegister ? "Already have an account?" : "Don't have an account?" }}
        <button class="link-btn" @click="isRegister = !isRegister">
          {{ isRegister ? "Sign in" : "Create one" }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const auth = useAuthStore();
const router = useRouter();
const isRegister = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const form = ref({ name: "", email: "", password: "", siteName: "" });

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    if (isRegister.value) {
      await auth.register(form.value.name, form.value.email, form.value.password, form.value.siteName);
    } else {
      await auth.login(form.value.email, form.value.password);
    }
    router.push("/");
  } catch (e: any) {
    error.value = e.message ?? "Something went wrong";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f1117; }
.login-card { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; }
.logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
.logo-icon { font-size: 28px; }
.logo-name { font-size: 22px; font-weight: 700; color: #e2e8f0; }
h1 { font-size: 20px; font-weight: 600; color: #e2e8f0; margin-bottom: 24px; }
form { display: flex; flex-direction: column; gap: 16px; }
label { display: flex; flex-direction: column; gap: 6px; color: #94a3b8; font-size: 13px; }
input { background: #0f1117; border: 1px solid #2a2d3a; border-radius: 8px; padding: 10px 14px; color: #e2e8f0; font-size: 14px; outline: none; }
input:focus { border-color: #6366f1; }
button[type="submit"] { background: #6366f1; color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 4px; }
button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #f87171; font-size: 13px; }
.toggle { color: #64748b; font-size: 13px; margin-top: 20px; text-align: center; }
.link-btn { background: none; border: none; color: #6366f1; cursor: pointer; font-size: 13px; text-decoration: underline; padding: 0; }
</style>
