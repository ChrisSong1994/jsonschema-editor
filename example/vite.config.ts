import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  // ── Demo / playground app ──
  plugins: [vue()],
  root: "./",
  base: process.env.PUBLIC_BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      // The library source lives one level up; keep `@` pointing at it
      "@": resolve(__dirname, "../src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  define: {
    __BASE_PATH__: JSON.stringify(process.env.PUBLIC_BASE_PATH || "/"),
  },
});
