/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL pública del API en producción (obligatoria en build de Vercel salvo VITE_ALLOW_EMPTY_API_URL). */
  readonly VITE_API_URL?: string;
  /** Proxy de Vite en desarrollo (por defecto 127.0.0.1:4000). */
  readonly VITE_DEV_API_PROXY?: string;
  /** Si es "1", el build en Vercel no exige VITE_API_URL (solo casos excepcionales). */
  readonly VITE_ALLOW_EMPTY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
