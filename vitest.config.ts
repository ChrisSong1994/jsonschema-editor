import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.spec.ts"],
    globals: true,
    // Element Plus style entry points import raw .css files, which the
    // Node ESM loader cannot handle — inline them so Vite strips the CSS.
    server: {
      deps: {
        inline: [/element-plus/],
      },
    },
  },
});
