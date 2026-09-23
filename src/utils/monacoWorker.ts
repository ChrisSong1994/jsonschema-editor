import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

let initialized = false;

/**
 * 一次性初始化 Monaco Editor 的 Web Worker 环境（幂等）。
 *
 * 所有使用 Monaco 的编辑器组件挂载时应调用本函数，避免各组件重复编写
 * MonacoEnvironment 配置块，也避免「依赖其它组件先加载才初始化 worker」
 * 的隐式顺序问题。
 */
export function initMonacoWorker() {
  if (initialized || typeof self === "undefined") return;
  initialized = true;
  (
    self as unknown as {
      MonacoEnvironment: {
        getWorker: (workerId: string, label: string) => unknown;
      };
    }
  ).MonacoEnvironment = {
    getWorker(_: string, label: string) {
      switch (label) {
        // JSON 语言服务（补全/校验/格式化/文档符号等）
        case "json":
          return new jsonWorker();
        // HTML 语言服务（补全/高亮/文档符号等）
        case "html":
        case "handlebars":
        case "razor":
          return new htmlWorker();
        // CSS 语言服务
        case "css":
        case "scss":
        case "less":
          return new cssWorker();
        // TypeScript / JavaScript 语言服务
        case "typescript":
        case "javascript":
          return new tsWorker();
        // 其余（plaintext / sql / 自定义 expression 等）只用基础编辑器能力
        default:
          return new editorWorker();
      }
    },
  };
}
