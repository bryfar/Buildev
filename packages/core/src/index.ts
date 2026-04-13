// ─── Primitivos ───────────────────────────────────────────────────────────────

export type BSId = string;

export * from "./ast/schema";

export type PublicationStatus = "draft" | "published" | "archived";

export type ScalarFieldType =
  | "string"
  | "number"
  | "boolean"
  | "richtext"
  | "date"
  | "reference"
  | "array"
  | "object"
  | "asset";

// ─── Bloques ──────────────────────────────────────────────────────────────────

/** Un bloque es la unidad mínima de contenido visual (texto, imagen, sección…). */
export interface BSBlock {
  id: BSId;
  type: string; // "text" | "image" | "button" | "section" | ...
  props: Record<string, unknown>;
  styles?: Record<string, string>; // CSS-in-object (camelCase)
  children?: BSBlock[];
}

// ─── Componentes ──────────────────────────────────────────────────────────────

/**
 * Un componente reutilizable es un bloque con un nombre propio
 * que puede usarse en múltiples páginas.
 */
export interface BSComponent {
  id: BSId;
  siteId: BSId;
  name: string;
  description?: string;
  rootBlock: BSBlock;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// ─── Variables ────────────────────────────────────────────────────────────────

export interface BSVariable {
  id: BSId;
  siteId: BSId;
  key: string;
  value: unknown;
  type: ScalarFieldType;
  description?: string;
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export type AssetMimeType =
  | "image/png"
  | "image/jpeg"
  | "image/svg+xml"
  | "image/webp"
  | "video/mp4"
  | "application/pdf"
  | string;

export interface BSAsset {
  id: BSId;
  siteId: BSId;
  name: string;
  url: string;
  mimeType: AssetMimeType;
  sizeBytes: number;
  width?: number;
  height?: number;
  createdAt: string;
}

// ─── Modelo de Contenido (inspirado en Builder.io) ───────────────────────────

export interface BSFieldDefinition {
  name: string;
  type: ScalarFieldType;
  required?: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface BSContentModel {
  id: BSId;
  siteId: BSId;
  name: string; // e.g. "page", "blog-post", "product"
  displayName: string;
  fields: BSFieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

// ─── Variante / Targeting ────────────────────────────────────────────────────

export interface BSVariant {
  id: BSId;
  name: string;
  targeting?: BSTargetingRule[];
  weight?: number; // 0-100 (for A/B testing)
  rootBlock: BSBlock;
}

export interface BSTargetingRule {
  attribute: string; // e.g. "urlPath", "country", "userRole"
  operator: "equals" | "contains" | "startsWith" | "regex";
  value: string;
}

// ─── Páginas ──────────────────────────────────────────────────────────────────

export interface BSPage {
  id: BSId;
  siteId: BSId;
  name: string;
  urlPath: string; // e.g. "/about", "/blog/hello-world"
  title?: string; // <title> SEO
  description?: string; // <meta name="description">
  status: PublicationStatus;
  blocks: BSBlock[];
  script?: string; // JavaScript block for page-level logic
  variants?: BSVariant[]; // soporte A/B testing
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Sitio ────────────────────────────────────────────────────────────────────

export interface BSSite {
  id: BSId;
  name: string;
  domain?: string;
  defaultLocale: string; // e.g. "es", "en"
  createdAt: string;
  updatedAt: string;
}

// ─── Usuarios y Roles ─────────────────────────────────────────────────────────

export type BSRole = "admin" | "editor" | "viewer";

export interface BSUser {
  id: BSId;
  email: string;
  name: string;
  role: BSRole;
  siteId: BSId;
  createdAt: string;
}

// ─── Publicación ─────────────────────────────────────────────────────────────

export interface BSPublication {
  id: BSId;
  pageId: BSId;
  siteId: BSId;
  publishedBy: BSId; // userId
  snapshot: BSPage; // copia inmutable del estado en el momento de publicación
  publishedAt: string;
}

// ─── Analíticas ───────────────────────────────────────────────────────────────

export type BSEventType = "view" | "click" | "conversion" | "custom";

export interface BSEvent {
  id: BSId;
  siteId: BSId;
  pageId: BSId;
  type: BSEventType;
  target?: string; // selector CSS o nombre del elemento
  metadata?: Record<string, unknown>;
  sessionId: string;
  createdAt: string;
}

// ─── Configuración del cliente ─────────────────────────────────────────────────

export interface BuildersiteClientConfig {
  /** URL base del backend Buildersite (sin barra final). */
  endpoint: string;
  /** API Key pública del sitio (para acceso de lectura headless). */
  apiKey: string;
}

// ─── Tipos de respuesta de API ────────────────────────────────────────────────

export interface BSApiSuccess<T> {
  ok: true;
  data: T;
}

export interface BSApiError {
  ok: false;
  error: string;
  status: number;
}

export type BSApiResponse<T> = BSApiSuccess<T> | BSApiError;
