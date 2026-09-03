<script setup lang="ts">
import { ElTabPane, ElTabs } from "element-plus/es/components/tabs/index";
import "element-plus/es/components/tabs/style/css";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { Check, Clipboard, Code2, Eye } from "lucide-vue-next";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { demoText } from "../utils/demoI18n.ts";
import "highlight.js/styles/github.min.css";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("typescript", typescript);

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
  }>(),
  { language: "vue" },
);

const copiedId = ref(false);
const resultEl = ref<HTMLElement | null>(null);
const cachedHeight = ref(400);
const activeTab = ref("result");

// Track result panel height with ResizeObserver
let observer: ResizeObserver | null = null;

watch(resultEl, (el, _, onCleanup) => {
  if (el) {
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) cachedHeight.value = h;
      }
    });
    observer.observe(el);
    // Immediate measure
    if (el.offsetHeight > 0) cachedHeight.value = el.offsetHeight;

    onCleanup(() => {
      observer?.disconnect();
      observer = null;
    });
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

const highlightedCode = computed(() => {
  const lang = props.language === "vue" ? "xml" : props.language;
  try {
    return hljs.highlight(props.code.trim(), { language: lang }).value;
  } catch {
    return props.code.trim();
  }
});

const copyCode = () => {
  navigator.clipboard.writeText(props.code.trim());
  copiedId.value = true;
  setTimeout(() => {
    copiedId.value = false;
  }, 1500);
};
</script>

<template>
  <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card">
    <div class="relative">
      <button
        type="button"
        @click="copyCode"
        class="absolute right-3 top-2 z-10 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <Check v-if="copiedId" :size="12" class="text-green-500" />
        <Clipboard v-else :size="12" />
        {{ demoText.copy }}
      </button>
      <ElTabs v-model="activeTab" class="w-full">
        <ElTabPane name="result" class="!p-0">
          <template #label>
            <span class="flex items-center gap-1.5"><Eye :size="13" /> {{ demoText.resultTab }}</span>
          </template>
          <div ref="resultEl">
            <slot />
          </div>
        </ElTabPane>
        <ElTabPane name="code" class="!p-0">
          <template #label>
            <span class="flex items-center gap-1.5"><Code2 :size="13" /> {{ demoText.codeTab }}</span>
          </template>
          <div
            class="overflow-auto bg-muted"
            :style="{ height: cachedHeight + 'px' }"
          >
            <pre class="px-5 py-4 text-[13px] leading-relaxed"><code class="hljs" v-html="highlightedCode" /></pre>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>
