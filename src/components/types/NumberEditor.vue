<script setup lang="ts">
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { ElInputNumber } from "element-plus/es/components/input-number/index";
import "element-plus/es/components/input-number/style/css";
import { ElTag } from "element-plus/es/components/tag/index";
import "element-plus/es/components/tag/style/css";
import { computed, ref } from "vue";
import { zh as t } from "../../constants/zh.ts";
import type { JSONSchema, ObjectJSONSchema } from "../../types/json-schema.ts";
import { isBooleanSchema, withObjectSchema } from "../../types/json-schema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";

type Property =
  | "minimum"
  | "maximum"
  | "exclusiveMinimum"
  | "exclusiveMaximum"
  | "multipleOf"
  | "enum";

const props = withDefaults(
  defineProps<{
    schema: JSONSchema;
    path: string[];
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
    integer?: boolean;
  }>(),
  { readOnly: false, depth: 0, integer: false },
);

const emit = defineEmits<{
  change: [schema: ObjectJSONSchema];
}>();

const enumValue = ref<number | null>(null);

const minimum = computed(() =>
  withObjectSchema(props.schema, (schema) => schema.minimum, undefined),
);
const maximum = computed(() =>
  withObjectSchema(props.schema, (schema) => schema.maximum, undefined),
);
const exclusiveMinimum = computed(() =>
  withObjectSchema(
    props.schema,
    (schema) => schema.exclusiveMinimum,
    undefined,
  ),
);
const exclusiveMaximum = computed(() =>
  withObjectSchema(
    props.schema,
    (schema) => schema.exclusiveMaximum,
    undefined,
  ),
);
const multipleOf = computed(() =>
  withObjectSchema(props.schema, (schema) => schema.multipleOf, undefined),
);
const enumValues = computed(() =>
  withObjectSchema(
    props.schema,
    (schema) => (schema.enum as number[]) || [],
    [],
  ),
);

const handleValidationChange = (property: Property, value: unknown) => {
  const baseProperties: Partial<ObjectJSONSchema> = {
    type: props.integer ? "integer" : "number",
  };

  if (!isBooleanSchema(props.schema)) {
    for (const key of [
      "minimum",
      "maximum",
      "exclusiveMinimum",
      "exclusiveMaximum",
      "multipleOf",
    ] as const) {
      if (props.schema[key] !== undefined)
        baseProperties[key] = props.schema[key] as number;
    }
    if (props.schema.enum !== undefined)
      baseProperties.enum = [...props.schema.enum];
  }

  if (value === undefined) {
    delete (baseProperties as Record<string, unknown>)[property];
  } else {
    (baseProperties as Record<string, unknown>)[property] = value;
  }
  emit("change", baseProperties as ObjectJSONSchema);
};

const handleAddEnumValue = () => {
  if (enumValue.value === null || Number.isNaN(enumValue.value)) return;
  const value = props.integer ? Math.floor(enumValue.value) : enumValue.value;
  if (!enumValues.value.includes(value)) {
    handleValidationChange("enum", [...enumValues.value, value]);
  }
  enumValue.value = null;
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

const minMaxError = computed(() => findError("minMax"));
const redundantMinError = computed(() => findError("redundantMinimum"));
const redundantMaxError = computed(() => findError("redundantMaximum"));
const enumError = computed(() => findError("enum"));
const multipleOfError = computed(() => findError("multipleOf"));

const hasConstraint = computed(
  () =>
    minimum.value !== undefined ||
    maximum.value !== undefined ||
    exclusiveMinimum.value !== undefined ||
    exclusiveMaximum.value !== undefined ||
    multipleOf.value !== undefined ||
    enumValues.value.length > 0,
);
</script>

<template>
  <div class="schema-type-editor">
    <p v-if="readOnly && !hasConstraint" class="schema-type-editor__empty">{{ t.numberNoConstraint }}</p>

    <div v-if="!readOnly || hasConstraint" class="schema-type-editor__grid">
      <p v-if="minMaxError || redundantMinError || redundantMaxError || enumError" class="schema-type-editor__error schema-type-editor__grid-full">
        {{ [minMaxError, redundantMinError, redundantMaxError, enumError].filter(Boolean).join("\n") }}
      </p>

      <div v-if="!readOnly || minimum !== undefined" class="schema-type-editor__field">
        <label :class="{ 'is-error': minimum !== undefined && (!!minMaxError || !!redundantMinError) }">
          {{ t.numberMinimumLabel }}
        </label>
        <el-input-number
          :model-value="minimum ?? null"
          :step="integer ? 1 : undefined"
          :disabled="readOnly"
          size="small"
          controls-position="right"
          :class="{ 'is-error': minimum !== undefined && (!!minMaxError || !!redundantMinError) }"
          :placeholder="t.numberMinimumPlaceholder"
          @update:model-value="(value: number | undefined) => handleValidationChange('minimum', value)"
        />
      </div>

      <div v-if="!readOnly || maximum !== undefined" class="schema-type-editor__field">
        <label :class="{ 'is-error': maximum !== undefined && (!!minMaxError || !!redundantMaxError) }">
          {{ t.numberMaximumLabel }}
        </label>
        <el-input-number
          :model-value="maximum ?? null"
          :step="integer ? 1 : undefined"
          :disabled="readOnly"
          size="small"
          controls-position="right"
          :class="{ 'is-error': maximum !== undefined && (!!minMaxError || !!redundantMaxError) }"
          :placeholder="t.numberMaximumPlaceholder"
          @update:model-value="(value: number | undefined) => handleValidationChange('maximum', value)"
        />
      </div>
    </div>

    <div v-if="!readOnly || exclusiveMinimum !== undefined || exclusiveMaximum !== undefined" class="schema-type-editor__grid">
      <div v-if="!readOnly || exclusiveMinimum !== undefined" class="schema-type-editor__field">
        <label>{{ t.numberExclusiveMinimumLabel }}</label>
        <el-input-number
          :model-value="exclusiveMinimum ?? null"
          :step="integer ? 1 : undefined"
          :disabled="readOnly"
          size="small"
          controls-position="right"
          :placeholder="t.numberExclusiveMinimumPlaceholder"
          @update:model-value="(value: number | undefined) => handleValidationChange('exclusiveMinimum', value)"
        />
      </div>
      <div v-if="!readOnly || exclusiveMaximum !== undefined" class="schema-type-editor__field">
        <label>{{ t.numberExclusiveMaximumLabel }}</label>
        <el-input-number
          :model-value="exclusiveMaximum ?? null"
          :step="integer ? 1 : undefined"
          :disabled="readOnly"
          size="small"
          controls-position="right"
          :placeholder="t.numberExclusiveMaximumPlaceholder"
          @update:model-value="(value: number | undefined) => handleValidationChange('exclusiveMaximum', value)"
        />
      </div>
    </div>

    <div v-if="!readOnly || multipleOf !== undefined" class="schema-type-editor__field">
      <label :class="{ 'is-error': !!multipleOfError }">{{ t.numberMultipleOfLabel }}</label>
      <el-input-number
        :model-value="multipleOf ?? null"
        :min="0"
        :step="integer ? 1 : undefined"
        :disabled="readOnly"
        size="small"
        controls-position="right"
        :class="{ 'is-error': !!multipleOfError }"
        :placeholder="t.numberMultipleOfPlaceholder"
        @update:model-value="(value: number | undefined) => handleValidationChange('multipleOf', value)"
      />
      <p v-if="multipleOfError" class="schema-type-editor__error">{{ multipleOfError }}</p>
    </div>

    <div v-if="!readOnly || enumValues.length > 0" class="schema-type-editor__section">
      <label :class="{ 'is-error': !!enumError }">{{ t.numberAllowedValuesEnumLabel }}</label>
      <div class="schema-type-editor__tags">
        <el-tag
          v-for="(value, index) in enumValues"
          :key="`enum-number-${value}`"
          closable
          size="small"
          @close="handleRemoveEnumValue(index)"
        >
          {{ value }}
        </el-tag>
        <span v-if="enumValues.length === 0" class="schema-type-editor__hint">
          {{ t.numberAllowedValuesEnumNone }}
        </span>
      </div>
      <div class="schema-type-editor__inline">
        <el-input-number
          v-model="enumValue"
          :step="integer ? 1 : undefined"
          size="small"
          controls-position="right"
          :placeholder="t.numberAllowedValuesEnumAddPlaceholder"
          @keydown.enter="handleAddEnumValue"
        />
        <el-button size="small" @click="handleAddEnumValue">
          {{ t.numberAllowedValuesEnumAddLabel }}
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
.schema-type-editor__section > label.is-error,
.schema-type-editor__error {
  color: var(--el-color-danger);
}

.schema-type-editor__error {
  margin: 0;
  font-size: 12px;
  font-style: italic;
  white-space: pre-line;
}

.schema-type-editor__field :deep(.el-input-number) {
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

.schema-type-editor__inline :deep(.el-input-number) {
  flex: 1;
}

@media (max-width: 640px) {
  .schema-type-editor__grid {
    grid-template-columns: 1fr;
  }
}
</style>
