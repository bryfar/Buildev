/** GitHub REST helpers for contents API (import / push). */

export function encodeGithubPath(path: string): string {
    return path
        .split("/")
        .filter((segment) => segment.length > 0)
        .map(encodeURIComponent)
        .join("/");
}

interface GithubFileResponse {
    sha?: string;
    content?: string;
    encoding?: string;
    message?: string;
}

interface GithubRefResponse {
    ref?: string;
    object?: { sha?: string };
    message?: string;
}

interface GithubCommitResponse {
    sha?: string;
    message?: string;
}

/**
 * @returns File SHA and decoded JSON text, or null if 404.
 */
export async function githubGetFile(
    repoFullName: string,
    filePath: string,
    ref: string,
    token: string,
): Promise<{ sha: string; rawJson: string } | null> {
    const url = `https://api.github.com/repos/${repoFullName}/contents/${encodeGithubPath(filePath)}?ref=${encodeURIComponent(ref)}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    if (res.status === 404) return null;
    const data = (await res.json()) as GithubFileResponse;
    if (!res.ok) {
        throw new Error(data.message ?? `GitHub API error ${res.status}`);
    }
    if (!data.content || data.encoding !== "base64" || !data.sha) {
        throw new Error("Unexpected GitHub contents response");
    }
    const rawJson = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
    return { sha: data.sha, rawJson };
}

/**
 * Creates or updates a single file (commit on branch).
 */
export async function githubPutFile(
    repoFullName: string,
    filePath: string,
    message: string,
    contentObject: unknown,
    token: string,
    branch: string,
    previousSha: string | undefined,
): Promise<{ sha: string }> {
    const body: Record<string, string> = {
        message,
        content: Buffer.from(JSON.stringify(contentObject, null, 2), "utf8").toString("base64"),
        branch,
    };
    if (previousSha) {
        body.sha = previousSha;
    }
    const url = `https://api.github.com/repos/${repoFullName}/contents/${encodeGithubPath(filePath)}`;
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const data = (await res.json()) as { content?: { sha?: string }; message?: string };
    if (!res.ok) {
        throw new Error(data.message ?? `GitHub PUT failed (${res.status})`);
    }
    const sha = data.content?.sha;
    if (!sha) throw new Error("GitHub did not return file sha");
    return { sha };
}

/**
 * Lists branches for a repository.
 */
export async function githubListBranches(repoFullName: string, token: string): Promise<Array<{ name: string }>> {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/branches?per_page=100`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    const data = (await res.json()) as Array<{ name: string }> & { message?: string };
    if (!res.ok) {
        const msg = (data as unknown as { message?: string }).message;
        throw new Error(msg ?? `GitHub list branches failed (${res.status})`);
    }
    return data;
}

/**
 * Gets the SHA for a branch head.
 */
export async function githubGetBranchHeadSha(repoFullName: string, branch: string, token: string): Promise<string> {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/git/ref/heads/${encodeURIComponent(branch)}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    const data = (await res.json()) as GithubRefResponse;
    if (!res.ok) {
        throw new Error(data.message ?? `GitHub get ref failed (${res.status})`);
    }
    const sha = data.object?.sha;
    if (!sha) throw new Error("GitHub ref missing SHA");
    return sha;
}

/**
 * Creates a new branch from a base SHA.
 */
export async function githubCreateBranch(repoFullName: string, newBranch: string, baseSha: string, token: string): Promise<{ ref: string; sha: string }> {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/git/refs`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ref: `refs/heads/${newBranch}`,
            sha: baseSha,
        }),
    });
    const data = (await res.json()) as GithubRefResponse;
    if (!res.ok) {
        throw new Error(data.message ?? `GitHub create branch failed (${res.status})`);
    }
    const ref = data.ref;
    const sha = data.object?.sha ?? baseSha;
    if (!ref) throw new Error("GitHub create branch missing ref");
    return { ref, sha };
}

/**
 * Creates a pull request.
 */
export async function githubCreatePullRequest(
    repoFullName: string,
    title: string,
    body: string,
    head: string,
    base: string,
    token: string,
): Promise<{ number: number; html_url: string }> {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/pulls`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body, head, base }),
    });
    const data = (await res.json()) as { number?: number; html_url?: string; message?: string };
    if (!res.ok) {
        throw new Error(data.message ?? `GitHub create PR failed (${res.status})`);
    }
    if (!data.number || !data.html_url) throw new Error("GitHub PR response missing fields");
    return { number: data.number, html_url: data.html_url };
}

/**
 * Gets a file's raw JSON (contents API) and sha at a given ref.
 */
export async function githubGetJsonText(repoFullName: string, filePath: string, ref: string, token: string): Promise<{ sha: string; rawJson: string } | null> {
    return githubGetFile(repoFullName, filePath, ref, token);
}
