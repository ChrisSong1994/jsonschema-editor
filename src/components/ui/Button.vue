<script setup lang="ts">
import ElButton from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    size?: "default" | "sm" | "lg" | "icon";
    type?: "button" | "submit" | "reset";
  }>(),
  { variant: "default", size: "default", type: "button" },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const elType = computed(() => {
  if (props.variant === "destructive") return "danger";
  if (props.variant === "secondary") return undefined;
  return "primary";
});
</script>

<template>
  <ElButton
    :type="elType"
    :plain="variant === 'outline'"
    :text="variant === 'ghost'"
    :link="variant === 'link'"
    :size="size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'default'"
    :native-type="type"
    @click="emit('click', $event)"
  >
    <slot />
  </ElButton>
</template>
