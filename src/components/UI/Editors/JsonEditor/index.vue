<template>
  <BaseMonacoEditor
    ref="baseRef"
    v-model="internalValue"
    language="json"
    :read-only="readOnly"
    :height="height"
    :options="editorOptions"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type BaseMonacoEditor from "@/components/UI/Editors/BaseMonacoEditor/index.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    readOnly?: boolean;
    height?: number | string;
  }>(),
  {
    readOnly: false,
    height: 300,
  },
);

const emit = defineEmits<(e: "update:modelValue", value: string) => void>();

const baseRef = ref<InstanceType<typeof BaseMonacoEditor> | null>(null);
const internalValue = ref(props.modelValue);

const editorOptions = {
  formatOnPaste: true,
  tabSize: 2,
};

const handleChange = (value: string | undefined) => {
  emit("update:modelValue", value || "");
};

// 监听外部值变化，同步内部状态
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== internalValue.value) {
      internalValue.value = newValue;
    }
  },
);

/** 格式化 JSON 内容 */
const format = () => {
  baseRef.value?.format();
};

defineExpose({
  format,
});
</script>
