
# @fett/jsonschema-editor

一个 **Vue 3 可视化 JSON Schema 编辑器**，通过直观、无需手写的方式创建和编辑 JSON Schema 定义。

基于 **Element Plus** 构建，并提供一个可选的 **Monaco** JSON 编辑器，用于更精细的代码级控制。

## 特性亮点

- 🖱️ **可视化编辑** — 通过表单和选择器构建对象、数组、`oneOf`、`anyOf` 及嵌套结构，无需直接编写原始 JSON。
- 🔗 **双向同步** — 可视化面板与实时的 Monaco JSON 编辑器保持完美同步（`v-model:schema`）。
- 🪄 **Schema 推断** — 粘贴 JSON，即可得到对应的 JSON Schema（内置对枚举、时间戳、坐标和字符串格式的启发式识别）。
- ✅ **实时校验** — 使用样本 JSON 校验你的 Schema（基于 Ajv），并可将错误定位到具体的行/列。
- 🌍 **国际化** — 内置英文（English）和中文（中文）两种语言，通过 `provideTranslation` 在运行时切换。
- 🌗 **深色模式** — 通过 `useTheme` 在运行时切换主题，与 Element Plus 和 Monaco 联动。
- 🧩 **无头工具函数** — `inferSchema`、`createSchemaFromJson` 和 `validateJson` 可在任何地方使用，甚至不依赖 UI。
- 📦 **按需摇树** — 只引入你需要的组件和工具函数。

## 安装

> 需要在你的应用中安装 peer 依赖：

```bash
npm install @fett/jsonschema-editor vue element-plus
# Monaco 是可选的 —— 仅当需要代码编辑器时安装
npm install monaco-editor
```

或使用 pnpm：

```bash
pnpm add @fett/jsonschema-editor vue element-plus
pnpm add -D monaco-editor   # 可选
```

`monaco-editor` 是可选 peer 依赖 —— 如果省略它，可视化编辑器仍可正常工作，只是缺少代码面板。

## 快速开始

核心组件是 `JsonSchemaEditor`。使用 `v-model:schema` 绑定一个可编辑的 Schema：

```vue
<script setup>
import { ref } from "vue";
import { JsonSchemaEditor } from "@fett/jsonschema-editor";
import type { JSONSchema } from "@fett/jsonschema-editor";

const schema = ref({
  type: "object",
  properties: {
    name: { type: "string", description: "Full name" },
    age: { type: "number", description: "Age in years" },
  },
});
</script>

<template>
  <JsonSchemaEditor v-model:schema="schema" />
</template>
```

在桌面端，它会并排渲染可视化编辑器和 Monaco JSON 面板；在小屏幕上则切换为标签页。拖动分隔条可调整大小，点击展开图标可进入全屏。

### 样式

引入组件样式：

```js
import "@fett/jsonschema-editor/styles.css";
```

本库**不打包 Element Plus 的样式**，使用时必须在宿主应用中自行引入 Element Plus 样式：

```js
// 全量样式
import "element-plus/dist/index.css";

// 或按实际使用的组件按需引入样式，
// 例如 element-plus/es/components/button/style/css
```

如果使用深色模式，还需引入暗黑主题变量：

```js
import "element-plus/theme-chalk/dark/css-vars.css";
```

> 该库使用 Tailwind CSS v4（作用域限定在 `.jscb` 类下）以及 Element Plus 进行样式化。请确保你的构建环境提供了这两者。

## Monaco worker 配置（Vite）

如果你使用 Monaco JSON 编辑器，需在应用入口处配置一次其 worker。针对 Vite：

```ts
// vite.config.ts
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

(self as any).MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "json") return new JsonWorker();
    return new EditorWorker();
  },
};
```

## 组件

### `JsonSchemaEditor`

主可视化编辑器，带有可选的 Monaco JSON 面板。

**Props**

| Prop            | Type                    | Default              | 说明                                             |
| --------------- | ----------------------- | -------------------- | ------------------------------------------------ |
| `schema`        | `JSONSchema`            | `{ type: "object" }` | 要编辑的 Schema。                                |
| `readOnly`      | `boolean`               | `false`              | 禁用编辑（只读）。                               |
| `showJsonEditor`| `boolean`               | `true`               | 是否在可视化面板旁显示 Monaco JSON 面板。        |
| `showFullscreen`| `boolean`               | `true`               | 是否显示全屏切换按钮。                           |
| `class`         | `string`                | —                    | 应用到根容器的额外 class。                       |

**Events**

| Event            | Payload      | 说明                                          |
| ---------------- | ------------ | --------------------------------------------- |
| `update:schema`  | `JSONSchema` | 当编辑器中的 Schema 发生变化时触发。          |

**示例 — 仅可视化（无 JSON 面板）：**

```vue
<template>
  <JsonSchemaEditor v-model:schema="schema" :show-json-editor="false" />
</template>
```

**示例 — 只读预览：**

```vue
<template>
  <JsonSchemaEditor :schema="schema" :read-only="true" />
</template>
```

### `SchemaInferencer`

根据样本 JSON 生成 JSON Schema。当传入 `visible` 时渲染为对话框，省略时则以内联方式渲染。

**Props：** `visible?: boolean`

**Events：** `update:visible`、`schemaInferred`（payload 为 `JSONSchema`）

```vue
<button @click="showDialog = true">Open Inferencer</button>

<SchemaInferencer
  v-model:visible="showDialog"
  @schema-inferred="schema = $event"
/>
```

### `JsonValidator`

使用样本 JSON 校验你的 Schema（基于 Ajv）。当传入 `visible` 时渲染为对话框，省略时则以内联方式渲染。

**Props：** `schema: JSONSchema`、`visible?: boolean`

**Events：** `update:visible`

```vue
<JsonValidator v-model:visible="showDialog" :schema="schema" />
```

## 工具函数

这些函数可在任何地方使用，无论是否使用 UI：

### `createSchemaFromJson` / `inferSchema`

从 JSON 值推断 Schema。`createSchemaFromJson` 会将结果包装为 draft-07 文档：

```ts
import { createSchemaFromJson } from "@fett/jsonschema-editor";

const schema = createSchemaFromJson({
  name: "Alice",
  age: 25,
  active: true,
});
```

推断过程包含对常见模式的启发式识别 —— 字符串格式（`email`、`uuid`、`date-time`、`uri`）、对象数组中的枚举、坐标数组以及 Unix 时间戳。

### `validateJson`

校验 JSON 字符串并返回错误信息（可选择映射到行/列）：

```ts
import { validateJson } from "@fett/jsonschema-editor";

const result = validateJson(
  '{ "name": "Bob", "age": "not a number" }',
  { type: "object", properties: { name: { type: "string" }, age: { type: "number" } } },
);

if (!result.valid) {
  for (const e of result.errors) {
    console.log(e.path, e.message, e.line, e.column);
  }
}
```

## 主题与深色模式

### 深色模式

使用 `useTheme` 组合式函数在运行时切换深色模式。它会切换 `<html>` 上的 `dark` 类（用于驱动 Element Plus 深色 CSS 变量和 Tailwind `dark:` 变体），在所有 `.jscb` 容器上同样切换，并同步切换 Monaco 主题：

```ts
import { useTheme } from "@fett/jsonschema-editor";

const { darkMode, toggleDarkMode } = useTheme();

<button @click="toggleDarkMode()">Toggle dark mode</button>
```

主题基于 **Element Plus**（基于 CSS 变量）构建，因此你也可以像往常一样，通过覆盖 Element Plus 的 `--el-color-primary` 及相关 token 来自定义品牌色。

## 国际化

编辑器内置英文（`en`）和中文（`zh`）两种语言。提供一个翻译上下文，并使其保持响应式以便在运行时切换：

```ts
import { ref } from "vue";
import { provideTranslation, en } from "@fett/jsonschema-editor";
import type { Translation } from "@fett/jsonschema-editor";

// 提供响应式翻译 —— 当 translation.value 变化时，
// 所有后代组件的文案都会随之更新。
const translation = ref<Translation>(en);
provideTranslation(translation);

async function switchLanguage(lang: "en" | "zh") {
  const mod = await import(`@fett/jsonschema-editor/i18n/locales/${lang}`);
  translation.value = mod[lang];
}
```

> 内部组件在底层使用 `useTranslation()`。如果未提供上下文，则回退到英文。

## Schema 推断与 `JSONSchema` 类型

`JSONSchema` 类型与 JSON Schema 规范保持一致（包括 `properties`、`items`、`oneOf`、`$defs` 等递归结构），并以 **Zod** 作为类型来源。引入它可获得类型安全的 Schema：

```ts
import type { JSONSchema, SchemaType } from "@fett/jsonschema-editor";
```

## 开发

克隆仓库并运行演示应用：

```bash
pnpm install
pnpm dev       # 演示应用（vite）—— 打开 http://localhost:5173
pnpm build     # 构建库
```

### 脚本

| Script            | 说明                                      |
| ----------------- | ----------------------------------------- |
| `dev`             | 运行演示应用（vite）。                    |
| `build`           | 构建库。                                  |
| `build:demo`      | 构建演示站点。                            |
| `typecheck`       | 使用 `vue-tsc` 进行类型检查。            |
| `lint` / `format` | 使用 Biome 进行 lint / 格式化。           |
| `check` / `fix`   | Biome 检查 / 自动修复。                   |
| `test`            | 运行单元测试（Node test runner）。        |
| `test:ui`         | 运行组件测试（Vitest）。                  |
| `test:all`        | 运行所有测试。                            |

## 许可证

[MIT](./LICENSE)