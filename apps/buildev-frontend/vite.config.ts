import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
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
