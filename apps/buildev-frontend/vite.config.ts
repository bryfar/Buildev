import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

const frontendDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * En builds de producción en Vercel, avisa si falta VITE_API_URL (el front llamará a /api en el dominio
 * del SPA y fallará en runtime). No aborta el build: muchos proyectos despliegan el front antes de tener la URL del API.
 * Con VITE_FAIL_BUILD_WITHOUT_API_URL=1 el build falla de forma estricta (CI o política de equipo).
 *
 * @param mode Modo de Vite
 */
function warnOrFailIfVercelMissingApiUrl(mode: string): void {
  if (mode !== "production" || !process.env.VERCEL) {
    return;
  }
  if ((process.env.VITE_ALLOW_EMPTY_API_URL ?? "").trim() === "1") {
    return;
  }
  const url = (process.env.VITE_API_URL ?? "").trim();
  if (url !== "") {
    return;
  }
  const msg =
    "[Buildev] Falta VITE_API_URL en el proyecto de Vercel (Settings → Environment Variables). " +
    "Sin ella, el SPA usará rutas /api en este dominio y el API no estará disponible. " +
    "Ejemplo: https://tu-api.vercel.app (sin / final). Redespliega tras añadirla.";
  if ((process.env.VITE_FAIL_BUILD_WITHOUT_API_URL ?? "").trim() === "1") {
    throw new Error(msg);
  }
  console.warn(msg);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  warnOrFailIfVercelMissingApiUrl(mode);

  const proxyTarget = (env.VITE_DEV_API_PROXY ?? "http://127.0.0.1:4000").trim().replace(/\/$/, "");

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@buildersite/domain": path.join(
          frontendDir,
          "../../packages/buildersite-domain/src/index.ts",
        ),
        "@buildersite/sdk": path.join(
          frontendDir,
          "../../packages/buildersite-sdk/src/index.ts",
        ),
        "@buildersite/sdk/vue": path.join(
          frontendDir,
          "../../packages/buildersite-sdk/src/vue.ts",
        ),
      },
    },
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
