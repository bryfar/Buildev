import { prisma } from "./db";

/**
 * Sitio activo para la sesión: `User.siteId` si existe, si no el último sitio
 * propio (`Site.userId`). Si no hay ninguno, cadena vacía (usuario sin proyectos).
 *
 * @param userId Identificador del usuario.
 * @returns UUID del sitio o `""`.
 */
export async function resolveSessionSiteId(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { siteId: true },
    });
    if (user?.siteId) return user.siteId;
    const first = await prisma.site.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
    });
    return first?.id ?? "";
}
