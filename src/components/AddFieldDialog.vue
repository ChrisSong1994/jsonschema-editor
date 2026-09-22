<script setup lang="ts">
import { CirclePlus, HelpCircle, Info } from "@lucide/vue";
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { ElDialog } from "element-plus/es/components/dialog/index";
import "element-plus/es/components/dialog/style/css";
import { ElInput } from "element-plus/es/components/input/index";
import "element-plus/es/components/input/style/css";
import { ElSwitch } from "element-plus/es/components/switch/index";
import "element-plus/es/components/switch/style/css";
import { ElTag } from "element-plus/es/components/tag/index";
import "element-plus/es/components/tag/style/css";
import { ElTooltip } from "element-plus/es/components/tooltip/index";
import "element-plus/es/components/tooltip/style/css";
import { computed, ref } from "vue";
import { useSchemaStore } from "../composables/useSchemaStore.ts";
import { zh as t } from "../constants/zh.ts";
import type { SchemaType } from "../types/json-schema.ts";
import SchemaTypeSelector from "./SchemaTypeSelector.vue";

const props = withDefaults(
  defineProps<{
    path: string[];
    variant?: "primary" | "secondary";
  }>(),
  { variant: "primary" },
);

const store = useSchemaStore();
const buttonType = computed<"" | "primary">(() =>
  props.variant === "primary" ? "primary" : "",
);

const dialogOpen = ref(false);
const fieldName = ref("");
const fieldType = ref<SchemaType>("string");
const fieldDesc = ref("");
const fieldRequired = ref(false);
const additionalProperties = ref(true);

const resetForm = () => {
  fieldName.value = "";
  fieldType.value = "string";
  fieldDesc.value = "";
  fieldRequired.value = false;
  additionalProperties.value = true;
};

const handleSubmit = () => {
  if (!fieldName.value.trim()) return;

  store.addProperty(props.path, {
    name: fieldName.value.trim(),
    type: fieldType.value,
    description: fieldDesc.value,
    required: fieldRequired.value,
    additionalProperties:
      fieldType.value === "object" ? additionalProperties.value : undefined,
  });

  resetForm();
  dialogOpen.value = false;
};
</script>

<template>
  <el-button
    :type="buttonType"
    size="small"
    @click="dialogOpen = true"
  >
    <CirclePlus :size="16" />
    <span>{{ t.fieldAddNewButton }}</span>
  </el-button>

  <el-dialog
    v-model="dialogOpen"
    width="min(960px, 95vw)"
    class="schema-editor-dialog"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <template #header>
      <div>
        <div class="schema-dialog-title">
          {{ t.fieldAddNewLabel }}
          <el-tag size="small" type="info">{{ t.fieldAddNewBadge }}</el-tag>
        </div>
        <p class="schema-dialog-description">{{ t.fieldAddNewDescription }}</p>
      </div>
    </template>

    <form class="schema-form" @submit.prevent="handleSubmit">
      <div class="schema-form__grid">
        <div class="schema-form__column">
          <div>
            <div class="schema-field-label">
              <label>{{ t.fieldNameLabel }}</label>
              <el-tooltip :content="t.fieldNameTooltip" placement="top">
                <Info :size="16" class="schema-field-label__icon" />
              </el-tooltip>
            </div>
            <el-input
              v-model="fieldName"
              :placeholder="t.fieldNamePlaceholder"
              class="schema-code-input"
              required
            />
          </div>

          <div>
            <div class="schema-field-label">
              <label>{{ t.fieldDescription }}</label>
              <el-tooltip :content="t.fieldDescriptionTooltip" placement="top">
                <Info :size="16" class="schema-field-label__icon" />
              </el-tooltip>
            </div>
            <el-input
              v-model="fieldDesc"
              :placeholder="t.fieldDescriptionPlaceholder"
            />
          </div>

          <div class="schema-form__option">
            <el-switch v-model="fieldRequired" />
            <label>{{ t.fieldRequiredLabel }}</label>
          </div>

          <div v-if="fieldType === 'object'" class="schema-form__option">
            <el-switch v-model="additionalProperties" />
            <label>{{ t.additionalPropertiesAllow }}</label>
            <el-tooltip :content="t.additionalPropertiesTooltip" placement="top">
              <Info :size="16" class="schema-field-label__icon" />
            </el-tooltip>
          </div>
        </div>

        <div class="schema-form__column">
          <div>
            <div class="schema-field-label">
              <label>{{ t.fieldType }}</label>
              <el-tooltip :content="t.fieldTypeTooltipString" placement="top">
                <HelpCircle :size="16" class="schema-field-label__icon" />
              </el-tooltip>
            </div>
            <SchemaTypeSelector v-model="fieldType" />
          </div>

          <div class="schema-form__example">
            <p>{{ t.fieldTypeExample }}</p>
            <code>
              <template v-if="fieldType === 'string'">"example"</template>
              <template v-else-if="fieldType === 'number'">42</template>
              <template v-else-if="fieldType === 'boolean'">true</template>
              <template v-else-if="fieldType === 'object'">{ "key": "value" }</template>
              <template v-else-if="fieldType === 'array'">["item1", "item2"]</template>
            </code>
          </div>
        </div>
      </div>

      <div class="schema-form__actions">
        <el-button @click="dialogOpen = false">{{ t.fieldAddNewCancel }}</el-button>
        <el-button type="primary" native-type="submit">
          {{ t.fieldAddNewConfirm }}
        </el-button>
      </div>
    </form>
  </el-dialog>
</template>

<style scoped>
.schema-dialog-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
}

.schema-dialog-description {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.schema-form__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.schema-form__column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
}

.schema-field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
}

.schema-field-label__icon {
  color: var(--el-text-color-secondary);
}

.schema-code-input :deep(input) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.schema-form__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-light);
  font-size: 14px;
}

.schema-form__example {
  display: none;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.schema-form__example p {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
}

.schema-form__example code {
  display: block;
  overflow-x: auto;
  padding: 8px;
  border-radius: 4px;
  background: var(--el-bg-color);
  font-size: 14px;
}

.schema-form__actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  margin-top: 24px;
}

@media (min-width: 768px) {
  .schema-form__example {
    display: block;
  }

  .schema-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

@media (min-width: 1024px) {
  .schema-form__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
