import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { resolveApiBase } from "../utils/apiBase";

const API = resolveApiBase(import.meta.env.VITE_API_URL);

function readApiError(error: unknown): string {
    if (typeof error === "string") return error;
    return "Solicitud no válida";
}

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("bs_token"));
    const userId = ref<string | null>(localStorage.getItem("bs_userId"));
    const siteId = ref<string | null>(localStorage.getItem("bs_siteId"));
    const role = ref<string | null>(localStorage.getItem("bs_role"));
    const userName = ref<string | null>(null);
    const userEmail = ref<string | null>(null);
    const githubLinked = ref(false);
    const githubUsername = ref<string | null>(null);

    const isAuthenticated = computed(() => !!token.value);

    async function fetchGitHubStatus(): Promise<void> {
        if (!token.value) {
            userName.value = null;
            userEmail.value = null;
            githubLinked.value = false;
            githubUsername.value = null;
            return;
        }
        try {
            const res = await fetch(`${API}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token.value}` },
            });
            const json = (await res.json()) as {
                ok?: boolean;
                data?: {
                    name?: string;
                    email?: string;
                    githubLinked?: boolean;
                    githubUsername?: string | null;
                };
            };
            if (json.ok && json.data) {
                userName.value = typeof json.data.name === "string" ? json.data.name : null;
                userEmail.value = typeof json.data.email === "string" ? json.data.email : null;
                githubLinked.value = Boolean(json.data.githubLinked);
                githubUsername.value =
                    typeof json.data.githubUsername === "string" ? json.data.githubUsername : null;
            }
        } catch {
            githubLinked.value = false;
        }
    }

    /**
     * Redirige a GitHub para OAuth (scope repo). Requiere sesión Buildev.
     */
    async function startGitHubOAuth(): Promise<void> {
        if (!token.value) {
            throw new Error("Inicia sesión en Buildev primero.");
        }
        const res = await fetch(`${API}/api/auth/github/authorize-url`, {
            headers: { Authorization: `Bearer ${token.value}` },
        });
        let json: { ok?: boolean; data?: { url?: string }; error?: string } = {};
        try {
            json = (await res.json()) as typeof json;
        } catch {
            throw new Error("El servidor no devolvió JSON válido. Comprueba VITE_API_URL y que el API esté en marcha.");
        }
        if (!json.ok || !json.data?.url) {
            const detail =
                typeof json.error === "string"
                    ? json.error
                    : `HTTP ${res.status}. Revisa GITHUB_CLIENT_ID y GITHUB_OAUTH_CALLBACK_URL en el backend.`;
            throw new Error(detail);
        }
        window.location.assign(json.data.url);
    }

    function setGitHubLinked(linked: boolean, username: string | null = null): void {
        githubLinked.value = linked;
        githubUsername.value = username;
    }

    async function login(email: string, password: string) {
        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const json = (await res.json()) as { ok?: boolean; error?: unknown };
        if (!json.ok) throw new Error(readApiError(json.error));
        _persist(json.data);
        await fetchGitHubStatus();
    }

    async function register(name: string, email: string, password: string, siteName: string) {
        const res = await fetch(`${API}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, siteName }),
        });
        const json = (await res.json()) as { ok?: boolean; error?: unknown };
        if (!json.ok) throw new Error(readApiError(json.error));
        _persist(json.data);
        await fetchGitHubStatus();
    }

    function logout() {
        token.value = null;
        userId.value = null;
        siteId.value = null;
        role.value = null;
        githubLinked.value = false;
        githubUsername.value = null;
        userName.value = null;
        userEmail.value = null;
        localStorage.removeItem("bs_token");
        localStorage.removeItem("bs_userId");
        localStorage.removeItem("bs_siteId");
        localStorage.removeItem("bs_role");
    }

    function _persist(data: { token: string; userId: string; siteId: string; role?: string }) {
        token.value = data.token;
        userId.value = data.userId;
        siteId.value = data.siteId;
        role.value = data.role ?? "editor";
        localStorage.setItem("bs_token", data.token);
        localStorage.setItem("bs_userId", data.userId);
        localStorage.setItem("bs_siteId", data.siteId);
        localStorage.setItem("bs_role", data.role ?? "editor");
    }

    /**
     * Guarda sesión tras OAuth (Google/GitHub) en la página de callback.
     *
     * @param data Token y metadatos del API
     */
    function persistSession(data: { token: string; userId: string; siteId: string; role?: string }): void {
        _persist(data);
    }

    async function startGitHubLogin(): Promise<void> {
        const res = await fetch(`${API}/api/auth/login/github/url`);
        let json: { ok?: boolean; data?: { url?: string }; error?: string } = {};
        try {
            json = (await res.json()) as typeof json;
        } catch {
            throw new Error("Respuesta inválida del servidor.");
        }
        if (!json.ok || !json.data?.url) {
            const detail =
                typeof json.error === "string"
                    ? json.error
                    : `HTTP ${res.status}. En el API: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET y GITHUB_LOGIN_REDIRECT_URI o PUBLIC_APP_URL (misma URL que en la GitHub OAuth App).`;
            throw new Error(detail);
        }
        window.location.assign(json.data.url);
    }

    async function startGoogleLogin(): Promise<void> {
        const res = await fetch(`${API}/api/auth/login/google/url`);
        let json: { ok?: boolean; data?: { url?: string }; error?: string } = {};
        try {
            json = (await res.json()) as typeof json;
        } catch {
            throw new Error("Respuesta inválida del servidor.");
        }
        if (!json.ok || !json.data?.url) {
            const detail =
                typeof json.error === "string"
                    ? json.error
                    : `HTTP ${res.status}. Configura GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET y en Google Cloud Console la URI de redirección autorizada (GOOGLE_LOGIN_REDIRECT_URI, p. ej. …/auth/google).`;
            throw new Error(detail);
        }
        window.location.assign(json.data.url);
    }

    function authHeaders(): Record<string, string> {
        return { Authorization: `Bearer ${token.value}`, "Content-Type": "application/json" };
    }

    void fetchGitHubStatus();

    return {
        token,
        userId,
        siteId,
        role,
        userName,
        userEmail,
        githubLinked,
        githubUsername,
        isAuthenticated,
        login,
        register,
        logout,
        authHeaders,
        fetchGitHubStatus,
        startGitHubOAuth,
        startGitHubLogin,
        startGoogleLogin,
        persistSession,
        setGitHubLinked,
    };
});
