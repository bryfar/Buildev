import type { Response } from "express";
import type { AuthRequest } from "./auth";

/**
 * Comprueba que la petición tenga un sitio activo (`siteId` no vacío en `req.auth`).
 *
 * @param req Petición autenticada.
 * @param res Respuesta HTTP.
 * @returns `true` si hay sitio activo.
 */
export function requireNonEmptySiteId(req: AuthRequest, res: Response): boolean {
    const sid = req.auth?.siteId?.trim() ?? "";
    if (sid.length > 0) return true;
    res.status(400).json({
        ok: false,
        error: "Crea un proyecto desde el panel o elige uno para continuar.",
    });
    return false;
}
