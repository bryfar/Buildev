/**
 * Parsea JSON de respuestas API Buildev habituales `{ ok, error?, data? }`.
 *
 * @param res Respuesta `fetch`
 * @returns Objeto tipado de forma segura
 */
export async function readBuildevApiJson(res: Response): Promise<{
  ok: boolean;
  error?: string;
  data: unknown;
}> {
  const raw = (await res.json()) as Record<string, unknown>;
  return {
    ok: raw.ok === true,
    error: typeof raw.error === "string" ? raw.error : undefined,
    data: Object.prototype.hasOwnProperty.call(raw, "data") ? raw.data : undefined,
  };
}

/**
 * Mensaje de error legible desde un `Error` o valor desconocido.
 *
 * @param err Valor capturado en `catch`
 * @returns Texto para mostrar al usuario
 */
export function formatUnknownError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
