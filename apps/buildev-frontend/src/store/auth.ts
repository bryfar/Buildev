import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { BSUser } from "@buildersite/sdk";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("bs_token"));
    const userId = ref<string | null>(localStorage.getItem("bs_userId"));
    const siteId = ref<string | null>(localStorage.getItem("bs_siteId"));
    const role = ref<string | null>(localStorage.getItem("bs_role"));

    const isAuthenticated = computed(() => !!token.value);

    async function login(email: string, password: string) {
        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Login failed");
        _persist(json.data);
    }

    async function register(name: string, email: string, password: string, siteName: string) {
        const res = await fetch(`${API}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, siteName }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Registration failed");
        _persist(json.data);
    }

    function logout() {
        token.value = null; userId.value = null; siteId.value = null; role.value = null;
        localStorage.removeItem("bs_token");
        localStorage.removeItem("bs_userId");
        localStorage.removeItem("bs_siteId");
        localStorage.removeItem("bs_role");
    }

    function _persist(data: { token: string; userId: string; siteId: string; role?: string }) {
        token.value = data.token; userId.value = data.userId;
        siteId.value = data.siteId; role.value = data.role ?? "editor";
        localStorage.setItem("bs_token", data.token);
        localStorage.setItem("bs_userId", data.userId);
        localStorage.setItem("bs_siteId", data.siteId);
        localStorage.setItem("bs_role", data.role ?? "editor");
    }

    function authHeaders(): Record<string, string> {
        return { Authorization: `Bearer ${token.value}`, "Content-Type": "application/json" };
    }

    return { token, userId, siteId, role, isAuthenticated, login, register, logout, authHeaders };
});
