/**
 * Validaciones de seguridad cuando el API corre en Vercel (u otro entorno con `VERCEL=1`).
 * Evita despliegues con JWT por defecto o bypass de auth activo.
 */

const WEAK_JWT_SECRETS = new Set([
    "",
    "buildersite_dev_secret",
    "change_me_in_production",
    "changeme",
    "placeholder",
]);

const MIN_JWT_SECRET_LEN = 16;

/**
 * Lanza si la configuración es insegura para producción serverless.
 *
 * @throws Error si `VERCEL` está definido y JWT o bypass son inválidos
 */
export function assertProductionSafeOrThrow(): void {
    if (!process.env.VERCEL) {
        return;
    }
    const jwt = (process.env.JWT_SECRET ?? "").trim();
    const jwtNorm = jwt.toLowerCase();
    if (WEAK_JWT_SECRETS.has(jwtNorm) || jwt.length < MIN_JWT_SECRET_LEN) {
        throw new Error(
            "[Buildev API] En Vercel define JWT_SECRET (≥16 caracteres, aleatorio). " +
                "Sin ello, OAuth (state) y sesiones no son seguros.",
        );
    }
    const bypass = (process.env.AUTH_DEV_BYPASS ?? "").trim().toLowerCase();
    if (bypass === "true" || bypass === "1") {
        throw new Error(
            "[Buildev API] AUTH_DEV_BYPASS no puede estar activo en Vercel. Quita la variable o ponla en false.",
        );
    }
}
