<script setup lang="ts">
import { ElSwitch } from "element-plus";
import { computed } from "vue";
import type { JSONSchema, ObjectJSONSchema } from "../../types/json-schema.ts";
import { withObjectSchema } from "../../types/json-schema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";

const props = withDefaults(
  defineProps<{
    schema: JSONSchema;
    path: string[];
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
  }>(),
  { readOnly: false, depth: 0 },
);

const emit = defineEmits<{
  change: [schema: ObjectJSONSchema];
}>();

import { t } from "../../composables/useI18n.ts";

const enumValues = computed(() =>
  withObjectSchema(
    props.schema,
    (schema) =>
      Array.isArray(schema.enum) ? (schema.enum as boolean[]) : undefined,
    undefined,
  ),
);
const hasRestrictions = computed(() => Array.isArray(enumValues.value));
const allowsTrue = computed(
  () => !hasRestrictions.value || enumValues.value?.includes(true) || false,
);
const allowsFalse = computed(
  () => !hasRestrictions.value || enumValues.value?.includes(false) || false,
);

const handleAllowedChange = (value: boolean, allowed: boolean) => {
  let newEnum: boolean[] | undefined;

  if (allowed) {
    if (!hasRestrictions.value) return;
    if (enumValues.value?.includes(value)) return;
    newEnum = enumValues.value ? [...enumValues.value, value] : [value];
    if (newEnum.includes(true) && newEnum.includes(false)) newEnum = undefined;
  } else {
    if (hasRestrictions.value && !enumValues.value?.includes(value)) return;
    newEnum = [!value];
  }

  emit(
    "change",
    newEnum ? { type: "boolean", enum: newEnum } : { type: "boolean" },
  );
};
</script>

<template>
  <div class="schema-boolean-editor">
    <p v-if="readOnly && !hasRestrictions" class="schema-boolean-editor__empty">{{ t.booleanNoConstraint }}</p>

    <div v-if="!readOnly || hasRestrictions" class="schema-boolean-editor__content">
      <template v-if="!readOnly || hasRestrictions">
        <label>{{ t.booleanAllowedValuesLabel }}</label>
        <div class="schema-boolean-editor__options">
          <div class="schema-boolean-editor__option">
            <el-switch
              :model-value="allowsTrue"
              :disabled="readOnly"
              @update:model-value="(checked: string | number | boolean) => handleAllowedChange(true, checked === true)"
            />
            <span>{{ t.booleanAllowTrueLabel }}</span>
          </div>
          <div class="schema-boolean-editor__option">
            <el-switch
              :model-value="allowsFalse"
              :disabled="readOnly"
              @update:model-value="(checked: string | number | boolean) => handleAllowedChange(false, checked === true)"
            />
            <span>{{ t.booleanAllowFalseLabel }}</span>
          </div>
        </div>
      </template>
      <p v-if="!allowsTrue && !allowsFalse" class="schema-boolean-editor__warning">
        {{ t.booleanNeitherWarning }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.schema-boolean-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schema-boolean-editor__empty {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-style: italic;
}

.schema-boolean-editor__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schema-boolean-editor__content > label {
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-weight: 500;
}

.schema-boolean-editor__options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schema-boolean-editor__option {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.schema-boolean-editor__warning {
  margin: 0;
  color: var(--el-color-warning);
  font-size: 12px;
}
</style>
