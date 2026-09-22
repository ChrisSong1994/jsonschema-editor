import {
  type InjectionKey,
  inject,
  provide,
  type ShallowRef,
  shallowRef,
} from "vue";
import type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
} from "../types/json-schema.ts";
import { isObjectSchema } from "../types/json-schema.ts";

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

export interface SchemaStore {
  /** 当前 Schema，使用只读浅层引用保存。 */
  schema: ShallowRef<JSONSchema>;

  /** 获取指定属性路径下的子 Schema。 */
  getAtPath(path: string[]): JSONSchema | undefined;

  /** 替换 `path > propertyName` 对应的属性 Schema。 */
  updateProperty(
    path: string[],
    propertyName: string,
    propertySchema: JSONSchema,
  ): void;

  /** 删除 `path > propertyName` 对应的属性。 */
  deleteProperty(path: string[], propertyName: string): void;

  /** 重命名 `path` 下的属性并保持顺序。 */
  renameProperty(path: string[], oldName: string, newName: string): void;

  /** 设置 `path > propertyName` 对应属性的必填状态。 */
  setPropertyRequired(
    path: string[],
    propertyName: string,
    required: boolean,
  ): void;

  /** 在 `path` 下新增字段。 */
  addProperty(path: string[], field: NewField): void;

  /** 替换完整 Schema，供重置、JSON 推断和源码编辑等场景使用。 */
  replaceSchema(newSchema: JSONSchema): void;
}

export const SchemaStoreKey: InjectionKey<SchemaStore> = Symbol("SchemaStore");

// ─── 无 Vue 依赖的纯函数 ─────────────────────────────────────────────────────

/** 深拷贝 Schema，始终生成普通 JavaScript 对象。 */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * 导航到指定属性路径对应的对象 Schema。
 * 路径无效时返回 `undefined`。
 */
function navigateToPath(
  root: JSONSchema,
  path: string[],
): ObjectJSONSchema | undefined {
  let current: JSONSchema = root;
  for (const segment of path) {
    if (!isObjectSchema(current) || !current.properties) return undefined;
    const next = current.properties[segment];
    if (next === undefined) return undefined;
    // 属性为带 items 的数组时继续进入 items
    if (
      isObjectSchema(next) &&
      next.type === "array" &&
      next.items &&
      isObjectSchema(next.items)
    ) {
      current = next.items;
    } else {
      current = next;
    }
  }
  return isObjectSchema(current) ? current : undefined;
}

/**
 * 获取指定属性路径下的子 Schema，不要求其一定是对象 Schema。
 */
function getSubSchema(
  root: JSONSchema,
  path: string[],
): JSONSchema | undefined {
  if (path.length === 0) return root;
  let current: JSONSchema = root;
  for (const segment of path) {
    if (!isObjectSchema(current) || !current.properties) return undefined;
    const next = current.properties[segment];
    if (next === undefined) return undefined;
    current = next;
  }
  return current;
}

/**
 * 以不可变方式设置深层属性 Schema。
 * 返回新的根 Schema。
 */
function setDeep(
  root: JSONSchema,
  path: string[],
  propertyName: string,
  propertySchema: JSONSchema,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent)) return newRoot;
  if (!parent.properties) parent.properties = {};
  parent.properties[propertyName] = propertySchema;
  return newRoot;
}

/**
 * 以不可变方式删除深层属性。
 */
function deleteDeep(
  root: JSONSchema,
  path: string[],
  propertyName: string,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent) || !parent.properties) return newRoot;

  const { [propertyName]: _, ...rest } = parent.properties;
  parent.properties = rest;

  if (parent.required) {
    parent.required = parent.required.filter((n) => n !== propertyName);
  }
  return newRoot;
}

/**
 * 以不可变方式重命名深层属性，并保持键顺序。
 */
function renameDeep(
  root: JSONSchema,
  path: string[],
  oldName: string,
  newName: string,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent) || !parent.properties) return newRoot;

  const newProps: Record<string, JSONSchema> = {};
  for (const [key, value] of Object.entries(parent.properties)) {
    newProps[key === oldName ? newName : key] = value;
  }
  parent.properties = newProps;

  if (parent.required) {
    parent.required = parent.required.map((n) => (n === oldName ? newName : n));
  }
  return newRoot;
}

/**
 * 以不可变方式设置属性必填状态。
 */
function setRequiredDeep(
  root: JSONSchema,
  path: string[],
  propertyName: string,
  required: boolean,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent)) return newRoot;
  if (!parent.required) parent.required = [];

  if (required) {
    if (!parent.required.includes(propertyName)) {
      parent.required.push(propertyName);
    }
  } else {
    parent.required = parent.required.filter((n) => n !== propertyName);
  }
  return newRoot;
}

// ─── Store 工厂 ──────────────────────────────────────────────────────────────

/**
 * 创建 Schema Store。应在根组件 JsonSchemaEditor 中调用，
 * 并通过 provide 提供给所有后代组件。
 *
 * @param initialSchema 初始 Schema，会被深拷贝。
 * @param onChange Schema 变化时触发，用于 v-model 和 emit 同步。
 */
export function createSchemaStore(
  initialSchema: JSONSchema,
  onChange?: (schema: JSONSchema) => void,
): SchemaStore {
  const schema = shallowRef<JSONSchema>(clone(initialSchema));

  // ── 循环保护 ─────────────────────────────────────────────────────────────
  // 硬性限制：单次同步执行批次内提交超过 MAX_COMMITS 次时，
  // 后续提交会被静默丢弃，避免响应式循环导致浏览器卡死。
  // 即使其他保护措施失效，也能避免页面失去响应。
  const MAX_COMMITS_PER_BATCH = 10;
  let commitCount = 0;
  let batchScheduled = false;

  function resetCommitCount(): void {
    commitCount = 0;
    batchScheduled = false;
  }

  // 重入保护：上一次变更处理完成前不再接受新的变更。
  let isUpdating = false;

  function commit(newSchema: JSONSchema): void {
    if (isUpdating) return;

    // 按执行批次限流，并在下一个宏任务重置（此时微任务监听器均已执行）
    if (!batchScheduled) {
      batchScheduled = true;
      setTimeout(resetCommitCount, 0);
    }
    commitCount++;
    if (commitCount > MAX_COMMITS_PER_BATCH) {
      if (typeof console !== "undefined") {
        console.warn(
          "[SchemaStore] 提交频率超过限制，已丢弃本次更新以避免循环",
        );
      }
      return;
    }

    isUpdating = true;
    try {
      schema.value = newSchema;
      onChange?.(newSchema);
    } finally {
      isUpdating = false;
    }
  }

  const store: SchemaStore = {
    schema,

    getAtPath(path: string[]): JSONSchema | undefined {
      return getSubSchema(schema.value, path);
    },

    updateProperty(
      path: string[],
      propertyName: string,
      propertySchema: JSONSchema,
    ): void {
      commit(setDeep(schema.value, path, propertyName, clone(propertySchema)));
    },

    deleteProperty(path: string[], propertyName: string): void {
      commit(deleteDeep(schema.value, path, propertyName));
    },

    renameProperty(path: string[], oldName: string, newName: string): void {
      commit(renameDeep(schema.value, path, oldName, newName));
    },

    setPropertyRequired(
      path: string[],
      propertyName: string,
      required: boolean,
    ): void {
      commit(setRequiredDeep(schema.value, path, propertyName, required));
    },

    addProperty(path: string[], field: NewField): void {
      const { type, description, additionalProperties } = field;
      const fieldSchema: ObjectJSONSchema = {
        type,
        ...(description ? { description } : {}),
        ...(additionalProperties === false ? { additionalProperties } : {}),
      };

      let newSchema = setDeep(schema.value, path, field.name, fieldSchema);
      if (field.required) {
        newSchema = setRequiredDeep(newSchema, path, field.name, true);
      }
      commit(newSchema);
    },

    replaceSchema(newSchema: JSONSchema): void {
      commit(clone(newSchema));
    },
  };

  return store;
}

// ─── Provide / Inject 辅助函数 ───────────────────────────────────────────────

export function provideSchemaStore(store: SchemaStore): void {
  provide(SchemaStoreKey, store);
}

export function useSchemaStore(): SchemaStore {
  const store = inject(SchemaStoreKey);
  if (!store) {
    throw new Error(
      "调用 useSchemaStore() 时没有找到父级提供的 SchemaStore。" +
        "请使用 JsonSchemaEditor 包裹组件树，或调用 provideSchemaStore()。",
    );
  }
  return store;
}

// 导出纯函数供测试使用
export const _testing = {
  clone,
  navigateToPath,
  getSubSchema,
  setDeep,
  deleteDeep,
  renameDeep,
  setRequiredDeep,
};
