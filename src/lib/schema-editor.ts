import type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
} from "../types/json-schema.ts";
import { isBooleanSchema, isObjectSchema } from "../types/json-schema.ts";

export type Property = {
  name: string;
  schema: JSONSchema;
  required: boolean;
};

export function copySchema<T extends JSONSchema>(schema: T): T {
  return JSON.parse(JSON.stringify(schema));
}

/**
 * 更新对象 Schema 中的属性
 */
export function updateObjectProperty(
  schema: ObjectJSONSchema,
  propertyName: string,
  propertySchema: JSONSchema,
): ObjectJSONSchema {
  if (!isObjectSchema(schema)) return schema;

  const newSchema = copySchema(schema);
  if (!newSchema.properties) {
    newSchema.properties = {};
  }

  newSchema.properties[propertyName] = propertySchema;
  return newSchema;
}

/**
 * 从对象 Schema 中移除属性
 */
export function removeObjectProperty(
  schema: ObjectJSONSchema,
  propertyName: string,
): ObjectJSONSchema {
  if (!isObjectSchema(schema) || !schema.properties) return schema;

  const newSchema = copySchema(schema);
  const { [propertyName]: _, ...remainingProps } = schema.properties;
  newSchema.properties = remainingProps;

  // 如果必填列表中包含该属性，同时移除
  if (newSchema.required) {
    newSchema.required = newSchema.required.filter(
      (name) => name !== propertyName,
    );
  }

  return newSchema;
}

/**
 * 更新属性的必填状态
 */
export function updatePropertyRequired(
  schema: ObjectJSONSchema,
  propertyName: string,
  required: boolean,
): ObjectJSONSchema {
  if (!isObjectSchema(schema)) return schema;

  const newSchema = copySchema(schema);
  if (!newSchema.required) {
    newSchema.required = [];
  }

  if (required) {
    // 尚未加入必填列表时补充
    if (!newSchema.required.includes(propertyName)) {
      newSchema.required.push(propertyName);
    }
  } else {
    // 从必填列表中移除
    newSchema.required = newSchema.required.filter(
      (name) => name !== propertyName,
    );
  }

  return newSchema;
}

/**
 * 更新数组 Schema 的子项类型
 */
export function updateArrayItems(
  schema: JSONSchema,
  itemsSchema: JSONSchema,
): JSONSchema {
  if (isObjectSchema(schema) && schema.type === "array") {
    return {
      ...schema,
      items: itemsSchema,
    };
  }
  return schema;
}

/**
 * 为新字段创建 Schema
 */
export function createFieldSchema(field: NewField): JSONSchema {
  const { type, description, validation, additionalProperties } = field;
  if (validation && isObjectSchema(validation)) {
    return {
      type,
      description,
      ...validation,
      ...(additionalProperties === false ? { additionalProperties } : {}),
    };
  }
  return validation ?? { type };
}

/**
 * 校验字段名是否合法
 */
export function validateFieldName(name: string): boolean {
  if (!name || name.trim() === "") {
    return false;
  }

  // 字段名不能包含属性名不支持的字符
  const validNamePattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  return validNamePattern.test(name);
}

/**
 * 获取对象 Schema 的属性列表
 */
export function getSchemaProperties(schema: JSONSchema): Property[] {
  if (!isObjectSchema(schema) || !schema.properties) return [];

  const required = schema.required || [];

  return Object.entries(schema.properties).map(([name, propSchema]) => ({
    name,
    schema: propSchema,
    required: required.includes(name),
  }));
}

/**
 * 获取数组 Schema 的子项类型
 */
export function getArrayItemsSchema(schema: JSONSchema): JSONSchema | null {
  if (isBooleanSchema(schema)) return null;
  if (schema.type !== "array") return null;

  return schema.items || null;
}

/**
 * 重命名对象 Schema 中的属性并保持原有顺序
 */
export function renameObjectProperty(
  schema: ObjectJSONSchema,
  oldName: string,
  newName: string,
): ObjectJSONSchema {
  if (!isObjectSchema(schema) || !schema.properties) return schema;

  const newSchema = copySchema(schema);
  const newProperties: Record<string, JSONSchema> = {};

  // 按原顺序遍历属性，并替换旧字段名
  for (const [key, value] of Object.entries(schema.properties)) {
    if (key === oldName) {
      newProperties[newName] = value;
    } else {
      newProperties[key] = value;
    }
  }

  newSchema.properties = newProperties;

  // 字段名变化时同步更新必填列表
  if (newSchema.required) {
    newSchema.required = newSchema.required.map((field) =>
      field === oldName ? newName : field,
    );
  }

  return newSchema;
}

/**
 * 判断 Schema 是否包含子节点
 */
export function hasChildren(schema: JSONSchema): boolean {
  if (!isObjectSchema(schema)) return false;

  if (schema.type === "object" && schema.properties) {
    return Object.keys(schema.properties).length > 0;
  }

  if (schema.type === "array" && schema.items && isObjectSchema(schema.items)) {
    return schema.items.type === "object" && !!schema.items.properties;
  }

  return false;
}
