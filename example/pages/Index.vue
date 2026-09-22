<script setup lang="ts">
import {
  Code2,
  Eye,
  EyeOff,
  FileJson,
  Layers,
  Lock,
  Maximize,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from "@lucide/vue";
import { ref } from "vue";
import { isDark, toggleDark } from "../../src/composables/useDarkMode.ts";
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
          <p>基于 Vue 3 + Element Plus 的可视化 JSON Schema 编辑器</p>
        </div>
      </div>
      <button type="button" class="demo-icon-btn" @click="toggleDark()">
        <Moon v-if="!isDark" :size="18" />
        <Sun v-else :size="18" />
      </button>
    </header>

    <main class="demo-main">
      <!-- 基础用法 -->
      <section class="demo-section">
        <div class="demo-section__title">
          <Layers :size="18" />
          <h2>基础用法</h2>
        </div>
        <p class="demo-section__desc">
          左侧可视化编辑，右侧实时 JSON 源码，支持拖拽分割条与全屏。
        </p>
        <JsonSchemaEditor
          :schema="schema"
          @update:schema="schema = $event"
        />
      </section>

      <!-- 配置选项 -->
      <section class="demo-section">
        <div class="demo-section__title">
          <Eye :size="18" />
          <h2>纯可视化模式</h2>
        </div>
        <p class="demo-section__desc">
          设置 <code>show-json-editor="false"</code>，仅展示可视化面板。
        </p>
        <JsonSchemaEditor :schema="schema" :show-json-editor="false" />
      </section>

      <section class="demo-grid">
        <div class="demo-section">
          <div class="demo-section__title">
            <Lock :size="18" />
            <h2>只读模式</h2>
          </div>
          <p class="demo-section__desc">
            设置 <code>read-only</code>，禁止一切编辑操作。
          </p>
          <JsonSchemaEditor :schema="schema" :read-only="true" />
        </div>

        <div class="demo-section">
          <div class="demo-section__title">
            <Maximize :size="18" />
            <h2>隐藏全屏按钮</h2>
          </div>
          <p class="demo-section__desc">
            设置 <code>show-fullscreen="false"</code>。
          </p>
          <JsonSchemaEditor :schema="schema" :show-fullscreen="false" />
        </div>
      </section>

      <!-- Schema 推断 -->
      <section class="demo-section">
        <div class="demo-section__title">
          <Sparkles :size="18" />
          <h2>从 JSON 推断 Schema</h2>
        </div>
        <p class="demo-section__desc">
          粘贴 JSON 数据，一键生成对应的 JSON Schema。
        </p>
        <div class="demo-actions">
          <button
            type="button"
            class="demo-btn demo-btn--primary"
            @click="inferDialogVisible = true"
          >
            <Eye :size="15" /> 弹窗模式
          </button>
          <button
            type="button"
            class="demo-btn"
            :class="{ 'demo-btn--active': showInferred }"
            @click="showInferred = !showInferred"
          >
            <EyeOff :size="15" /> {{ showInferred ? "收起内联" : "内联模式" }}
          </button>
        </div>

        <div v-if="showInferred" class="demo-infer-inline">
          <SchemaInferDialog
            @schema-inferred="inferredSchema = $event"
          />
        </div>

        <SchemaInferDialog
          :visible="inferDialogVisible"
          @update:visible="inferDialogVisible = $event"
          @schema-inferred="inferredSchema = $event"
        />
      </section>

      <!-- JSON 校验 -->
      <section class="demo-section">
        <div class="demo-section__title">
          <Zap :size="18" />
          <h2>JSON 数据校验</h2>
        </div>
        <p class="demo-section__desc">
          基于 Ajv，使用当前 Schema 校验 JSON 数据。
        </p>
        <div class="demo-actions">
          <button
            type="button"
            class="demo-btn demo-btn--primary"
            @click="validateDialogVisible = true"
          >
            <FileJson :size="15" /> 打开校验弹窗
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
  padding: 20px 32px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.demo-header__brand {
  display: flex;
  align-items: center;
  gap: 14px;
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

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.demo-grid .demo-section {
  margin-bottom: 40px;
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

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
