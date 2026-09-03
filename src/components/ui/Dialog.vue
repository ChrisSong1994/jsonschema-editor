<script setup lang="ts">
import ElDialog from "element-plus/es/components/dialog/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/dialog/style/css";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    header?: string;
    modal?: boolean;
    class?: string;
  }>(),
  { modal: true },
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();
</script>

<template>
  <ElDialog
    :model-value="props.visible"
    :title="props.header"
    :modal="props.modal"
    :class="props.class"
    class="jsonschema-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </ElDialog>
</template>