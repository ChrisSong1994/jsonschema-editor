<script setup lang="ts">
import {
  ElOption,
  ElSelect,
} from "element-plus/es/components/select/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/select/style/css";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    options: { label: string; value: string }[];
    placeholder?: string;
    id?: string;
    class?: string;
  }>(),
  {},
);

const model = defineModel<string>();

const value = computed({
  get: () => model.value ?? "",
  set: (v: string) => (model.value = v),
});
</script>

<template>
  <ElSelect
    v-model="value"
    :placeholder="props.placeholder"
    :id="props.id"
    :class="props.class"
    class="w-full"
  >
    <ElOption
      v-for="opt in props.options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </ElSelect>
</template>