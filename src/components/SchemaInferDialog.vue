<script setup lang="ts">
import { Loader2 } from "@lucide/vue";
import { ElButton, ElDialog } from "element-plus";
import { computed, ref, watch } from "vue";
import { createSchemaFromJson } from "../lib/schema-inference.ts";
import type { JSONSchema } from "../types/json-schema.ts";
import JsonEditor from "./JsonEditor.vue";

const props = withDefaults(
  defineProps<{
    /** 传入 visible 时以弹窗形式展示，否则以内联形式。 */
    visible?: boolean;
  }>(),
  { visible: undefined },
);

import { t } from "../composables/useI18n.ts";

const emit = defineEmits<{
  "update:visible": [value: boolean];
  schemaInferred: [schema: JSONSchema];
}>();

const isDialog = computed(() => props.visible !== undefined);
const isProcessing = ref(false);
const errorMessage = ref("");

const sampleJson = JSON.stringify(
  {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    active: true,
  },
  null,
  2,
);

const editorText = ref(sampleJson);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      errorMessage.value = "";
    }
  },
);

const handleInfer = () => {
  const value = editorText.value.trim();
  if (!value) return;

  isProcessing.value = true;
  errorMessage.value = "";

  try {
    const jsonObject = JSON.parse(value);
    emit("schemaInferred", createSchemaFromJson(jsonObject));
    if (isDialog.value) emit("update:visible", false);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : t.value.inferrerErrorInvalidJson;
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <el-dialog
    v-if="isDialog"
    :model-value="props.visible ?? false"
    width="min(760px, 95vw)"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    class="schema-tool-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <template #header>
      <div>
        <div class="schema-tool-dialog__title">{{ t.inferrerTitle }}</div>
        <p class="schema-tool-dialog__description">{{ t.inferrerDescription }}</p>
      </div>
    </template>

    <div class="schema-tool-dialog__content">
      <div class="schema-tool-dialog__editor">
        <JsonEditor v-model="editorText" height="300px" />
      </div>

      <p v-if="errorMessage" class="schema-tool-dialog__error">{{ errorMessage }}</p>

      <div class="schema-tool-dialog__actions">
        <el-button @click="emit('update:visible', false)">{{ t.inferrerCancel }}</el-button>
        <el-button type="primary" :loading="isProcessing" @click="handleInfer">
          <Loader2 v-if="isProcessing" class="is-spinning" :size="14" />
          {{ t.inferrerGenerate }}
        </el-button>
      </div>
    </div>
  </el-dialog>

  <div v-else class="schema-tool-inline">
    <div class="schema-tool-dialog__editor">
      <JsonEditor v-model="editorText" height="300px" />
    </div>

    <p v-if="errorMessage" class="schema-tool-dialog__error">{{ errorMessage }}</p>

    <div class="schema-tool-dialog__actions">
      <el-button type="primary" :loading="isProcessing" @click="handleInfer">
        <Loader2 v-if="isProcessing" class="is-spinning" :size="14" />
        {{ t.inferrerGenerate }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.schema-tool-dialog__title {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
}

.schema-tool-dialog__description {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.schema-tool-dialog__content,
.schema-tool-inline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schema-tool-dialog__editor {
  height: 300px;
  overflow: hidden;
}

.schema-tool-dialog__editor :deep(.base-monaco-editor) {
  height: 100% !important;
}

.schema-tool-dialog__error {
  color: var(--el-color-danger);
  font-size: 14px;
}

.schema-tool-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.is-spinning {
  animation: schema-spin 1s linear infinite;
}

@keyframes schema-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
