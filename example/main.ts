// ── Monaco Editor worker configuration (Vite) ──
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

(self as unknown as Record<string, unknown>).MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "json") return new JsonWorker();
    return new EditorWorker();
  },
};

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./index.css";

declare const __BASE_PATH__: string;

const router = createRouter({
  history: createWebHistory(__BASE_PATH__),
  routes: [
    {
      path: "/",
      component: () => import("./pages/Index.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("./pages/NotFound.vue"),
    },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
