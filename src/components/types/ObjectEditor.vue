<script setup lang="ts">
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { ElEmpty } from "element-plus/es/components/empty/index";
import "element-plus/es/components/empty/style/css";
import { computed } from "vue";
import { useSchemaStore } from "../../composables/useSchemaStore.ts";
import { zh as t } from "../../constants/zh.ts";
import { getSchemaProperties } from "../../lib/schema-editor.ts";
import type { JSONSchema } from "../../types/json-schema.ts";
import { isBooleanSchema } from "../../types/json-schema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import AddFieldDialog from "../AddFieldDialog.vue";
import SchemaPropertyEditor from "../SchemaPropertyEditor.vue";

const props = withDefaults(
  defineProps<{
    schema: JSONSchema;
    path: string[];
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
  }>(),
  { readOnly: false, depth: 0 },
);

const store = useSchemaStore();
const properties = computed(() => getSchemaProperties(props.schema));
const isAdditionalPropertiesForbidden = computed(
  () =>
    !isBooleanSchema(props.schema) &&
    props.schema.additionalProperties === false,
);

const handleAdditionalPropertiesToggle = () => {
  const current = store.getAtPath(props.path);
  if (!current || isBooleanSchema(current)) return;

  const plain = JSON.parse(JSON.stringify(current));
  if (plain.additionalProperties !== false) {
    plain.additionalProperties = false;
  } else {
    delete plain.additionalProperties;
  }

  if (props.path.length > 0) {
    store.updateProperty(
      props.path.slice(0, -1),
      props.path[props.path.length - 1],
      plain,
    );
  } else {
    store.replaceSchema(plain);
  }
};
</script>

<template>
  <div class="schema-object-editor">
    <div v-if="properties.length > 0" class="schema-object-editor__properties">
      <SchemaPropertyEditor
        v-for="property in properties"
        :key="property.name"
        :read-only="readOnly"
        :path="path"
        :name="property.name"
        :schema="property.schema"
        :required="property.required"
        :validation-node="validationNode?.children[property.name]"
        :depth="depth"
      />
    </div>
    <el-empty v-else :description="t.objectPropertiesNone" :image-size="56" />

    <div v-if="!readOnly" class="schema-object-editor__actions">
      <AddFieldDialog :path="path" variant="secondary" />
      <el-button
        size="small"
        :type="isAdditionalPropertiesForbidden ? 'warning' : 'success'"
        plain
        @click="handleAdditionalPropertiesToggle"
      >
        {{ isAdditionalPropertiesForbidden ? t.additionalPropertiesForbid : t.additionalPropertiesAllow }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.schema-object-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schema-object-editor__properties {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schema-object-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.schema-object-editor :deep(.el-empty) {
  padding: 12px 0;
}
</style>
