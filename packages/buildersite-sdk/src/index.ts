import type {
  BSPage,
  BSPublication,
  BSApiResponse,
  BSEvent,
  BSEventType,
  BSTargetingRule,
  BuildersiteClientConfig,
} from "@buildersite/domain";


let _config: BuildersiteClientConfig | null = null;

/**
 * Inicializa el SDK con la URL del backend y el API key.
 *
 * @example
 * ```ts
 * import { initBuildersite } from "@buildersite/sdk";
 * initBuildersite({ endpoint: "https://api.miapp.com", apiKey: "pub_xxx" });
 * ```
 */
export function initBuildersite(config: BuildersiteClientConfig): void {
  _config = config;
}

function getConfig(): BuildersiteClientConfig {
  if (!_config) {
    throw new Error(
      "[buildersite-sdk] SDK not initialized. Call initBuildersite() first.",
    );
  }
  return _config;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  params?: Record<string, string>,
  cfg?: BuildersiteClientConfig,
): Promise<BSApiResponse<T>> {
  const config = cfg ?? getConfig();
  const url = new URL(path, config.endpoint);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        "x-buildersite-key": config.apiKey,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return { ok: false, error: String(err), status: 0 };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    return { ok: false, error: text, status: res.status };
  }

  const data = (await res.json()) as T;
  return { ok: true, data };
}

// ─── Tipos de opciones ────────────────────────────────────────────────────────

export interface FetchPageOptions {
  /** URL del path de la página, e.g. "/about" */
  urlPath: string;
  /** Atributos del usuario para targeting/variantes */
  userAttributes?: Record<string, string>;
}

export interface FetchContentOptions {
  /**
   * Nombre del modelo de contenido registrado en el backend,
   * e.g. "page", "blog-post", "product".
   */
  model: string;
  urlPath: string;
  userAttributes?: Record<string, string>;
}

// ─── API pública del SDK ──────────────────────────────────────────────────────

/**
 * Obtiene una página publicada por su URL path.
 * Soporta targeting: pasa `userAttributes` y el backend elegirá la variante
 * más relevante para ese usuario.
 *
 * @example
 * ```ts
 * const result = await fetchPage({ urlPath: "/home" });
 * if (result.ok) {
 *   console.log(result.data.blocks);
 * }
 * ```
 */
export async function fetchPage(
  opts: FetchPageOptions,
  cfg?: BuildersiteClientConfig,
): Promise<BSApiResponse<BSPage>> {
  const params: Record<string, string> = { urlPath: opts.urlPath };
  if (opts.userAttributes) {
    params["userAttributes"] = JSON.stringify(opts.userAttributes);
  }
  return apiFetch<BSPage>("/api/public/page", params, cfg);
}

/**
 * Obtiene cualquier tipo de contenido publicado por modelo y urlPath.
 * Equivalente al `fetchOneEntry` del SDK de Builder.io.
 *
 * @example
 * ```ts
 * const result = await fetchContent({ model: "blog-post", urlPath: "/blog/hello" });
 * ```
 */
export async function fetchContent(
  opts: FetchContentOptions,
  cfg?: BuildersiteClientConfig,
): Promise<BSApiResponse<unknown>> {
  const params: Record<string, string> = { urlPath: opts.urlPath };
  if (opts.userAttributes) {
    params["userAttributes"] = JSON.stringify(opts.userAttributes);
  }
  return apiFetch<unknown>(`/api/content/${opts.model}`, params, cfg);
}

/**
 * Obtiene el historial de publicaciones de una página.
 */
export async function fetchPublications(
  pageId: string,
  cfg?: BuildersiteClientConfig,
): Promise<BSApiResponse<BSPublication[]>> {
  return apiFetch<BSPublication[]>(`/api/public/page/${pageId}/publications`, {}, cfg);
}

/**
 * Envía un evento de analítica (view, click, conversion, custom).
 * Fire-and-forget — los errores se suprimen para no bloquear al usuario.
 *
 * @example
 * ```ts
 * trackEvent({ type: "view", pageId: "home", siteId: "s1", sessionId: "abc" });
 * ```
 */
export function trackEvent(
  payload: {
    type: BSEventType;
    pageId: string;
    siteId: string;
    sessionId: string;
    target?: string;
    metadata?: Record<string, unknown>;
  },
  cfg?: BuildersiteClientConfig,
): void {
  const config = cfg ?? getConfig();
  const url = new URL("/api/public/events", config.endpoint).toString();
  const body: Omit<BSEvent, "id" | "createdAt"> = {
    type: payload.type,
    pageId: payload.pageId,
    siteId: payload.siteId,
    sessionId: payload.sessionId,
    target: payload.target,
    metadata: payload.metadata,
  };

  // Best-effort, no await
  fetch(url, {
    method: "POST",
    headers: {
      "x-buildersite-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    /* suprimir errores de red en tracking */
  });
}

// ─── Evaluador de targeting ───────────────────────────────────────────────────

/**
 * Evalúa si unas reglas de targeting coinciden con los atributos del usuario.
 * Se puede usar en el frontend sin necesidad de un round-trip al servidor.
 */
export function evaluateTargeting(
  rules: BSTargetingRule[],
  userAttributes: Record<string, string>,
): boolean {
  return rules.every((rule) => {
    const value = userAttributes[rule.attribute] ?? "";
    switch (rule.operator) {
      case "equals":
        return value === rule.value;
      case "contains":
        return value.includes(rule.value);
      case "startsWith":
        return value.startsWith(rule.value);
      case "regex":
        return new RegExp(rule.value).test(value);
      default:
        return false;
    }
  });
}

// ─── Re-exportar tipos de domain para acceso desde el SDK ─────────────────────

export type {
  BSPage,
  BSBlock,
  BSComponent,
  BSVariable,
  BSAsset,
  BSContentModel,
  BSVariant,
  BSTargetingRule,
  BSSite,
  BSUser,
  BSRole,
  BSPublication,
  BSEvent,
  BSEventType,
  BSApiResponse,
  BSApiSuccess,
  BSApiError,
  BuildersiteClientConfig as BSClientConfig,
} from "@buildersite/domain";
