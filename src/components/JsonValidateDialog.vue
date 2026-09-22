<script setup lang="ts">
import { CheckCircle, Loader2, XCircle } from "@lucide/vue";
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { ElDialog } from "element-plus/es/components/dialog/index";
import "element-plus/es/components/dialog/style/css";
import { computed, ref, watch } from "vue";
import JsonEditor from "@/components/UI/Editors/JsonEditor/index.vue";
import { zh as t } from "../constants/zh.ts";
import { type ValidationResult, validateJson } from "../lib/json-validator.ts";
import type { JSONSchema } from "../types/json-schema.ts";

const props = withDefaults(
  defineProps<{
    schema: JSONSchema;
    /** 传入 visible 时以弹窗形式展示，否则以内联形式展示。 */
    visible?: boolean;
  }>(),
  { visible: undefined },
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const isDialog = computed(() => props.visible !== undefined);
const validationResult = ref<ValidationResult | null>(null);
const isValidating = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const editorText = ref(
  JSON.stringify(
    {
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    },
    null,
    2,
  ),
);

const handleValidation = () => {
  isValidating.value = true;
  validationResult.value = validateJson(editorText.value, props.schema);
  isValidating.value = false;
};

const debouncedValidate = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handleValidation, 500);
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      handleValidation();
    }
  },
);

const handleEditorUpdate = (newText: string) => {
  editorText.value = newText;
  debouncedValidate();
};

const errorCount = computed(() => validationResult.value?.errors?.length || 0);
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
        <div class="schema-tool-dialog__title">{{ t.validatorTitle }}</div>
        <p class="schema-tool-dialog__description">{{ t.validatorDescription }}</p>
      </div>
    </template>

    <div class="schema-tool-dialog__content">
      <div class="schema-tool-dialog__editor">
        <JsonEditor :model-value="editorText" height="300px" @update:model-value="handleEditorUpdate" />
      </div>

      <div class="schema-validator__status">
        <div class="schema-validator__status-left">
          <template v-if="isValidating">
            <Loader2 class="is-spinning" :size="16" />
            <span>{{ t.schemaEditorLoading }}</span>
          </template>
          <template v-else-if="validationResult?.valid">
            <CheckCircle :size="16" class="schema-validator__success-icon" />
            <span class="schema-validator__success-text">{{ t.validatorValid }}</span>
          </template>
          <template v-else-if="validationResult && !validationResult.valid">
            <XCircle :size="16" class="schema-validator__error-icon" />
            <span class="schema-validator__error-text">
              {{ t.validatorErrorCount.replace("{count}", String(errorCount)) }}
            </span>
          </template>
        </div>
        <el-button size="small" @click="handleValidation">{{ t.validatorTitle }}</el-button>
      </div>

      <div v-if="validationResult?.errors?.length" class="schema-validator__errors">
        <div v-for="(error, index) in validationResult.errors" :key="index" class="schema-validator__error-item">
          <XCircle :size="14" class="schema-validator__error-icon" />
          <div>
            <span class="schema-validator__error-path">{{ error.path }}</span>
            <span v-if="error.line">
              （{{ t.validatorErrorLocationLineOnly.replace("{line}", String(error.line)) }}）
            </span>
            <p class="schema-validator__error-message">{{ error.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>

  <div v-else class="schema-tool-inline">
    <div class="schema-tool-dialog__editor">
      <JsonEditor :model-value="editorText" height="300px" @update:model-value="handleEditorUpdate" />
    </div>

    <div class="schema-validator__status">
      <div class="schema-validator__status-left">
        <template v-if="isValidating">
          <Loader2 class="is-spinning" :size="16" />
          <span>{{ t.schemaEditorLoading }}</span>
        </template>
        <template v-else-if="validationResult?.valid">
          <CheckCircle :size="16" class="schema-validator__success-icon" />
          <span class="schema-validator__success-text">{{ t.validatorValid }}</span>
        </template>
        <template v-else-if="validationResult && !validationResult.valid">
          <XCircle :size="16" class="schema-validator__error-icon" />
          <span class="schema-validator__error-text">
            {{ t.validatorErrorCount.replace("{count}", String(errorCount)) }}
          </span>
        </template>
      </div>
      <el-button size="small" @click="handleValidation">{{ t.validatorTitle }}</el-button>
    </div>

    <div v-if="validationResult?.errors?.length" class="schema-validator__errors">
      <div v-for="(error, index) in validationResult.errors" :key="index" class="schema-validator__error-item">
        <XCircle :size="14" class="schema-validator__error-icon" />
        <div>
          <span class="schema-validator__error-path">{{ error.path }}</span>
          <span v-if="error.line">
            （{{ t.validatorErrorLocationLineOnly.replace("{line}", String(error.line)) }}）
          </span>
          <p class="schema-validator__error-message">{{ error.message }}</p>
        </div>
      </div>
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

.schema-validator__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.schema-validator__status-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.schema-validator__success-icon,
.schema-validator__success-text {
  color: var(--el-color-success);
}

.schema-validator__error-icon,
.schema-validator__error-text,
.schema-validator__error-message {
  color: var(--el-color-danger);
}

.schema-validator__errors {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.schema-validator__error-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 6px;
  background: var(--el-color-danger-light-9);
  font-size: 14px;
}

.schema-validator__error-item > :deep(svg) {
  flex-shrink: 0;
  margin-top: 2px;
}

.schema-validator__error-path {
  color: var(--el-text-color-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.schema-validator__error-message {
  margin: 2px 0 0;
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
