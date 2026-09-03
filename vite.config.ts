import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const isDemo = process.env.BUILD_MODE === "demo";

const isExternalModule = (id: string): boolean =>
  [
    "vue",
    "monaco-editor",
    "element-plus",
    /^monaco-editor\//,
  ].some((entry) =>
    typeof entry === "string" ? entry === id : entry.test(id),
  ) ||
  // Element Plus JS modules stay external, but style entry points are
  // bundled so EP component CSS lands in dist/index.css
  (/^element-plus\//.test(id) &&
    !/\/style\//.test(id) &&
    !/theme-chalk/.test(id));

export default defineConfig(
  isDemo
    ? {
        // ── Demo / playground app ──
        plugins: [vue()],
        root: ".",
        base: process.env.PUBLIC_BASE_PATH || "/",
        server: {
          host: "::",
          port: 8080,
        },
        resolve: {
          alias: {
            "@": resolve(__dirname, "./src"),
          },
        },
        build: {
          outDir: "dist-demo",
          emptyOutDir: true,
        },
        define: {
          __BASE_PATH__: JSON.stringify(process.env.PUBLIC_BASE_PATH || "/"),
        },
      }
    : {
        // ── Library build ──
        plugins: [
          vue(),
          dts({
            tsconfigPath: "./src/tsconfig.json",
            rollupTypes: true,
          }),
        ],
        resolve: {
          alias: {
            "@": resolve(__dirname, "./src"),
          },
        },
        build: {
          lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
          },
          rollupOptions: {
            external: (id: string) => isExternalModule(id),
          },
          cssCodeSplit: false,
          copyPublicDir: false,
        },
      },
);
