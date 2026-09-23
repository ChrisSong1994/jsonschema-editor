<script setup lang="ts">
import { computed } from "vue";
import { t } from "../composables/useI18n.ts";
import { useSchemaStore } from "../composables/useSchemaStore.ts";
import { getSchemaProperties } from "../lib/schema-editor.ts";
import type { JSONSchema } from "../types/json-schema.ts";
import { buildValidationTree } from "../types/validation.ts";
import SchemaPropertyEditor from "./SchemaPropertyEditor.vue";

const props = withDefaults(
  defineProps<{
    path: string[];
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

const store = useSchemaStore();

const parentSchema = computed<JSONSchema>(() => {
  if (props.path.length === 0) return store.schema.value;
  return (
    store.getAtPath(props.path) ?? { type: "object" as const, properties: {} }
  );
});

const properties = computed(() => getSchemaProperties(parentSchema.value));

const validationTree = computed(() =>
  buildValidationTree(parentSchema.value, t.value),
);
</script>

<template>
  <div class="schema-field-list">
    <SchemaPropertyEditor
      v-for="property in properties"
      :key="property.name"
      :path="path"
      :name="property.name"
      :schema="property.schema"
      :required="property.required"
      :validation-node="validationTree.children[property.name] ?? undefined"
      :read-only="readOnly"
    />
  </div>
</template>

<style scoped>
.schema-field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
