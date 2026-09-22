<script setup lang="ts">
import { ChevronDown, ChevronRight, X } from "@lucide/vue";
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { ElInput } from "element-plus/es/components/input/index";
import "element-plus/es/components/input/style/css";
import { ElTag } from "element-plus/es/components/tag/index";
import "element-plus/es/components/tag/style/css";
import { computed, ref } from "vue";
import { useSchemaStore } from "../composables/useSchemaStore.ts";
import { zh as t } from "../constants/zh.ts";
import { normalizeSchemaType } from "../lib/schema-types.ts";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../types/json-schema.ts";
import {
  getSchemaDescription,
  withObjectSchema,
} from "../types/json-schema.ts";
import type { ValidationTreeNode } from "../types/validation.ts";
import SchemaTypeSelect from "./SchemaTypeSelect.vue";
import TypeEditor from "./TypeEditor.vue";

const props = withDefaults(
  defineProps<{
    path: string[];
    name: string;
    schema: JSONSchema;
    required?: boolean;
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
  }>(),
  { required: false, readOnly: false, depth: 0 },
);

const store = useSchemaStore();
const expanded = ref(false);
const isEditingName = ref(false);
const isEditingDesc = ref(false);
const tempName = ref("");
const tempDesc = ref("");

const displayName = computed(() => props.name);
const displayDesc = computed(() => getSchemaDescription(props.schema));

const type = computed<SchemaType>(() =>
  withObjectSchema(
    props.schema,
    (schema) => normalizeSchemaType(schema.type),
    "object",
  ),
);

const startEditingName = () => {
  if (props.readOnly) return;
  tempName.value = props.name;
  isEditingName.value = true;
};

const startEditingDesc = () => {
  if (props.readOnly) return;
  tempDesc.value = getSchemaDescription(props.schema);
  isEditingDesc.value = true;
};

const handleNameSubmit = () => {
  const trimmedName = tempName.value.trim();
  if (trimmedName && trimmedName !== props.name) {
    store.renameProperty(props.path, props.name, trimmedName);
  } else {
    tempName.value = props.name;
  }
  isEditingName.value = false;
};

const handleDescSubmit = () => {
  const currentDescription = getSchemaDescription(props.schema);
  const trimmedDesc = tempDesc.value.trim();
  if (trimmedDesc !== currentDescription) {
    const currentSchema = store.getAtPath([...props.path, props.name]);
    const plain = JSON.parse(
      JSON.stringify(currentSchema ?? { type: "object" }),
    );
    plain.description = trimmedDesc || undefined;
    store.updateProperty(props.path, props.name, plain);
  } else {
    tempDesc.value = currentDescription;
  }
  isEditingDesc.value = false;
};

const handleSchemaUpdate = (updatedSchema: ObjectJSONSchema) => {
  const description = getSchemaDescription(props.schema);
  const plain = JSON.parse(JSON.stringify(updatedSchema));
  plain.description = description || undefined;
  store.updateProperty(props.path, props.name, plain);
};

const handleTypeChange = (newType: SchemaType) => {
  const currentSchema = store.getAtPath([...props.path, props.name]);
  const plain = JSON.parse(JSON.stringify(currentSchema ?? { type: "object" }));
  plain.type = newType;
  store.updateProperty(props.path, props.name, plain);
};

const handleRequiredToggle = () => {
  if (props.readOnly) return;
  store.setPropertyRequired(props.path, props.name, !props.required);
};

const handleDelete = () => {
  store.deleteProperty(props.path, props.name);
};

const handleInputFocus = (event: FocusEvent) => {
  const input = event.target as HTMLInputElement | null;
  input?.select();
};
</script>

<template>
  <div class="schema-property" :class="{ 'schema-property--nested': depth > 0 }">
    <div class="schema-property__row">
      <el-button
        text
        circle
        class="schema-property__expand"
        :aria-label="expanded ? t.collapse : t.expand"
        @click="expanded = !expanded"
      >
        <ChevronDown v-if="expanded" :size="18" />
        <ChevronRight v-else :size="18" />
      </el-button>

      <div class="schema-property__main">
        <div class="schema-property__identity">
          <el-input
            v-if="!readOnly && isEditingName"
            v-model="tempName"
            class="schema-property__name-input"
            size="small"
            @blur="handleNameSubmit"
            @keydown.enter="handleNameSubmit"
            @focus="handleInputFocus"
          />
          <button
            v-else
            type="button"
            class="schema-property__name"
            @click="startEditingName"
            @keydown.enter="startEditingName"
          >
            {{ displayName }}
          </button>

          <el-input
            v-if="!readOnly && isEditingDesc"
            v-model="tempDesc"
            class="schema-property__desc-input"
            size="small"
            :placeholder="t.propertyDescriptionPlaceholder"
            @blur="handleDescSubmit"
            @keydown.enter="handleDescSubmit"
            @focus="handleInputFocus"
          />
          <button
            v-else
            type="button"
            class="schema-property__description"
            :class="{ 'is-empty': !displayDesc }"
            @click="startEditingDesc"
            @keydown.enter="startEditingDesc"
          >
            {{ displayDesc || t.propertyDescriptionButton }}
          </button>
        </div>

        <div class="schema-property__actions">
          <SchemaTypeSelect
            :model-value="type"
            :read-only="readOnly"
            @update:model-value="handleTypeChange"
          />
          <el-button
            size="small"
            :type="required ? 'danger' : 'info'"
            plain
            @click="handleRequiredToggle"
          >
            {{ required ? t.propertyRequired : t.propertyOptional }}
          </el-button>
        </div>
      </div>

      <el-tag
        v-if="validationNode?.cumulativeChildrenErrors"
        type="danger"
        size="small"
        round
        class="schema-property__error-count"
      >
        {{ validationNode.cumulativeChildrenErrors }}
      </el-tag>

      <el-button
        v-if="!readOnly"
        text
        type="danger"
        circle
        class="schema-property__delete"
        :aria-label="t.propertyDelete"
        @click="handleDelete"
      >
        <X :size="16" />
      </el-button>
    </div>

    <div v-if="expanded" class="schema-property__editor">
      <p v-if="readOnly && displayDesc" class="schema-property__readonly-description">
        {{ displayDesc }}
      </p>
      <TypeEditor
        :schema="schema"
        :path="[...path, name]"
        :read-only="readOnly"
        :validation-node="validationNode"
        :depth="depth + 1"
        @change="handleSchemaUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.schema-property {
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  transition: border-color 0.2s, background-color 0.2s;
}

.schema-property:hover {
  border-color: var(--el-color-primary-light-5);
}

.schema-property--nested {
  margin-left: 16px;
}

.schema-property__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px 12px;
}

.schema-property__expand {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.schema-property__main {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.schema-property__identity {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.schema-property__name-input {
  width: 160px;
}

.schema-property__name {
  max-width: 240px;
  overflow: hidden;
  padding: 4px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
}

.schema-property__name:hover,
.schema-property__description:hover {
  background: var(--el-fill-color-light);
}

.schema-property__desc-input {
  flex: 1;
  min-width: 140px;
}

.schema-property__description {
  max-width: 260px;
  overflow: hidden;
  padding: 4px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-style: italic;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
}

.schema-property__description.is-empty {
  opacity: 0;
}

.schema-property:hover .schema-property__description.is-empty {
  opacity: 1;
}

.schema-property__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.schema-property__error-count {
  flex-shrink: 0;
}

.schema-property__delete {
  flex-shrink: 0;
  opacity: 0;
}

.schema-property:hover .schema-property__delete {
  opacity: 1;
}

.schema-property__editor {
  padding: 4px 12px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.schema-property__readonly-description {
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 640px) {
  .schema-property__row,
  .schema-property__main,
  .schema-property__identity {
    align-items: flex-start;
    flex-direction: column;
  }

  .schema-property__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .schema-property__description,
  .schema-property__name {
    max-width: 100%;
  }
}
</style>
