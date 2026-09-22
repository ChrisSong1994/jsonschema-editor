<script setup lang="ts">
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { ElInput } from "element-plus/es/components/input/index";
import "element-plus/es/components/input/style/css";
import { ElInputNumber } from "element-plus/es/components/input-number/index";
import "element-plus/es/components/input-number/style/css";
import { ElOption, ElSelect } from "element-plus/es/components/select/index";
import "element-plus/es/components/select/style/css";
import { ElTag } from "element-plus/es/components/tag/index";
import "element-plus/es/components/tag/style/css";
import { computed, ref } from "vue";
import { zh as t } from "../../constants/zh.ts";
import type { JSONSchema, ObjectJSONSchema } from "../../types/json-schema.ts";
import { isBooleanSchema, withObjectSchema } from "../../types/json-schema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";

type Property = "enum" | "minLength" | "maxLength" | "pattern" | "format";

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

const enumValue = ref("");

const minLength = computed(() =>
  withObjectSchema(props.schema, (schema) => schema.minLength, undefined),
);
const maxLength = computed(() =>
  withObjectSchema(props.schema, (schema) => schema.maxLength, undefined),
);
const pattern = computed(() =>
  withObjectSchema(props.schema, (schema) => schema.pattern, undefined),
);
const format = computed(() =>
  withObjectSchema(props.schema, (schema) => schema.format, undefined),
);
const enumValues = computed(() =>
  withObjectSchema(
    props.schema,
    (schema) => (schema.enum as string[]) || [],
    [],
  ),
);

const handleValidationChange = (property: Property, value: unknown) => {
  const baseSchema = isBooleanSchema(props.schema)
    ? { type: "string" as const }
    : JSON.parse(JSON.stringify(props.schema));
  const {
    type: _type,
    description: _description,
    ...validationProps
  } = baseSchema;
  emit("change", {
    ...validationProps,
    type: "string",
    [property]: value,
  } as ObjectJSONSchema);
};

const handleAddEnumValue = () => {
  const value = enumValue.value.trim();
  if (!value || enumValues.value.includes(value)) return;
  handleValidationChange("enum", [...enumValues.value, value]);
  enumValue.value = "";
};

const handleRemoveEnumValue = (index: number) => {
  const next = [...enumValues.value];
  next.splice(index, 1);
  handleValidationChange("enum", next.length ? next : undefined);
};

const findError = (path: string) =>
  props.validationNode?.validation.errors?.find(
    (error) => error.path[0] === path,
  )?.message;

const minMaxError = computed(() => findError("length"));
const minLengthError = computed(() => findError("minLength"));
const maxLengthError = computed(() => findError("maxLength"));
const patternError = computed(() => findError("pattern"));
const formatError = computed(() => findError("format"));

const formatOptions = computed(() => [
  { label: t.stringFormatNone, value: "none" },
  { label: t.stringFormatDateTime, value: "date-time" },
  { label: t.stringFormatDate, value: "date" },
  { label: t.stringFormatTime, value: "time" },
  { label: t.stringFormatEmail, value: "email" },
  { label: t.stringFormatUri, value: "uri" },
  { label: t.stringFormatUuid, value: "uuid" },
  { label: t.stringFormatHostname, value: "hostname" },
  { label: t.stringFormatIpv4, value: "ipv4" },
  { label: t.stringFormatIpv6, value: "ipv6" },
]);

const needsDetail = computed(
  () =>
    !props.readOnly ||
    minLength.value !== undefined ||
    maxLength.value !== undefined ||
    pattern.value !== undefined ||
    format.value !== undefined ||
    enumValues.value.length > 0,
);
</script>

<template>
  <div class="schema-type-editor">
    <p v-if="readOnly && !needsDetail" class="schema-type-editor__empty">{{ t.stringNoConstraint }}</p>

    <div v-if="!readOnly || minLength !== undefined || maxLength !== undefined" class="schema-type-editor__grid">
      <div v-if="!readOnly || minLength !== undefined" class="schema-type-editor__field">
        <label :class="{ 'is-error': !!minMaxError || !!minLengthError }">{{ t.stringMinimumLengthLabel }}</label>
        <el-input-number
          :model-value="minLength ?? null"
          :min="0"
          :disabled="readOnly"
          :class="{ 'is-error': !!minMaxError || !!minLengthError }"
          size="small"
          controls-position="right"
          :placeholder="t.stringMinimumLengthPlaceholder"
          @update:model-value="(value: number | undefined) => handleValidationChange('minLength', value)"
        />
      </div>

      <div v-if="!readOnly || maxLength !== undefined" class="schema-type-editor__field">
        <label :class="{ 'is-error': !!minMaxError || !!maxLengthError }">{{ t.stringMaximumLengthLabel }}</label>
        <el-input-number
          :model-value="maxLength ?? null"
          :min="0"
          :disabled="readOnly"
          :class="{ 'is-error': !!minMaxError || !!maxLengthError }"
          size="small"
          controls-position="right"
          :placeholder="t.stringMaximumLengthPlaceholder"
          @update:model-value="(value: number | undefined) => handleValidationChange('maxLength', value)"
        />
      </div>

      <p v-if="minMaxError || minLengthError || maxLengthError" class="schema-type-editor__error schema-type-editor__grid-full">
        {{ [minMaxError, minLengthError ?? maxLengthError].filter(Boolean).join("\n") }}
      </p>
    </div>

    <div v-if="!readOnly || pattern !== undefined" class="schema-type-editor__field">
      <label :class="{ 'is-error': !!patternError }">{{ t.stringPatternLabel }}</label>
      <el-input
        :model-value="pattern || ''"
        size="small"
        :placeholder="t.stringPatternPlaceholder"
        :class="{ 'is-error': !!patternError }"
        @update:model-value="(value: string) => handleValidationChange('pattern', value || undefined)"
      />
      <p v-if="patternError" class="schema-type-editor__error">{{ patternError }}</p>
    </div>

    <div v-if="!readOnly || format !== undefined" class="schema-type-editor__field">
      <label :class="{ 'is-error': !!formatError }">{{ t.stringFormatLabel }}</label>
      <el-select
        :model-value="format || 'none'"
        size="small"
        :placeholder="t.stringFormatSelectPlaceholder"
        @update:model-value="(value: string) => handleValidationChange('format', value === 'none' ? undefined : value)"
      >
        <el-option v-for="option in formatOptions" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
      <p v-if="formatError" class="schema-type-editor__error">{{ formatError }}</p>
    </div>

    <div v-if="!readOnly || enumValues.length > 0" class="schema-type-editor__section">
      <label>{{ t.stringAllowedValuesEnumLabel }}</label>
      <div class="schema-type-editor__tags">
        <el-tag
          v-for="(value, index) in enumValues"
          :key="`enum-string-${value}`"
          closable
          size="small"
          @close="handleRemoveEnumValue(index)"
        >
          {{ value }}
        </el-tag>
        <span v-if="enumValues.length === 0" class="schema-type-editor__hint">
          {{ t.stringAllowedValuesEnumNone }}
        </span>
      </div>
      <div class="schema-type-editor__inline">
        <el-input
          v-model="enumValue"
          size="small"
          :placeholder="t.stringAllowedValuesEnumAddPlaceholder"
          @keydown.enter="handleAddEnumValue"
        />
        <el-button size="small" @click="handleAddEnumValue">
          {{ t.stringAllowedValuesEnumAddLabel }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schema-type-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schema-type-editor__empty,
.schema-type-editor__hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-style: italic;
}

.schema-type-editor__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.schema-type-editor__grid-full {
  grid-column: 1 / -1;
}

.schema-type-editor__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.schema-type-editor__field label,
.schema-type-editor__section > label {
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-weight: 500;
}

.schema-type-editor__field label.is-error,
.schema-type-editor__error {
  color: var(--el-color-danger);
}

.schema-type-editor__error {
  margin: 0;
  font-size: 12px;
  font-style: italic;
  white-space: pre-line;
}

.schema-type-editor__field :deep(.el-input-number),
.schema-type-editor__field :deep(.el-select) {
  width: 100%;
}

.schema-type-editor__field :deep(.is-error .el-input__wrapper),
.schema-type-editor__field :deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

.schema-type-editor__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}

.schema-type-editor__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.schema-type-editor__inline {
  display: flex;
  gap: 8px;
}

.schema-type-editor__inline :deep(.el-input) {
  flex: 1;
}

@media (max-width: 640px) {
  .schema-type-editor__grid {
    grid-template-columns: 1fr;
  }
}
</style>
