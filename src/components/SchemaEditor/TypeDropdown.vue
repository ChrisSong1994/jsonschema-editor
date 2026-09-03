<script setup lang="ts">
import {
  ElOption,
  ElSelect,
} from "element-plus/es/components/select/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/select/style/css";
import { computed } from "vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { getTypeColor, getTypeLabel } from "../../lib/utils.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";

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

const t = useTranslation();

const typeOptions: SchemaType[] = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "null",
];

const options = computed(() =>
  typeOptions.map((type) => ({
    value: type,
    label: getTypeLabel(t, type),
    color: getTypeColor(type),
  })),
);

const value = computed<string>({
  get: () => props.modelValue,
  set: (v: string) => emit("update:modelValue", v as SchemaType),
});

const selectedOption = computed(() =>
  options.value.find((o) => o.value === props.modelValue),
);
</script>

<template>
  <ElSelect
    v-model="value"
    :disabled="props.readOnly"
    :class="['text-xs font-medium', props.class]"
    class="w-[110px]"
    popper-class="jscb"
  >
    <template #prefix v-if="selectedOption">
      <span :class="['text-xs font-medium', selectedOption.color]">
        {{ selectedOption.label }}
      </span>
    </template>
    <ElOption
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
      :class="['text-xs font-medium', opt.color]"
    />
  </ElSelect>
</template>