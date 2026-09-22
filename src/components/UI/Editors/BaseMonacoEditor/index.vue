<template>
  <div
    class="base-monaco-editor"
    ref="editorContainer"
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
import { isDark } from "@/composables/useDarkMode";
import { initMonacoWorker } from "@/utils/monacoWorker";

/**
 * 共享 Monaco 编辑器基础封装。
 *
 * 统一封装官方 monaco-editor API 的公共样板（worker 初始化、创建/销毁、
 * v-model 同步、只读切换、主题跟随、高度计算），各业务编辑器（SQL/JSON/
 * 表达式等）基于本组件二次封装，避免重复样板。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string;
    language?: string;
    readOnly?: boolean;
    height?: number | string;
    /** 额外编辑器选项，浅合并覆盖默认值 */
    options?: monaco.editor.IStandaloneEditorConstructionOptions;
    /** 自定义主题名，默认跟随 isDark 切换 vs / vs-dark */
    theme?: string;
  }>(),
  {
    language: "plaintext",
    readOnly: false,
    height: 300,
    theme: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
  (e: "mount", editor: monaco.editor.IStandaloneCodeEditor): void;
}>();

const editorContainer = ref<HTMLElement | null>(null);
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);

/** Monaco 主题：跟随 isDark 切换 vs / vs-dark */
const monacoTheme = computed(
  () => props.theme || (isDark.value ? "vs-dark" : "vs"),
);

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
  });

onMounted(() => {
  if (!editorContainer.value) return;

  initMonacoWorker();

  editor.value = monaco.editor.create(editorContainer.value, {
    ...getDefaultOptions(),
    ...props.options,
    value: props.modelValue,
    language: props.language,
    theme: monacoTheme.value,
  });

  editor.value.onDidChangeModelContent(() => {
    const value = editor.value?.getValue() || "";
    // 先发 change 再发 update:modelValue，对齐 monaco-editor-vue3 的事件顺序，
    // 保证依赖「change 时 v-model 尚未更新」的撤销等逻辑（如 AiExpressGenerater）行为一致
    emit("change", value);
    emit("update:modelValue", value);
  });

  emit("mount", editor.value);
});

onBeforeUnmount(() => {
  editor.value?.dispose();
  editor.value = null;
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && newValue !== editor.value.getValue()) {
      editor.value.setValue(newValue);
    }
  },
);

watch(
  () => props.readOnly,
  (newReadOnly) => {
    editor.value?.updateOptions({ readOnly: newReadOnly });
  },
);

watch(
  () => props.language,
  (newLanguage) => {
    if (editor.value) {
      monaco.editor.setModelLanguage(
        editor.value.getModel() as monaco.editor.ITextModel,
        newLanguage,
      );
    }
  },
);

// 主题切换：监听暗黑模式或自定义主题变化
watch(
  () => monacoTheme.value,
  (newTheme) => {
    monaco.editor.setTheme(newTheme);
  },
);

const getEditor = () => editor.value;
const getValue = () => editor.value?.getValue() || "";
const setValue = (value: string) => editor.value?.setValue(value);
const focus = () => editor.value?.focus();
const format = () => {
  editor.value?.getAction("editor.action.formatDocument")?.run();
};

defineExpose({
  getEditor,
  getValue,
  setValue,
  focus,
  format,
});
</script>
<style scoped lang="css">
.base-monaco-editor {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}
</style>
