/**
 * Extrae `owner/repo` desde una URL de GitHub, SSH o forma corta `owner/repo`.
 * @param input - URL (https o git@) o `owner/repo`
 * @returns `owner/repo` normalizado o null
 */
export function parseGithubRepoUrl(input: string): string | null {
    const raw = input.trim();
    if (!raw) {
        return null;
    }
    const short = raw.replace(/\.git$/i, "");
    if (/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(short) && !short.includes("://") && !short.includes("@")) {
        return short;
    }
    const sshOrScp = short.match(/github\.com[:/]([a-z0-9_.-]+)\/([a-z0-9_.-]+)/i);
    if (sshOrScp) {
        return `${sshOrScp[1]}/${sshOrScp[2]}`;
    }
    try {
        const href = short.includes("://") ? short : `https://${short}`;
        const u = new URL(href);
        if (!u.hostname.toLowerCase().endsWith("github.com")) {
            return null;
        }
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length < 2) {
            return null;
        }
        return `${parts[0]}/${parts[1]}`;
    } catch {
        return null;
    }
}
