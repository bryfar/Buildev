import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../services/db";

const LEGACY_KEY = "workspace_collab_invites";
const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

const LegacyInviteSchema = z.object({
    email: z.string().email(),
    invitedBy: z.string().min(1).default("legacy"),
    invitedAt: z.string().optional(),
    status: z.enum(["pending", "accepted"]).default("pending"),
});

type LegacyInvite = z.infer<typeof LegacyInviteSchema>;

export type MigrateSiteInvitesOptions = {
    dryRun: boolean;
    pruneLegacy: boolean;
};

/**
 * Genera un token opaco para enlaces de invitación.
 *
 * @returns Token URL-safe con alta entropía.
 */
function generateInviteToken(): string {
    return randomBytes(32).toString("base64url");
}

/**
 * Fecha de expiración estándar para invitaciones nuevas.
 *
 * @returns Fecha de caducidad por defecto.
 */
function defaultInviteExpiresAt(): Date {
    return new Date(Date.now() + INVITE_TTL_MS);
}

/**
 * Convierte JSON legado en una lista de invitaciones válidas.
 *
 * @param valueJson Contenido `Variable.valueJson`.
 * @returns Lista normalizada.
 */
function parseLegacyInvites(valueJson: string): LegacyInvite[] {
    try {
        const parsed = JSON.parse(valueJson) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((item) => LegacyInviteSchema.safeParse(item))
            .filter((r): r is { success: true; data: LegacyInvite } => r.success)
            .map((r) => r.data);
    } catch {
        return [];
    }
}

/**
 * Interpreta flags CLI (`--dry-run`, `--prune-legacy`).
 *
 * @param argv Argumentos (p. ej. `process.argv.slice(2)`).
 */
export function parseMigrateSiteInvitesArgs(argv: string[]): MigrateSiteInvitesOptions {
    return {
        dryRun: argv.includes("--dry-run"),
        pruneLegacy: argv.includes("--prune-legacy"),
    };
}

/**
 * Migra invitaciones legacy almacenadas en `Variable` hacia `SiteInvitation`.
 *
 * @param options `dryRun` solo cuenta; `pruneLegacy` elimina filas `Variable` tras escribir.
 * @returns Resumen con contadores para auditoría.
 */
export async function migrateSiteInvitations(options: MigrateSiteInvitesOptions): Promise<{
    sitesScanned: number;
    legacyInvites: number;
    created: number;
    skipped: number;
    prunedVariables: number;
}> {
    const rows = await prisma.variable.findMany({
        where: { key: LEGACY_KEY },
        select: { siteId: true, valueJson: true },
    });

    let legacyInvites = 0;
    let created = 0;
    let skipped = 0;

    for (const row of rows) {
        const invites = parseLegacyInvites(row.valueJson);
        legacyInvites += invites.length;

        for (const invite of invites) {
            const email = invite.email.trim().toLowerCase();
            const already = await prisma.siteInvitation.findFirst({
                where: { siteId: row.siteId, email },
                select: { id: true },
            });
            if (already) {
                skipped += 1;
                continue;
            }

            if (options.dryRun) {
                created += 1;
                continue;
            }

            await prisma.siteInvitation.create({
                data: {
                    siteId: row.siteId,
                    email,
                    invitedBy: invite.invitedBy,
                    status: invite.status,
                    token: generateInviteToken(),
                    expiresAt: invite.status === "pending" ? defaultInviteExpiresAt() : null,
                },
            });
            created += 1;
        }
    }

    let prunedVariables = 0;
    if (options.pruneLegacy && !options.dryRun && rows.length > 0) {
        for (const row of rows) {
            await prisma.variable.delete({
                where: { siteId_key: { siteId: row.siteId, key: LEGACY_KEY } },
            });
            prunedVariables += 1;
        }
    }

    return {
        sitesScanned: rows.length,
        legacyInvites,
        created,
        skipped,
        prunedVariables,
    };
}

async function main(): Promise<void> {
    const opts = parseMigrateSiteInvitesArgs(process.argv.slice(2));
    const result = await migrateSiteInvitations(opts);
    console.info(
        opts.dryRun
            ? "Site invitations migration (dry-run, sin escritura en BD)."
            : "Site invitations migration completed.",
    );
    console.info(JSON.stringify({ ...result, options: opts }, null, 2));
}

void main()
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to migrate invites: ${message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
