<script setup lang="ts">
import {
  ElTabPane,
  ElTabs,
} from "element-plus/es/components/tabs/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/tabs/style/css";

const props = defineProps<{
  tabs: { value: string; label: string }[];
  class?: string;
}>();

const model = defineModel<string>();
</script>

<template>
  <ElTabs v-model="model" :class="props.class" class="w-full">
    <ElTabPane
      v-for="tab in props.tabs"
      :key="tab.value"
      :name="tab.value"
      :label="tab.label"
    >
      <slot :name="tab.value" />
    </ElTabPane>
  </ElTabs>
</template>