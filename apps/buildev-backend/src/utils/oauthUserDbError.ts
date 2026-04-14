import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

/**
 * Convierte errores de Prisma / JWT al crear usuario OAuth en respuesta HTTP.
 *
 * @param err Error capturado
 * @returns Código HTTP y mensaje para el cliente
 */
export function oauthUserDbErrorResponse(err: unknown): { status: number; message: string } {
    if (err instanceof jwt.TokenExpiredError) {
        return {
            status: 400,
            message:
                "El enlace de inicio de sesión expiró (máx. 15 min). Vuelve a la página de login e inicia otra vez con GitHub o Google.",
        };
    }
    if (err instanceof jwt.JsonWebTokenError) {
        return {
            status: 400,
            message: "El estado de inicio de sesión no es válido. Abre de nuevo el login e inicia el flujo desde ahí.",
        };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2022") {
        return {
            status: 503,
            message:
                "Faltan columnas en la base (p. ej. githubAccessToken). Ejecuta: yarn workspace @buildersite/backend db:deploy — migración `20260414180000_user_github_columns`.",
        };
    }
    const prismaMsg = err instanceof Error ? err.message : "";
    if (
        prismaMsg.includes("passwordHash") &&
        (prismaMsg.includes("must not be null") ||
            prismaMsg.includes("Argument") ||
            prismaMsg.includes("NOT NULL") ||
            prismaMsg.includes("Null constraint"))
    ) {
        return {
            status: 503,
            message:
                "La base de datos o el cliente Prisma no permiten usuarios solo con OAuth. Aplica migraciones (`yarn workspace @buildersite/backend db:deploy` o `vercel-build` en deploy) y ejecuta `prisma generate`. SQL manual: ALTER TABLE \"User\" ALTER COLUMN \"passwordHash\" DROP NOT NULL;",
        };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2011") {
        const text = `${err.message} ${JSON.stringify(err.meta ?? {})}`;
        if (text.includes("passwordHash")) {
            return {
                status: 503,
                message:
                    "La base de datos aún exige contraseña en todos los usuarios. Ejecuta las migraciones Prisma en el servidor (p. ej. `yarn workspace @buildersite/backend db:deploy`) o aplica en SQL: ALTER TABLE \"User\" ALTER COLUMN \"passwordHash\" DROP NOT NULL;",
            };
        }
    }
    if (
        err instanceof Error &&
        /githubAccessToken|githubUsername|does not exist in the current database/i.test(err.message)
    ) {
        return {
            status: 503,
            message:
                "Faltan columnas GitHub en la tabla User. Ejecuta `yarn workspace @buildersite/backend db:deploy` (migración `20260414180000_user_github_columns`) o el SQL en `.env.example`.",
        };
    }
    if (err instanceof Error && /passwordHash|NOT NULL|null value.*passwordHash/i.test(err.message)) {
        return {
            status: 503,
            message:
                "La columna passwordHash no admite usuarios solo OAuth. Aplica la migración `20260413120000_oauth_optional_password` (o el SQL equivalente) y redeploy.",
        };
    }
    return { status: 400, message: err instanceof Error ? err.message : "OAuth fallido" };
}
