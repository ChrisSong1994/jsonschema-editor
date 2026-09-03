# @fett/jsonschema-editor

A **Vue 3 visual JSON Schema editor** for creating and manipulating JSON Schema definitions through an intuitive, drag-and-free visual interface — no need to hand-write schemas.

Built on top of **Element Plus**, with an optional **Monaco** JSON editor for fine-grained, code-level control.

## Highlights

- 🖱️ **Visual editing** — build objects, arrays, `oneOf`, `anyOf` and nested structures with forms and pickers, not raw JSON.
- 🔗 **Two-way sync** — a visual pane and a live Monaco JSON editor stay in perfect sync (`v-model:schema`).
- 🪄 **Schema inference** — paste JSON, get a JSON Schema back (with heuristic detection of enums, timestamps, coordinates and string formats).
- ✅ **Live validation** — validate sample JSON against your schema (Ajv-powered) with errors mapped to line/column.
- 🌍 **i18n** — English and Chinese (中文) locales, switchable at runtime via `provideTranslation`.
- 🌗 **Dark mode** — runtime theme switch via `useTheme`, wired into Element Plus and Monaco.
- 🧩 **Headless utilities** — `inferSchema`, `createSchemaFromJson`, and `validateJson` for use anywhere, even outside the UI.
- 📦 **Tree-shakeable** — import only the components and utilities you need.

## Installation

> Peer dependencies must be installed in your app:

```bash
npm install @fett/jsonschema-editor vue element-plus
# Monaco is optional — install only if you want the JSON code editor
npm install monaco-editor
```

or with pnpm:

```bash
pnpm add @fett/jsonschema-editor vue element-plus
pnpm add -D monaco-editor   # optional
```

`monaco-editor` is an optional peer dependency — if you omit it, the visual editor works fine, just without the code pane.

## Quick Start

The core component is `JsonSchemaEditor`. Use `v-model:schema` to bind an editable schema:

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

On desktop it renders the visual editor and the Monaco JSON pane side by side; on smaller screens they switch to tabs. Drag the divider to resize, or click the expand icon for fullscreen.

### CSS

Import the component styles:

```js
import "@fett/jsonschema-editor/styles.css";
```

> The library is styled with Tailwind CSS v4 (scoped under the `.jscb` class) plus Element Plus. Ensure both are available in your build.

## Monaco worker setup (Vite)

If you use the Monaco JSON editor, configure its workers once in your app entry. For Vite:

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

## Components

### `JsonSchemaEditor`

The main visual editor with an optional Monaco JSON pane.

**Props**

| Prop            | Type                    | Default              | Description                                        |
| --------------- | ----------------------- | -------------------- | -------------------------------------------------- |
| `schema`        | `JSONSchema`            | `{ type: "object" }` | The schema to edit.                                |
| `readOnly`      | `boolean`               | `false`              | Disable editing (view-only).                       |
| `showJsonEditor`| `boolean`               | `true`               | Show the Monaco JSON pane alongside the visual one.|
| `showFullscreen`| `boolean`               | `true`               | Show the fullscreen toggle button.                 |
| `class`         | `string`                | —                    | Extra classes applied to the root container.       |

**Events**

| Event            | Payload      | Description                                        |
| ---------------- | ------------ | -------------------------------------------------- |
| `update:schema`  | `JSONSchema` | Fired whenever the schema changes in the editor.   |

**Example — visual only (no JSON pane):**

```vue
<template>
  <JsonSchemaEditor v-model:schema="schema" :show-json-editor="false" />
</template>
```

**Example — read-only preview:**

```vue
<template>
  <JsonSchemaEditor :schema="schema" :read-only="true" />
</template>
```

### `SchemaInferencer`

Generates a JSON Schema from sample JSON. Renders as a dialog when `visible` is set, or inline when omitted.

**Props:** `visible?: boolean`

**Events:** `update:visible`, `schemaInferred` (payload `JSONSchema`)

```vue
<button @click="showDialog = true">Open Inferencer</button>

<SchemaInferencer
  v-model:visible="showDialog"
  @schema-inferred="schema = $event"
/>
```

### `JsonValidator`

Validates sample JSON against a schema (powered by Ajv). Renders as a dialog when `visible` is set, or inline when omitted.

**Props:** `schema: JSONSchema`, `visible?: boolean`

**Events:** `update:visible`

```vue
<JsonValidator v-model:visible="showDialog" :schema="schema" />
```

## Utility functions

These work anywhere, with or without the UI:

### `createSchemaFromJson` / `inferSchema`

Infer a schema from a JSON value. `createSchemaFromJson` wraps the result in a draft-07 document:

```ts
import { createSchemaFromJson } from "@fett/jsonschema-editor";

const schema = createSchemaFromJson({
  name: "Alice",
  age: 25,
  active: true,
});
```

Inference includes heuristic detection of common patterns — string formats (`email`, `uuid`, `date-time`, `uri`), array-of-object enums, coordinate arrays, and unix timestamps.

### `validateJson`

Validate a JSON string against a schema and get errors (optionally mapped to line/column):

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

## Theming & dark mode

### Dark mode

Use the `useTheme` composable to toggle dark mode at runtime. It flips the `dark` class on `<html>` (which drives Element Plus dark CSS variables and Tailwind `dark:` variants), toggles it on all `.jscb` containers, and switches the Monaco theme:

```ts
import { useTheme } from "@fett/jsonschema-editor";

const { darkMode, toggleDarkMode } = useTheme();

<button @click="toggleDarkMode()">Toggle dark mode</button>
```

Theming is built on **Element Plus** (CSS-variable based), so you can also customize your brand color by overriding Element Plus `--el-color-primary` and related tokens as usual.

## Internationalization

The editor ships with English (`en`) and Chinese (`zh`) locales. Provide a translation context once; make it reactive to switch at runtime:

```ts
import { ref } from "vue";
import { provideTranslation, en } from "@fett/jsonschema-editor";
import type { Translation } from "@fett/jsonschema-editor";

// Provide a reactive translation — all descendant component labels update
// when translation.value changes.
const translation = ref<Translation>(en);
provideTranslation(translation);

async function switchLanguage(lang: "en" | "zh") {
  const mod = await import(`@fett/jsonschema-editor/i18n/locales/${lang}`);
  translation.value = mod[lang];
}
```

> Internal components use `useTranslation()` under the hood. Without a provided context, they fall back to English.

## Schema inference & the `JSONSchema` type

The `JSONSchema` type mirrors the JSON Schema specification (including recursive constructs like `properties`, `items`, `oneOf`, `$defs`, etc.), typed with **Zod** as the source of truth. Import it for type-safe schemas:

```ts
import type { JSONSchema, SchemaType } from "@fett/jsonschema-editor";
```

## Development

Clone the repo and run the demo app:

```bash
pnpm install
pnpm dev       # demo app (vite) — open http://localhost:5173
pnpm build     # library build
```

### Scripts

| Script            | Description                                   |
| ----------------- | --------------------------------------------- |
| `dev`             | Run the demo app (vite).                      |
| `build`           | Build the library.                            |
| `build:demo`      | Build the demo site.                          |
| `typecheck`       | Type-check with `vue-tsc`.                    |
| `lint` / `format` | Lint / format with Biome.                     |
| `check` / `fix`   | Biome check / auto-fix.                       |
| `test`            | Run unit tests (Node test runner).            |
| `test:ui`         | Run component tests (Vitest).                 |
| `test:all`        | Run all tests.                                |

## License

[MIT](./LICENSE)