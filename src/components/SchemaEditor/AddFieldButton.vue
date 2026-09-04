<script setup lang="ts">
import ElTooltip from "element-plus/es/components/tooltip/index";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/es/components/tooltip/style/css";
import { ElButton } from "element-plus/es/components/button/index";
import "element-plus/es/components/button/style/css";
import { ElDialog } from "element-plus/es/components/dialog/index";
import "element-plus/es/components/dialog/style/css";
import { ElInput } from "element-plus/es/components/input/index";
import "element-plus/es/components/input/style/css";
import { ElTag } from "element-plus/es/components/tag/index";
import "element-plus/es/components/tag/style/css";
import { CirclePlus, HelpCircle, Info } from "lucide-vue-next";
import { ref, useId } from "vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { useSchemaStore } from "../../hooks/useSchemaStore.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";
import SchemaTypeSelector from "./SchemaTypeSelector.vue";

const props = withDefaults(
  defineProps<{
    path: string[];
    variant?: "primary" | "secondary";
  }>(),
  { variant: "primary" },
);

const store = useSchemaStore();

const dialogOpen = ref(false);
const fieldName = ref("");
const fieldType = ref<SchemaType>("string");
const fieldDesc = ref("");
const fieldRequired = ref(false);
const additionalProperties = ref(true);

const fieldNameId = useId();
const fieldDescId = useId();
const fieldRequiredId = useId();
const fieldTypeId = useId();
const additionalPropertiesId = useId();

const t = useTranslation();

const handleSubmit = (e: Event) => {
  e.preventDefault();
  if (!fieldName.value.trim()) return;

  store.addProperty(props.path, {
    name: fieldName.value,
    type: fieldType.value,
    description: fieldDesc.value,
    required: fieldRequired.value,
    additionalProperties:
      fieldType.value === "object" ? additionalProperties.value : undefined,
  });

  fieldName.value = "";
  fieldType.value = "string";
  fieldDesc.value = "";
  fieldRequired.value = false;
  dialogOpen.value = false;
  additionalProperties.value = true;
};
</script>

<template>
  <ElButton
    native-type="button"
    @click="dialogOpen = true"
    :plain="variant === 'secondary'"
    size="small"
    class="flex items-center gap-1.5 group"
  >
    <CirclePlus :size="16" class="group-hover:scale-110 transition-transform" />
    <span>{{ t.fieldAddNewButton }}</span>
  </ElButton>

  <ElDialog
    :model-value="dialogOpen"
    @update:model-value="dialogOpen = $event"
    class="md:max-w-[1200px]! max-h-[85vh]! w-[95vw]! p-4! sm:p-6! overflow-auto! jscb jsonschema-dialog"
  >
    <template #header>
      <div class="mb-4">
        <div class="text-xl flex flex-wrap items-center gap-2">
          {{ t.fieldAddNewLabel }}
          <ElTag class="text-xs">{{ t.fieldAddNewBadge }}</ElTag>
        </div>
        <p class="text-sm text-muted-foreground mt-1">{{ t.fieldAddNewDescription }}</p>
      </div>
    </template>

    <form @submit="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4 min-w-[280px]">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <label :for="fieldNameId" class="text-sm font-medium">{{ t.fieldNameLabel }}</label>
              <ElTooltip :content="t.fieldNameTooltip" placement="top">
                <Info class="h-4 w-4 text-muted-foreground shrink-0" />
              </ElTooltip>
            </div>
            <ElInput
              :id="fieldNameId"
              v-model="fieldName"
              :placeholder="t.fieldNamePlaceholder"
              class="font-mono text-sm w-full"
              :required="true"
            />
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <label :for="fieldDescId" class="text-sm font-medium">{{ t.fieldDescription }}</label>
              <ElTooltip :content="t.fieldDescriptionTooltip" placement="top">
                <Info class="h-4 w-4 text-muted-foreground shrink-0" />
              </ElTooltip>
            </div>
            <ElInput
              :id="fieldDescId"
              v-model="fieldDesc"
              :placeholder="t.fieldDescriptionPlaceholder"
              class="text-sm w-full"
            />
          </div>

          <div class="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <input
              type="checkbox"
              :id="fieldRequiredId"
              v-model="fieldRequired"
              class="rounded border-gray-300 shrink-0"
            />
            <label :for="fieldRequiredId" class="text-sm">{{ t.fieldRequiredLabel }}</label>
          </div>

          <div v-if="fieldType === 'object'" class="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <input
              type="checkbox"
              :id="additionalPropertiesId"
              v-model="additionalProperties"
              class="rounded border-gray-300 shrink-0"
            />
            <label :for="additionalPropertiesId" class="text-sm">{{ t.additionalPropertiesAllow }}</label>
            <ElTooltip :content="t.additionalPropertiesTooltip" placement="top">
              <Info class="h-4 w-4 text-muted-foreground shrink-0" />
            </ElTooltip>
          </div>
        </div>

        <div class="space-y-4 min-w-[280px]">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <label :for="fieldTypeId" class="text-sm font-medium">{{ t.fieldType }}</label>
              <ElTooltip :content="t.fieldTypeTooltipString" placement="top">
                <HelpCircle class="h-4 w-4 text-muted-foreground shrink-0" />
              </ElTooltip>
            </div>
            <SchemaTypeSelector :id="fieldTypeId" v-model="fieldType" />
          </div>

          <div class="rounded-lg border bg-muted/50 p-3 hidden md:block">
            <p class="text-xs font-medium mb-2">{{ t.fieldTypeExample }}</p>
            <code class="text-sm bg-background/80 p-2 rounded block overflow-x-auto">
              <template v-if="fieldType === 'string'">"example"</template>
              <template v-else-if="fieldType === 'number'">42</template>
              <template v-else-if="fieldType === 'boolean'">true</template>
              <template v-else-if="fieldType === 'object'">{ "key": "value" }</template>
              <template v-else-if="fieldType === 'array'">["item1", "item2"]</template>
            </code>
          </div>
        </div>
      </div>

      <div class="mt-6 gap-2 flex-wrap flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <ElButton native-type="button" plain size="small" @click="dialogOpen = false">
          {{ t.fieldAddNewCancel }}
        </ElButton>
        <ElButton native-type="submit" size="small">{{ t.fieldAddNewConfirm }}</ElButton>
      </div>
    </form>
  </ElDialog>
</template>
