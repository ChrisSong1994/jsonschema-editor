<script setup lang="ts">
import {
  Code2,
  Eye,
  EyeOff,
  FileJson,
  Languages,
  Layers,
  Lock,
  Maximize,
  Moon,
  PanelRight,
  Sparkles,
  Sun,
  Zap,
} from "@lucide/vue";
import { computed, ref } from "vue";
import { isDark, toggleDark } from "../../src/composables/useDarkMode.ts";
import { locale, t, toggleLocale } from "../../src/composables/useI18n.ts";
import {
  type JSONSchema,
  JsonSchemaEditor,
  JsonValidateDialog,
  SchemaInferDialog,
} from "../../src/index.ts";

const initialSchema: JSONSchema = {
  type: "object",
  properties: {
    name: { type: "string", description: "用户名", minLength: 1 },
    age: { type: "integer", description: "年龄", minimum: 0 },
    email: { type: "string", format: "email" },
    active: { type: "boolean" },
    tags: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
    },
  },
  required: ["name", "email"],
};

const schema = ref<JSONSchema>(initialSchema);
const inferredSchema = ref<JSONSchema>({ type: "object", properties: {} });
const inferDialogVisible = ref(false);
const validateDialogVisible = ref(false);

const showInferred = ref(false);

const isZh = computed(() => locale.value === "zh");
const langLabel = computed(() => (isZh.value ? "English" : "中文"));

const propSourceVisible = ref(false);
</script>

<template>
  <div class="demo-page">
    <header class="demo-header">
      <div class="demo-header__brand">
        <div class="demo-header__logo">
          <Code2 :size="20" />
        </div>
        <div>
          <h1>jsonschema-editor</h1>
          <p>{{ t.demoSubtitle }}</p>
        </div>
      </div>
      <div class="demo-header__actions">
        <a
          class="demo-icon-btn"
          href="https://github.com/ChrisSong1994/jsonschema-editor"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          aria-label="GitHub"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
            />
          </svg>
        </a>
        <button
          type="button"
          class="demo-lang-btn"
          :title="langLabel"
          @click="toggleLocale()"
        >
          <Languages :size="16" />
          <span>{{ langLabel }}</span>
        </button>
        <button
          type="button"
          class="demo-icon-btn"
          @click="toggleDark()"
        >
          <Moon v-if="!isDark" :size="18" />
          <Sun v-else :size="18" />
        </button>
      </div>
    </header>

    <main class="demo-main">
      <section class="demo-section">
        <div class="demo-section__title">
          <Layers :size="18" />
          <h2>{{ t.demoBasicTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoBasicDesc }}
        </p>
        <JsonSchemaEditor
          :schema="schema"
          @update:schema="schema = $event"
        />
      </section>

      <section class="demo-section">
        <div class="demo-section__title">
          <PanelRight :size="18" />
          <h2>{{ t.demoToggleSourceTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoToggleSourceDesc }}
        </p>
        <JsonSchemaEditor
          :schema="schema"
          @update:schema="schema = $event"
        />
      </section>

      <section class="demo-section">
        <div class="demo-section__title">
          <Eye :size="18" />
          <h2>{{ t.demoPropSourceTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoPropSourceDesc }}
        </p>
        <div class="demo-actions">
          <button
            type="button"
            class="demo-btn demo-btn--primary"
            @click="propSourceVisible = !propSourceVisible"
          >
            <Eye v-if="!propSourceVisible" :size="15" />
            <EyeOff v-else :size="15" />
            {{
              propSourceVisible ? t.demoHideSource : t.demoShowSource
            }}
          </button>
        </div>
        <JsonSchemaEditor
          :schema="schema"
          v-model:source-visible="propSourceVisible"
          @update:schema="schema = $event"
        />
      </section>

      <section class="demo-section">
        <div class="demo-section__title">
          <Eye :size="18" />
          <h2>{{ t.demoVisualOnlyTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoVisualOnlyDesc }}
        </p>
        <JsonSchemaEditor :schema="schema" :show-json-editor="false" />
      </section>

      <section class="demo-section">
        <div class="demo-section__title">
          <Lock :size="18" />
          <h2>{{ t.demoReadonlyTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoReadonlyDesc }}
        </p>
        <JsonSchemaEditor :schema="schema" :read-only="true" />
      </section>

      <section class="demo-section">
        <div class="demo-section__title">
          <Maximize :size="18" />
          <h2>{{ t.demoNoFullscreenTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoNoFullscreenDesc }}
        </p>
        <JsonSchemaEditor :schema="schema" :show-fullscreen="false" />
      </section>

      <section class="demo-section">
        <div class="demo-section__title">
          <Sparkles :size="18" />
          <h2>{{ t.demoInferTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoInferDesc }}
        </p>
        <div class="demo-actions">
          <button
            type="button"
            class="demo-btn demo-btn--primary"
            @click="inferDialogVisible = true"
          >
            <Eye :size="15" /> {{ t.demoDialogMode }}
          </button>
          <button
            type="button"
            class="demo-btn"
            :class="{ 'demo-btn--active': showInferred }"
            @click="showInferred = !showInferred"
          >
            <EyeOff :size="15" />
            {{ showInferred ? t.demoCollapseInline : t.demoInlineMode }}
          </button>
        </div>

        <div v-if="showInferred" class="demo-infer-inline">
          <SchemaInferDialog @schema-inferred="inferredSchema = $event" />
        </div>

        <SchemaInferDialog
          :visible="inferDialogVisible"
          @update:visible="inferDialogVisible = $event"
          @schema-inferred="inferredSchema = $event"
        />
      </section>

      <section class="demo-section">
        <div class="demo-section__title">
          <Zap :size="18" />
          <h2>{{ t.demoValidateTitle }}</h2>
        </div>
        <p class="demo-section__desc">
          {{ t.demoValidateDesc }}
        </p>
        <div class="demo-actions">
          <button
            type="button"
            class="demo-btn demo-btn--primary"
            @click="validateDialogVisible = true"
          >
            <FileJson :size="15" /> {{ t.demoOpenValidator }}
          </button>
        </div>
        <JsonValidateDialog
          :schema="schema"
          :visible="validateDialogVisible"
          @update:visible="validateDialogVisible = $event"
        />
        <div class="demo-validate-inline">
          <JsonValidateDialog :schema="schema" />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 32px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.demo-header__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.demo-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.demo-header__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--el-color-primary);
  color: #fff;
}

.demo-header h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
}

.demo-header p {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.demo-lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 9px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-lang-btn:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.demo-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--el-border-color);
  border-radius: 9px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-icon-btn:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.demo-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.demo-section {
  margin-bottom: 40px;
}

.demo-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.demo-section__title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.demo-section__desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.demo-section__desc code {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--el-color-primary);
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.demo-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.demo-btn--primary {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
  color: #fff;
}

.demo-btn--primary:hover {
  opacity: 0.9;
  color: #fff;
}

.demo-btn--active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.demo-infer-inline {
  margin-top: 16px;
}

.demo-validate-inline {
  margin-top: 16px;
}
</style>
