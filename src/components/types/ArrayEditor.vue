<script setup lang="ts">
import { ElInputNumber } from "element-plus/es/components/input-number/index";
import "element-plus/es/components/input-number/style/css";
import { ElSwitch } from "element-plus/es/components/switch/index";
import "element-plus/es/components/switch/style/css";
import { computed, ref } from "vue";
import { zh as t } from "../../constants/zh.ts";
import { getArrayItemsSchema } from "../../lib/schema-editor.ts";
import { normalizeSchemaType } from "../../lib/schema-types.ts";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/json-schema.ts";
import { isBooleanSchema, withObjectSchema } from "../../types/json-schema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import SchemaTypeSelect from "../SchemaTypeSelect.vue";
import TypeEditor from "../TypeEditor.vue";

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

const minItems = ref<number | null>(
  withObjectSchema(props.schema, (schema) => schema.minItems ?? null, null),
);
const maxItems = ref<number | null>(
  withObjectSchema(props.schema, (schema) => schema.maxItems ?? null, null),
);
const uniqueItems = ref(
  withObjectSchema(
    props.schema,
    (schema) => schema.uniqueItems || false,
    false,
  ),
);

const itemsSchema = computed<JSONSchema>(
  () => getArrayItemsSchema(props.schema) || { type: "string" },
);
const itemType = computed<SchemaType>(() =>
  withObjectSchema(
    itemsSchema.value,
    (schema) => normalizeSchemaType(schema.type),
    "string",
  ),
);

const buildValidationProps = (
  overrides: {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
  } = {},
) => {
  const base = isBooleanSchema(props.schema)
    ? {}
    : JSON.parse(JSON.stringify(props.schema));
  const result: ObjectJSONSchema = {
    type: "array",
    ...base,
    minItems: overrides.minItems ?? minItems.value ?? undefined,
    maxItems: overrides.maxItems ?? maxItems.value ?? undefined,
    uniqueItems: (overrides.uniqueItems ?? uniqueItems.value) || undefined,
  };

  if (result.items === undefined && itemsSchema.value)
    result.items = itemsSchema.value;
  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value !== undefined),
  ) as ObjectJSONSchema;
};

const handleItemSchemaChange = (updatedItemSchema: ObjectJSONSchema) => {
  const base = isBooleanSchema(props.schema)
    ? {}
    : JSON.parse(JSON.stringify(props.schema));
  emit("change", { type: "array", ...base, items: updatedItemSchema });
};

const handleItemTypeChange = (newType: SchemaType) => {
  const currentItems = itemsSchema.value;
  const plain = isBooleanSchema(currentItems)
    ? {}
    : JSON.parse(JSON.stringify(currentItems));
  handleItemSchemaChange({ ...plain, type: newType });
};

const findError = (path: string) =>
  props.validationNode?.validation.errors?.find(
    (error) => error.path[0] === path,
  )?.message;

const minMaxError = computed(() => findError("minmax"));
const minItemsError = computed(() => findError("minItems"));
const maxItemsError = computed(() => findError("maxItems"));
</script>

<template>
  <div class="schema-type-editor">
    <div v-if="!readOnly || minItems !== null || maxItems !== null" class="schema-type-editor__grid">
      <div v-if="!readOnly || minItems !== null" class="schema-type-editor__field">
        <label :class="{ 'is-error': !!minMaxError || !!minItemsError }">{{ t.arrayMinimumLabel }}</label>
        <el-input-number
          v-model="minItems"
          :min="0"
          :disabled="readOnly"
          size="small"
          controls-position="right"
          :class="{ 'is-error': !!minMaxError || !!minItemsError }"
          :placeholder="t.arrayMinimumPlaceholder"
          @change="emit('change', buildValidationProps())"
        />
      </div>
      <div v-if="!readOnly || maxItems !== null" class="schema-type-editor__field">
        <label :class="{ 'is-error': !!minMaxError || !!maxItemsError }">{{ t.arrayMaximumLabel }}</label>
        <el-input-number
          v-model="maxItems"
          :min="0"
          :disabled="readOnly"
          size="small"
          controls-position="right"
          :class="{ 'is-error': !!minMaxError || !!maxItemsError }"
          :placeholder="t.arrayMaximumPlaceholder"
          @change="emit('change', buildValidationProps())"
        />
      </div>
      <p v-if="minMaxError || minItemsError || maxItemsError" class="schema-type-editor__error schema-type-editor__grid-full">
        {{ [minMaxError, minItemsError ?? maxItemsError].filter(Boolean).join("\n") }}
      </p>
    </div>

    <div v-if="!readOnly || uniqueItems" class="schema-type-editor__switch">
      <el-switch
        :model-value="uniqueItems"
        :disabled="readOnly"
        @update:model-value="(checked: string | number | boolean) => { uniqueItems = checked === true; emit('change', buildValidationProps({ uniqueItems: checked === true })); }"
      />
      <span>{{ t.arrayForceUniqueItemsLabel }}</span>
    </div>

    <div class="schema-type-editor__section">
      <div class="schema-type-editor__section-header">
        <label>{{ t.arrayItemTypeLabel }}</label>
        <SchemaTypeSelect
          :model-value="itemType"
          :read-only="readOnly"
          @update:model-value="handleItemTypeChange"
        />
      </div>
      <TypeEditor
        :read-only="readOnly"
        :schema="itemsSchema"
        :path="path"
        :validation-node="validationNode"
        :depth="depth + 1"
        @change="handleItemSchemaChange"
      />
    </div>
  </div>
</template>

<style scoped>
.schema-type-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
.schema-type-editor__section label {
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

.schema-type-editor__field :deep(.el-input-number) {
  width: 100%;
}

.schema-type-editor__field :deep(.is-error .el-input__wrapper),
.schema-type-editor__field :deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

.schema-type-editor__switch,
.schema-type-editor__section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.schema-type-editor__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
}

.schema-type-editor__section-header {
  justify-content: space-between;
}

@media (max-width: 640px) {
  .schema-type-editor__grid {
    grid-template-columns: 1fr;
  }
}
</style>
