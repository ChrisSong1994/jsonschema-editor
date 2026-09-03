<script setup lang="ts">
import ElSwitch from "element-plus/es/components/switch/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/switch/style/css";

const props = defineProps<{
  id?: string;
  disabled?: boolean;
}>();

const model = defineModel<boolean>();
</script>

<template>
  <ElSwitch
    v-model="model"
    :id="props.id"
    :disabled="props.disabled"
  />
</template>