import type { SchemaType } from "../types/json-schema.ts";

export interface SchemaTypeDisplay {
  label: string;
  tagType: "primary" | "success" | "warning" | "info" | "danger";
  className: string;
}

const TYPE_DISPLAY: Record<SchemaType, SchemaTypeDisplay> = {
  string: {
    label: "字符串",
    tagType: "primary",
    className: "schema-type-string",
  },
  number: {
    label: "数字",
    tagType: "primary",
    className: "schema-type-number",
  },
  integer: {
    label: "整数",
    tagType: "primary",
    className: "schema-type-number",
  },
  boolean: {
    label: "布尔值",
    tagType: "success",
    className: "schema-type-boolean",
  },
  object: {
    label: "对象",
    tagType: "warning",
    className: "schema-type-object",
  },
  array: {
    label: "数组",
    tagType: "danger",
    className: "schema-type-array",
  },
  null: {
    label: "空值",
    tagType: "info",
    className: "schema-type-null",
  },
};

/**
 * 将可能为数组的 Schema 类型归一化为单个类型。
 * 数组类型时优先取第一个非 null 的类型，全部为 null 时回退到 null。
 */
export function normalizeSchemaType(
  type: SchemaType | SchemaType[] | undefined,
): SchemaType {
  if (Array.isArray(type)) {
    const first = type.find((item) => item !== "null");
    return first ?? "null";
  }
  return type ?? "object";
}

/** 获取 Schema 类型的中文名称。 */
export function getSchemaTypeLabel(
  type: SchemaType | SchemaType[] | undefined,
): string {
  return (
    TYPE_DISPLAY[normalizeSchemaType(type)]?.label ?? TYPE_DISPLAY.string.label
  );
}

/** 获取 Schema 类型对应的 Element Plus 标签样式。 */
export function getSchemaTypeTagType(
  type: SchemaType | SchemaType[] | undefined,
): SchemaTypeDisplay["tagType"] {
  return (
    TYPE_DISPLAY[normalizeSchemaType(type)]?.tagType ??
    TYPE_DISPLAY.string.tagType
  );
}

/** 获取 Schema 类型对应的局部样式类。 */
export function getSchemaTypeClass(
  type: SchemaType | SchemaType[] | undefined,
): string {
  return (
    TYPE_DISPLAY[normalizeSchemaType(type)]?.className ??
    TYPE_DISPLAY.string.className
  );
}
