<script setup lang="ts">
import { normalizeSchemaType } from "../lib/schema-types.ts";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../types/json-schema.ts";
import { withObjectSchema } from "../types/json-schema.ts";
import type { ValidationTreeNode } from "../types/validation.ts";
import ArrayEditor from "./types/ArrayEditor.vue";
import BooleanEditor from "./types/BooleanEditor.vue";
import NumberEditor from "./types/NumberEditor.vue";
import ObjectEditor from "./types/ObjectEditor.vue";
// ── 同步导入，不使用 defineAsyncComponent 或 Suspense ──
// 异步组件配合 Suspense 会在切换类型时反复触发组件解析，因此保持同步导入。
import StringEditor from "./types/StringEditor.vue";

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

const emit = defineEmits<{
  change: [schema: ObjectJSONSchema];
}>();

const getType = (): SchemaType =>
  withObjectSchema(props.schema, (s) => normalizeSchemaType(s.type), "string");
</script>

<template>
  <StringEditor
    v-if="getType() === 'string'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
  <NumberEditor
    v-else-if="getType() === 'number'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
  <NumberEditor
    v-else-if="getType() === 'integer'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    :integer="true"
    @change="emit('change', $event)"
  />
  <BooleanEditor
    v-else-if="getType() === 'boolean'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
  <ObjectEditor
    v-else-if="getType() === 'object'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
  />
  <ArrayEditor
    v-else-if="getType() === 'array'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
</template>
