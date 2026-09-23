<script setup lang="ts">
import { ElEmpty } from "element-plus";
import { computed } from "vue";
import { useSchemaStore } from "../composables/useSchemaStore.ts";
import { isBooleanSchema, isObjectSchema } from "../types/json-schema.ts";
import AddFieldDialog from "./AddFieldDialog.vue";
import SchemaFieldList from "./SchemaFieldList.vue";

withDefaults(
  defineProps<{
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

import { t } from "../composables/useI18n.ts";

const store = useSchemaStore();
const schema = computed(() => store.schema.value);
const hasFields = computed(
  () =>
    !isBooleanSchema(schema.value) &&
    isObjectSchema(schema.value) &&
    !!schema.value.properties &&
    Object.keys(schema.value.properties).length > 0,
);
</script>

<template>
  <div class="schema-visual-editor">
    <div v-if="!readOnly" class="schema-visual-editor__toolbar">
      <AddFieldDialog :path="[]" />
    </div>

    <div class="schema-visual-editor__content">
      <el-empty v-if="!hasFields" :description="t.visualEditorNoFieldsHint1" :image-size="72">
        <p class="schema-visual-editor__empty-hint">{{ t.visualEditorNoFieldsHint2 }}</p>
      </el-empty>
      <SchemaFieldList v-else :path="[]" :read-only="readOnly" />
    </div>
  </div>
</template>

<style scoped>
.schema-visual-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  background: var(--el-bg-color);
}

.schema-visual-editor__toolbar {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.schema-visual-editor__content {
  flex: 1;
  min-height: 0;
}

.schema-visual-editor__empty-hint {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
