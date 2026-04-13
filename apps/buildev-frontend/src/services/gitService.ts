const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** @deprecated Prefer cuenta GitHub vinculada vía OAuth; el PAT es opcional (avanzado). */
export const GITHUB_PAT_STORAGE_KEY = "bs_github_pat";

export interface GitLinkPayload {
    repoFullName: string;
    branch: string;
    exportPath: string;
}

export interface GitStatusData {
    linked: boolean;
    inSync: boolean | null;
    remoteSha: string | null;
    lastKnownSha: string | null;
    repoFullName?: string;
    branch?: string;
    exportPath?: string;
    remoteMissing?: boolean;
}

/**
 * Cabeceras Git: `x-github-token` solo si se pasa un PAT no vacío; si no, el backend usa el token OAuth del usuario.
 */
function headers(
    authHeaders: Record<string, string>,
    siteId: string,
    githubToken?: string,
): Record<string, string> {
    const h: Record<string, string> = {
        ...authHeaders,
        "x-site-id": siteId,
    };
    if (githubToken !== undefined && githubToken.trim().length > 0) {
        h["x-github-token"] = githubToken.trim();
    }
    return h;
}

/**
 * Cliente API para importar repo, sincronizar (pull) y commit/push vía GitHub.
 * @param githubToken - PAT opcional; omitir o cadena vacía para usar cuenta vinculada.
 */
export const gitService = {
    async importRepository(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
        payload: GitLinkPayload & { linkAfterImport?: boolean },
    ): Promise<unknown> {
        const res = await fetch(`${API}/api/git/import`, {
            method: "POST",
            headers: headers(authHeaders, siteId, githubToken),
            body: JSON.stringify({
                siteId,
                repoFullName: payload.repoFullName,
                branch: payload.branch,
                exportPath: payload.exportPath,
                linkAfterImport: payload.linkAfterImport ?? true,
            }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Import failed");
        return json.data;
    },

    async linkRepository(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
        payload: GitLinkPayload,
    ): Promise<unknown> {
        const res = await fetch(`${API}/api/git/link`, {
            method: "POST",
            headers: headers(authHeaders, siteId, githubToken),
            body: JSON.stringify({ siteId, ...payload }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Link failed");
        return json.data;
    },

    async getStatus(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
    ): Promise<GitStatusData> {
        const qs = new URLSearchParams({ siteId });
        const res = await fetch(`${API}/api/git/status?${qs.toString()}`, {
            headers: headers(authHeaders, siteId, githubToken),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Status failed");
        return json.data as GitStatusData;
    },

    async pull(authHeaders: Record<string, string>, siteId: string, githubToken: string | undefined): Promise<unknown> {
        const res = await fetch(`${API}/api/git/pull`, {
            method: "POST",
            headers: headers(authHeaders, siteId, githubToken),
            body: JSON.stringify({ siteId }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Pull failed");
        return json.data;
    },

    async push(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
        message: string,
    ): Promise<unknown> {
        const res = await fetch(`${API}/api/git/push`, {
            method: "POST",
            headers: headers(authHeaders, siteId, githubToken),
            body: JSON.stringify({ siteId, message }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Push failed");
        return json.data;
    },

    async listBranches(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
    ): Promise<string[]> {
        const qs = new URLSearchParams({ siteId });
        const res = await fetch(`${API}/api/git/branches?${qs.toString()}`, {
            headers: headers(authHeaders, siteId, githubToken),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "List branches failed");
        return json.data as string[];
    },

    async createBranch(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
        name: string,
        fromBranch: string,
    ): Promise<unknown> {
        const res = await fetch(`${API}/api/git/branches`, {
            method: "POST",
            headers: headers(authHeaders, siteId, githubToken),
            body: JSON.stringify({ siteId, name, fromBranch }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Create branch failed");
        return json.data;
    },

    async createPullRequest(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
        title: string,
        body: string,
        head: string,
        base: string,
    ): Promise<{ number: number; html_url: string }> {
        const res = await fetch(`${API}/api/git/pull-requests`, {
            method: "POST",
            headers: headers(authHeaders, siteId, githubToken),
            body: JSON.stringify({ siteId, title, body, head, base }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Create PR failed");
        return json.data as { number: number; html_url: string };
    },

    async history(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
        limit: number,
    ): Promise<unknown[]> {
        const qs = new URLSearchParams({ siteId, limit: String(limit) });
        const res = await fetch(`${API}/api/git/history?${qs.toString()}`, {
            headers: headers(authHeaders, siteId, githubToken),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "History failed");
        return json.data as unknown[];
    },

    async restore(
        authHeaders: Record<string, string>,
        siteId: string,
        githubToken: string | undefined,
        activityId: string,
    ): Promise<unknown> {
        const res = await fetch(`${API}/api/git/restore`, {
            method: "POST",
            headers: headers(authHeaders, siteId, githubToken),
            body: JSON.stringify({ siteId, activityId }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Restore failed");
        return json.data;
    },
};
