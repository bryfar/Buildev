import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ["monaco-editor", "@monaco-editor/loader"],
  },
});


