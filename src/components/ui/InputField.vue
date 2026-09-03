<script setup lang="ts">
import ElInput from "element-plus/es/components/input/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/input/style/css";

const props = defineProps<{
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
  min?: number;
  step?: number | string;
  required?: boolean;
  autofocus?: boolean;
}>();

const model = defineModel<string>();

const emit = defineEmits<{
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  focus: [event: FocusEvent];
}>();
</script>

<template>
  <ElInput
    v-model="model"
    :id="props.id"
    :type="props.type"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :class="props.class"
    :min="props.min"
    :step="props.step"
    :required="props.required"
    :autofocus="props.autofocus"
    @blur="emit('blur', $event)"
    @keydown="emit('keydown', $event as KeyboardEvent)"
    @focus="emit('focus', $event)"
    class="w-full"
  />
</template>