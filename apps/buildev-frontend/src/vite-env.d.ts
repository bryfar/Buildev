/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL pública del API en producción (obligatoria en build de Vercel salvo VITE_ALLOW_EMPTY_API_URL). */
  readonly VITE_API_URL?: string;
  /** Proxy de Vite en desarrollo (por defecto 127.0.0.1:4000). */
  readonly VITE_DEV_API_PROXY?: string;
  /** Si es "1", el build en Vercel no avisa si falta VITE_API_URL. */
  readonly VITE_ALLOW_EMPTY_API_URL?: string;
  /** Si es "1", el build en Vercel falla si falta VITE_API_URL. */
  readonly VITE_FAIL_BUILD_WITHOUT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
