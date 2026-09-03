<script setup lang="ts">
import ElButton from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { cn } from "../../lib/utils.ts";

defineProps<{
  class?: string;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <ElButton
    type="primary"
    text
    size="small"
    native-type="button"
    :class="cn('text-xs px-2 py-1 min-w-[80px] whitespace-nowrap', $props.class)"
    @click="emit('click', $event)"
  >
    <slot />
  </ElButton>
</template>
