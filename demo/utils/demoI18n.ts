import { computed, ref } from "vue";

export type DemoLocale = "en" | "zh";

const en = {
  heroSubtitle: "Interactive JSON Schema editor components for Vue 3",

  basic: "Basic",
  visualOnly: "Visual Only",
  readOnly: "Read-Only",
  noFullscreen: "No Fullscreen",
  sync: "Textbox Sync",
  popup: "Popup",
  inline: "Inline",
  utility: "Utility",
  localization: "Localization",
  theming: "Theming",

  props: "Props",
  events: "Events",
  name: "Name",
  type: "Type",
  default: "Default",
  description: "Description",
  payload: "Payload",

  editorDesc:
    "Full-featured visual JSON Schema builder with an optional live JSON code view. Supports nested objects, arrays, all draft-07 types, and validation constraints.",
  editorPropSchema: "The JSON schema to edit (v-model compatible).",
  editorPropReadOnly: "Disable all editing controls.",
  editorPropShowJson: "Show the Monaco JSON editor panel.",
  editorPropShowFullscreen: "Show the fullscreen toggle button.",
  editorEventUpdateSchema: "Emitted on every schema change.",

  inferDesc:
    "Generates a JSON Schema from a sample JSON document. Works as a popup dialog or inline, and is fully decoupled from the editor — you choose how to consume the result.",
  inferPropVisible: "Dialog visibility. Omit for inline mode.",
  inferEventUpdateVisible: "Dialog open/close.",
  inferEventSchemaInferred: "The inferred schema.",

  validatorDesc:
    "Validates a JSON document against any schema with real-time inline error display. Also available as a pure utility function for headless use.",
  validatorPropSchema: "Schema to validate against.",
  validatorPropVisible: "Omit for inline mode.",
  validatorEventUpdateVisible: "Dialog open/close.",

  basicTitle: "Basic Usage",
  basicDesc:
    "The default configuration with both visual and JSON editor panels.",
  visualOnlyTitle: "Visual Only",
  visualOnlyDesc:
    "Hide the JSON code panel — ideal for end-users who only need the visual builder.",
  readOnlyTitle: "Read-Only",
  readOnlyDesc: "Display a schema without allowing modifications.",
  noFullscreenTitle: "No Fullscreen Toggle",
  noFullscreenDesc: "Hide the fullscreen button for embedded layouts.",
  syncTitle: "Textbox Sync",
  syncDescA: "A plain textarea mirrors every schema change via the",
  syncDescB: "event.",
  popupTitle: "Popup Mode",
  inferPopupDesc:
    "Open as a dialog, paste JSON, and get a schema back. The inferred schema feeds a separate read-only editor.",
  openInferencer: "Open Inferencer",
  inferredPlaceholder: "Inferred schema will appear here.",
  inlineTitle: "Inline Mode",
  omitVisibleA: "Omit",
  omitVisibleB: "to render inline.",
  inferInlineExtra: "Here the inferred schema feeds a separate editor below.",
  stepPasteJson: "1 — Paste JSON",
  stepResultSchema: "2 — Resulting schema",
  utilityTitle: "Utility Function",
  inferUtilDesc:
    "A pure function — no Vue required. Pass any JS object, get a JSON Schema back.",
  inputJson: "Input (JSON)",
  outputSchema: "Output (Schema)",
  run: "Run",
  pressRun: "Press Run",

  validatorPopupDesc:
    "Open a dialog, paste JSON, and validate against the current schema.",
  openValidator: "Open Validator",
  validatesAgainst: "Validates against the schema from the editor above.",
  validatorUtilDesc:
    "Pure function — no Vue required. Returns structured errors with paths and line numbers.",
  input: "Input",
  result: "Result",
  validate: "Validate",
  pressValidate: "Press Validate",
  valid: "✓ Valid",

  i18nDesc:
    "All components share a reactive translation context via Vue's provide / inject. Provide a Ref<Translation> and change its value to switch languages at runtime.",
  availableLocales: "Available Locales",

  themingDesc:
    "Toggle dark mode at runtime. The useTheme composable provides reactive dark-mode state.",
  darkMode: "Dark Mode",
  dark: "Dark",
  light: "Light",

  footer: "Built with Vue 3 · MIT License",

  resultTab: "Result",
  codeTab: "Code",
  copy: "Copy",

  pageNotFound: "Page not found",
  goHome: "Go home",
};

export type DemoText = typeof en;

const zh: DemoText = {
  heroSubtitle: "Vue 3 交互式 JSON Schema 编辑器组件",

  basic: "基础",
  visualOnly: "纯可视化",
  readOnly: "只读",
  noFullscreen: "无全屏",
  sync: "文本框同步",
  popup: "弹窗",
  inline: "内嵌",
  utility: "工具函数",
  localization: "国际化",
  theming: "主题",

  props: "属性",
  events: "事件",
  name: "名称",
  type: "类型",
  default: "默认值",
  description: "说明",
  payload: "参数",

  editorDesc:
    "功能完备的可视化 JSON Schema 构建器，附带可选的实时 JSON 代码视图。支持嵌套对象、数组、全部 draft-07 类型以及校验约束。",
  editorPropSchema: "要编辑的 JSON schema（支持 v-model）。",
  editorPropReadOnly: "禁用全部编辑控件。",
  editorPropShowJson: "显示 Monaco JSON 编辑面板。",
  editorPropShowFullscreen: "显示全屏切换按钮。",
  editorEventUpdateSchema: "schema 每次变更时触发。",

  inferDesc:
    "从示例 JSON 文档生成 JSON Schema。支持弹窗或内嵌两种模式，且与编辑器完全解耦——结果如何消费由你决定。",
  inferPropVisible: "对话框可见性。内嵌模式下省略。",
  inferEventUpdateVisible: "对话框打开 / 关闭。",
  inferEventSchemaInferred: "推断出的 schema。",

  validatorDesc:
    "将 JSON 文档与任意 schema 进行校验，实时显示行内错误。同时提供纯工具函数，适用于无界面场景。",
  validatorPropSchema: "校验所依据的 schema。",
  validatorPropVisible: "内嵌模式下省略。",
  validatorEventUpdateVisible: "对话框打开 / 关闭。",

  basicTitle: "基础用法",
  basicDesc: "默认配置，同时显示可视化和 JSON 编辑两个面板。",
  visualOnlyTitle: "纯可视化",
  visualOnlyDesc: "隐藏 JSON 代码面板——适合只需要可视化构建的最终用户。",
  readOnlyTitle: "只读",
  readOnlyDesc: "展示 schema 但不允许修改。",
  noFullscreenTitle: "无全屏按钮",
  noFullscreenDesc: "嵌入式布局下隐藏全屏按钮。",
  syncTitle: "文本框同步",
  syncDescA: "普通文本框通过",
  syncDescB: "事件实时镜像 schema 的每次变更。",
  popupTitle: "弹窗模式",
  inferPopupDesc:
    "以对话框形式打开，粘贴 JSON 即可得到 schema。推断结果会展示在下方独立的只读编辑器中。",
  openInferencer: "打开推断器",
  inferredPlaceholder: "推断出的 schema 将显示在这里。",
  inlineTitle: "内嵌模式",
  omitVisibleA: "省略",
  omitVisibleB: "即可内嵌渲染。",
  inferInlineExtra: "此处推断出的 schema 会展示在下方的独立编辑器中。",
  stepPasteJson: "1 — 粘贴 JSON",
  stepResultSchema: "2 — 结果 schema",
  utilityTitle: "工具函数",
  inferUtilDesc: "纯函数——无需 Vue。传入任意 JS 对象，返回一份 JSON Schema。",
  inputJson: "输入（JSON）",
  outputSchema: "输出（Schema）",
  run: "运行",
  pressRun: "点击运行",

  validatorPopupDesc: "打开对话框，粘贴 JSON，并依据当前 schema 进行校验。",
  openValidator: "打开校验器",
  validatesAgainst: "依据上方编辑器中的 schema 进行校验。",
  validatorUtilDesc: "纯函数——无需 Vue。返回带路径和行号的结构化错误信息。",
  input: "输入",
  result: "结果",
  validate: "校验",
  pressValidate: "点击校验",
  valid: "✓ 校验通过",

  i18nDesc:
    "所有组件通过 Vue 的 provide / inject 共享响应式翻译上下文。提供一个 Ref<Translation> 并在运行时修改它的值，即可切换语言。",
  availableLocales: "可用语言",

  themingDesc: "运行时开关深色模式。useTheme 组合式函数提供响应式的深色模式状态。",
  darkMode: "深色模式",
  dark: "深色",
  light: "浅色",

  footer: "基于 Vue 3 构建 · MIT 许可证",

  resultTab: "效果",
  codeTab: "代码",
  copy: "复制",

  pageNotFound: "页面不存在",
  goHome: "返回首页",
};

export const demoLang = ref<DemoLocale>("en");

export const demoText = computed<DemoText>(() =>
  demoLang.value === "zh" ? zh : en,
);

export function setDemoLang(lang: DemoLocale) {
  demoLang.value = lang;
  document.documentElement.lang = lang;
}
