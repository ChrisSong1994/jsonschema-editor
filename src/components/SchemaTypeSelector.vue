<script setup lang="ts">
import type { LocaleMessages } from "../composables/useI18n.ts";
import type { SchemaType } from "../types/json-schema.ts";

interface TypeOption {
  id: SchemaType;
  label: keyof LocaleMessages;
  description: keyof LocaleMessages;
}

const typeOptions: TypeOption[] = [
  {
    id: "string",
    label: "fieldTypeTextLabel",
    description: "fieldTypeTextDescription",
  },
  {
    id: "number",
    label: "fieldTypeNumberLabel",
    description: "fieldTypeNumberDescription",
  },
  {
    id: "boolean",
    label: "fieldTypeBooleanLabel",
    description: "fieldTypeBooleanDescription",
  },
  {
    id: "object",
    label: "fieldTypeObjectLabel",
    description: "fieldTypeObjectDescription",
  },
  {
    id: "array",
    label: "fieldTypeArrayLabel",
    description: "fieldTypeArrayDescription",
  },
];

defineProps<{
  id?: string;
  modelValue: SchemaType;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: SchemaType];
}>();

import { t } from "../composables/useI18n.ts";
</script>

<template>
  <div :id="id" class="schema-type-selector">
    <button
      v-for="type in typeOptions"
      :key="type.id"
      type="button"
      :title="t[type.description]"
      class="schema-type-selector__item"
      :class="{ 'is-active': modelValue === type.id }"
      @click="emit('update:modelValue', type.id)"
    >
      <div class="schema-type-selector__label">{{ t[type.label] }}</div>
      <div class="schema-type-selector__description">{{ t[type.description] }}</div>
    </button>
  </div>
</template>

<style scoped>
.schema-type-selector {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.schema-type-selector__item {
  padding: 10px;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  text-align: left;
  transition: border-color 0.2s, background-color 0.2s;
}

.schema-type-selector__item:hover,
.schema-type-selector__item.is-active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.schema-type-selector__label {
  font-size: 14px;
  font-weight: 500;
}

.schema-type-selector__description {
  margin-top: 2px;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .schema-type-selector {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .schema-type-selector {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
