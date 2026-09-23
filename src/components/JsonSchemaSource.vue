<script setup lang="ts">
import { Download, FileJson } from "@lucide/vue";
import { ElButton, ElTooltip } from "element-plus";
import { computed, ref, watch } from "vue";
import { useSchemaStore } from "../composables/useSchemaStore.ts";
import JsonEditor from "./JsonEditor.vue";

const props = withDefaults(
  defineProps<{
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

const store = useSchemaStore();

import { t } from "../composables/useI18n.ts";

const schema = computed(() => store.schema.value);

let lastStoreJson = JSON.stringify(schema.value);
const editorText = ref(JSON.stringify(schema.value, null, 2));

// 可视化编辑发生变化时，同步更新源码编辑器内容。
watch(schema, (newSchema) => {
  const newJson = JSON.stringify(newSchema);
  if (newJson === lastStoreJson) return;
  lastStoreJson = newJson;
  editorText.value = JSON.stringify(newSchema, null, 2);
});

// 仅当输入内容可被正确解析时才提交到 Store，非法 JSON 保留在编辑器中。
const handleEditorUpdate = (newText: string) => {
  editorText.value = newText;
  if (props.readOnly) return;

  try {
    const parsed = JSON.parse(newText);
    const newJson = JSON.stringify(parsed);
    if (newJson === lastStoreJson) return;
    lastStoreJson = newJson;
    store.replaceSchema(parsed);
  } catch {
    // JsonEditor 会在编辑器中显示语法错误。
  }
};

const handleDownload = () => {
  const content = JSON.stringify(schema.value, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = t.value.visualizerDownloadFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="schema-source">
    <div class="schema-source__header">
      <div class="schema-source__title">
        <FileJson :size="18" />
        <span>{{ t.visualizerSource }}</span>
      </div>
      <el-tooltip :content="t.visualizerDownloadTitle" placement="top">
        <el-button text circle :aria-label="t.visualizerDownloadTitle" @click="handleDownload">
          <Download :size="16" />
        </el-button>
      </el-tooltip>
    </div>
    <div class="schema-source__editor">
      <JsonEditor
        :model-value="editorText"
        :read-only="readOnly"
        height="100%"
        @update:model-value="handleEditorUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.schema-source {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--el-bg-color);
}

.schema-source__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-light);
}

.schema-source__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}

.schema-source__editor {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

.schema-source__editor :deep(.base-monaco-editor) {
  height: 100% !important;
}
</style>
