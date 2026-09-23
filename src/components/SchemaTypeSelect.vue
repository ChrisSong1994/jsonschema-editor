<script setup lang="ts">
import { ElOption, ElSelect, ElTag } from "element-plus";
import { computed } from "vue";
import {
  getSchemaTypeClass,
  getSchemaTypeLabel,
  getSchemaTypeTagType,
} from "../lib/schema-types.ts";
import type { SchemaType } from "../types/json-schema.ts";

const props = withDefaults(
  defineProps<{
    modelValue: SchemaType;
    class?: string;
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

const emit = defineEmits<{
  "update:modelValue": [value: SchemaType];
}>();

const typeOptions: SchemaType[] = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "null",
];

const options = computed(() =>
  typeOptions.map((type) => ({
    value: type,
    label: getSchemaTypeLabel(type),
    tagType: getSchemaTypeTagType(type),
    className: getSchemaTypeClass(type),
  })),
);
</script>

<template>
  <el-select
    :model-value="modelValue"
    :disabled="readOnly"
    size="small"
    class="schema-type-select"
    :class="props.class"
    popper-class="schema-type-select-popper"
    @update:model-value="emit('update:modelValue', $event as SchemaType)"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    >
      <el-tag size="small" :type="option.tagType" effect="light">
        {{ option.label }}
      </el-tag>
    </el-option>
    <template #label>
      <span class="schema-type-select__empty-label" />
    </template>
    <template #prefix>
      <el-tag
        size="small"
        :type="getSchemaTypeTagType(modelValue)"
        effect="light"
        class="schema-type-select__value"
      >
        {{ getSchemaTypeLabel(modelValue) }}
      </el-tag>
    </template>
  </el-select>
</template>

<style scoped>
.schema-type-select {
  min-width: 96px;
}

.schema-type-select__value {
  margin-right: 4px;
}
</style>
