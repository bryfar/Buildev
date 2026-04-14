import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * En builds de producción en Vercel, exige VITE_API_URL para que el front no llame a /api
 * en el dominio del SPA (donde no existe el Express).
 * Solo lee `process.env` (variables del dashboard en Vercel), no `.env` local, para no falsear el check.
 *
 * @param mode Modo de Vite
 */
function assertVercelProductionApiUrl(mode: string): void {
  if (mode !== "production" || !process.env.VERCEL) {
    return;
  }
  if ((process.env.VITE_ALLOW_EMPTY_API_URL ?? "").trim() === "1") {
    return;
  }
  const url = (process.env.VITE_API_URL ?? "").trim();
  if (url === "") {
    throw new Error(
      "[Buildev] En Vercel hace falta VITE_API_URL: URL pública del backend (sin / final), p. ej. https://tu-api.vercel.app. " +
        "Añádela en el proyecto del front → Settings → Environment Variables y vuelve a desplegar. " +
        "Opcional: VITE_ALLOW_EMPTY_API_URL=1 solo si sabes lo que haces (preview sin API).",
    );
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  assertVercelProductionApiUrl(mode);

  const proxyTarget = (env.VITE_DEV_API_PROXY ?? "http://127.0.0.1:4000").trim().replace(/\/$/, "");

  return {
    plugins: [vue()],
    server: {
      port: 5173,
      /** Evita saltar a 5174 en silencio (las OAuth Apps suelen registrar solo 5173). */
      strictPort: true,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ["monaco-editor", "@monaco-editor/loader"],
    },
  };
});
