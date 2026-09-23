<template>
  <div
    ref="editorContainer"
    class="json-editor"
    :style="{ height: computedHeight }"
  ></div>
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { isDark } from "../composables/useDarkMode.ts";
import { initMonacoWorker } from "../utils/monacoWorker.ts";

/**
 * JSON 编辑器：直接封装 monaco-editor，
 * 内置 JSON 语言、格式化与主题跟随能力。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string;
    readOnly?: boolean;
    height?: number | string;
    /** 额外编辑器选项，浅合并覆盖默认值 */
    options?: monaco.editor.IStandaloneEditorConstructionOptions;
  }>(),
  {
    readOnly: false,
    height: 300,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

const editorContainer = ref<HTMLElement | null>(null);
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);

const internalValue = ref(props.modelValue);

const monacoTheme = computed(() => (isDark.value ? "vs-dark" : "vs"));

const computedHeight = computed(() => {
  if (typeof props.height === "number") {
    return `${props.height}px`;
  }
  return props.height || "300px";
});

const getDefaultOptions =
  (): monaco.editor.IStandaloneEditorConstructionOptions => ({
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    roundedSelection: false,
    readOnly: props.readOnly,
    cursorStyle: "line",
    formatOnPaste: true,
    tabSize: 2,
  });

onMounted(() => {
  if (!editorContainer.value) return;

  initMonacoWorker();

  editor.value = monaco.editor.create(editorContainer.value, {
    ...getDefaultOptions(),
    ...props.options,
    value: internalValue.value,
    language: "json",
    theme: monacoTheme.value,
  });

  editor.value.onDidChangeModelContent(() => {
    const value = editor.value?.getValue() || "";
    internalValue.value = value;
    emit("change", value);
    emit("update:modelValue", value);
  });
});

onBeforeUnmount(() => {
  editor.value?.dispose();
  editor.value = null;
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== internalValue.value) {
      internalValue.value = newValue;
      if (editor.value && newValue !== editor.value.getValue()) {
        editor.value.setValue(newValue);
      }
    }
  },
);

watch(
  () => props.readOnly,
  (newReadOnly) => {
    editor.value?.updateOptions({ readOnly: newReadOnly });
  },
);

watch(monacoTheme, (newTheme) => {
  monaco.editor.setTheme(newTheme);
});

const format = () => {
  editor.value?.getAction("editor.action.formatDocument")?.run();
};

defineExpose({
  format,
});
</script>

<style scoped>
.json-editor {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}
</style>
