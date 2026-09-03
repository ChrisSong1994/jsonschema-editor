<script setup lang="ts">
import ElTag from "element-plus/es/components/tag/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/tag/style/css";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>(),
  { variant: "default" },
);

const type = computed(() => {
  switch (props.variant) {
    case "destructive":
      return "danger";
    case "secondary":
      return undefined;
    case "outline":
      return "info";
    default:
      return "primary";
  }
});
</script>

<template>
  <ElTag :type="type" :effect="variant === 'outline' ? 'plain' : 'light'">
    <slot />
  </ElTag>
</template>