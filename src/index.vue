<script setup lang="ts">
import { Maximize2 } from "@lucide/vue";
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import JsonSchemaSource from "./components/JsonSchemaSource.vue";
import SchemaVisualEditor from "./components/SchemaVisualEditor.vue";
import {
  createSchemaStore,
  provideSchemaStore,
} from "./composables/useSchemaStore.ts";
import { zh as t } from "./constants/zh.ts";
import type { JSONSchema } from "./types/json-schema.ts";

/** JsonSchemaEditor 对外属性。 */
export interface JsonSchemaEditorProps {
  schema?: JSONSchema;
  readOnly?: boolean;
  /** 是否显示 JSON 源码编辑面板。 */
  showJsonEditor?: boolean;
  /** 是否显示全屏切换按钮。 */
  showFullscreen?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<JsonSchemaEditorProps>(), {
  schema: () => ({ type: "object" }) as JSONSchema,
  readOnly: false,
  showJsonEditor: true,
  showFullscreen: true,
});

const emit = defineEmits<{
  "update:schema": [schema: JSONSchema];
}>();

// Store 是唯一数据源。emit 延迟到下一个宏任务，避免父组件回写触发同步循环。
let skipNextWatch = false;
let pendingEmit: ReturnType<typeof setTimeout> | null = null;
let lastEmittedJson = JSON.stringify(props.schema);

const store = createSchemaStore(props.schema, (newSchema) => {
  const json = JSON.stringify(newSchema);
  if (json === lastEmittedJson) return;

  lastEmittedJson = json;
  if (pendingEmit !== null) clearTimeout(pendingEmit);

  skipNextWatch = true;
  pendingEmit = setTimeout(() => {
    pendingEmit = null;
    emit("update:schema", newSchema);
    setTimeout(() => {
      skipNextWatch = false;
    }, 0);
  }, 0);
});

provideSchemaStore(store);

watch(
  () => props.schema,
  (newSchema) => {
    if (skipNextWatch) return;
    const json = JSON.stringify(newSchema);
    if (json === lastEmittedJson) return;
    lastEmittedJson = json;
    store.replaceSchema(newSchema);
  },
);

const isFullscreen = ref(false);
const leftPanelWidth = ref(50);
const containerRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const activeTab = ref("visual");

const containerClass = computed(() => [
  "json-schema-editor",
  props.class,
  { "json-schema-editor--fullscreen": isFullscreen.value },
]);

const panelStyle = computed(() => ({
  width: `${leftPanelWidth.value}%`,
}));

const sourcePanelStyle = computed(() => ({
  width: `${100 - leftPanelWidth.value}%`,
}));

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const handleMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  isDragging.value = true;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const width = ((event.clientX - rect.left) / rect.width) * 100;
  if (width >= 20 && width <= 80) {
    leftPanelWidth.value = width;
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
};

onBeforeUnmount(() => {
  if (pendingEmit !== null) clearTimeout(pendingEmit);
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<template>
  <div :class="containerClass">
    <template v-if="!showJsonEditor">
      <div class="json-schema-editor__panel">
        <div class="json-schema-editor__header">
          <h3>{{ t.schemaEditorTitle }}</h3>
          <el-button
            v-if="showFullscreen"
            text
            circle
            :aria-label="t.schemaEditorToggleFullscreen"
            @click="toggleFullscreen"
          >
            <Maximize2 :size="16" />
          </el-button>
        </div>
        <div class="json-schema-editor__body">
          <SchemaVisualEditor :read-only="readOnly" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="json-schema-editor__mobile">
        <div class="json-schema-editor__header">
          <h3>{{ t.schemaEditorTitle }}</h3>
          <el-button
            v-if="showFullscreen"
            text
            circle
            :aria-label="t.schemaEditorToggleFullscreen"
            @click="toggleFullscreen"
          >
            <Maximize2 :size="16" />
          </el-button>
        </div>
        <el-tabs v-model="activeTab" class="json-schema-editor__tabs">
          <el-tab-pane :label="t.schemaEditorEditModeVisual" name="visual">
            <div class="json-schema-editor__tab-body">
              <SchemaVisualEditor :read-only="readOnly" />
            </div>
          </el-tab-pane>
          <el-tab-pane :label="t.schemaEditorEditModeJson" name="json">
            <div class="json-schema-editor__tab-body">
              <JsonSchemaSource :read-only="readOnly" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div ref="containerRef" class="json-schema-editor__desktop">
        <div class="json-schema-editor__header">
          <h3>{{ t.schemaEditorTitle }}</h3>
          <el-button
            v-if="showFullscreen"
            text
            circle
            :aria-label="t.schemaEditorToggleFullscreen"
            @click="toggleFullscreen"
          >
            <Maximize2 :size="16" />
          </el-button>
        </div>
        <div class="json-schema-editor__split">
          <div class="json-schema-editor__pane" :style="panelStyle">
            <SchemaVisualEditor :read-only="readOnly" />
          </div>
          <div class="json-schema-editor__divider" @mousedown="handleMouseDown" />
          <div class="json-schema-editor__pane" :style="sourcePanelStyle">
            <JsonSchemaSource :read-only="readOnly" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.json-schema-editor {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.json-schema-editor--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  border: 0;
  border-radius: 0;
}

.json-schema-editor__panel,
.json-schema-editor__desktop,
.json-schema-editor__mobile {
  display: flex;
  flex-direction: column;
  height: 600px;
  min-height: 0;
}

.json-schema-editor--fullscreen .json-schema-editor__panel,
.json-schema-editor--fullscreen .json-schema-editor__desktop,
.json-schema-editor--fullscreen .json-schema-editor__mobile {
  flex: 1;
  height: 100%;
}

.json-schema-editor__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.json-schema-editor__header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.json-schema-editor__body,
.json-schema-editor__tab-body,
.json-schema-editor__split {
  flex: 1;
  min-height: 0;
}

.json-schema-editor__mobile {
  display: none;
}

.json-schema-editor__tabs {
  flex: 1;
  min-height: 0;
}

.json-schema-editor__tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
}

.json-schema-editor__tabs :deep(.el-tabs__content) {
  height: calc(100% - 40px);
}

.json-schema-editor__tab-body {
  height: 100%;
}

.json-schema-editor__split {
  display: flex;
}

.json-schema-editor__pane {
  height: 100%;
  min-width: 0;
}

.json-schema-editor__divider {
  flex-shrink: 0;
  width: 4px;
  background: var(--el-border-color);
  cursor: col-resize;
  transition: background-color 0.2s;
}

.json-schema-editor__divider:hover {
  background: var(--el-color-primary);
}

@media (max-width: 1023px) {
  .json-schema-editor__desktop {
    display: none;
  }

  .json-schema-editor__mobile {
    display: flex;
  }
}
</style>
