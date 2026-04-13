import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

/**
 * Config en la raíz para que `vite build` ejecutado desde el repo (p. ej. Vercel con detección automática)
 * use el mismo `index.html` que el paquete `apps/buildev-frontend`.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "apps", "buildev-frontend");

export default defineConfig({
  root: appRoot,
  plugins: [vue()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ["monaco-editor", "@monaco-editor/loader"],
  },
});
