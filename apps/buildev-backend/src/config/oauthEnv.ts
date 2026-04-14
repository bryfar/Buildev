/**
 * Callback de GitHub al vincular la cuenta (ruta front `/github/callback`, scope repo).
 * Prioridad: `GITHUB_OAUTH_CALLBACK_URL` → `PUBLIC_APP_URL` + `/github/callback` → localhost.
 *
 * @returns URI exacta en la misma GitHub OAuth App que el login
 */
export function githubRepoLinkRedirectUri(): string {
    const explicit = (process.env.GITHUB_OAUTH_CALLBACK_URL ?? "").trim();
    if (explicit) return explicit.replace(/\/$/, "");
    const pub = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
    if (pub) return `${pub}/github/callback`;
    return "http://localhost:5173/github/callback";
}

/**
 * Resuelve la URL de callback del login con GitHub.
 * Prioridad: `GITHUB_LOGIN_REDIRECT_URI` → `PUBLIC_APP_URL` + `/auth/github` → localhost (dev).
 *
 * @returns URI exacta que debe coincidir con la GitHub OAuth App
 */
export function githubLoginRedirectUri(): string {
    const explicit = (process.env.GITHUB_LOGIN_REDIRECT_URI ?? "").trim();
    if (explicit) return explicit.replace(/\/$/, "");
    const pub = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
    if (pub) return `${pub}/auth/github`;
    return "http://localhost:5173/auth/github";
}

/**
 * Resuelve la URL de callback del login con Google.
 * Prioridad: `GOOGLE_LOGIN_REDIRECT_URI` → `PUBLIC_APP_URL` + `/auth/google` → localhost (dev).
 *
 * @returns URI autorizada en Google Cloud Console
 */
export function googleLoginRedirectUri(): string {
    const explicit = (process.env.GOOGLE_LOGIN_REDIRECT_URI ?? "").trim();
    if (explicit) return explicit.replace(/\/$/, "");
    const pub = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
    if (pub) return `${pub}/auth/google`;
    return "http://localhost:5173/auth/google";
}
