import { z } from "zod";

// 核心类型定义
const simpleTypes = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "null",
] as const;

// 先定义基础 Schema，以 Zod 作为类型校验的唯一来源
/** @public */
export const baseSchema = z.object({
  // 基础 Schema 属性
  $id: z.string().optional(),
  $schema: z.string().optional(),
  $ref: z.string().optional(),
  $anchor: z.string().optional(),
  $dynamicRef: z.string().optional(),
  $dynamicAnchor: z.string().optional(),
  $vocabulary: z.record(z.string(), z.boolean()).optional(),
  $comment: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  default: z.unknown().optional(),
  deprecated: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  writeOnly: z.boolean().optional(),
  examples: z.array(z.unknown()).optional(),
  type: z.union([z.enum(simpleTypes), z.array(z.enum(simpleTypes))]).optional(),

  // 字符串校验
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  pattern: z.string().optional(),
  format: z.string().optional(),
  contentMediaType: z.string().optional(),
  contentEncoding: z.string().optional(),

  // 数字校验
  multipleOf: z.number().positive().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  exclusiveMinimum: z.number().optional(),
  exclusiveMaximum: z.number().optional(),

  // 数组校验
  minItems: z.number().int().min(0).optional(),
  maxItems: z.number().int().min(0).optional(),
  uniqueItems: z.boolean().optional(),
  minContains: z.number().int().min(0).optional(),
  maxContains: z.number().int().min(0).optional(),

  // 对象校验
  required: z.array(z.string()).optional(),
  minProperties: z.number().int().min(0).optional(),
  maxProperties: z.number().int().min(0).optional(),
  dependentRequired: z.record(z.string(), z.array(z.string())).optional(),

  // 值校验
  const: z.unknown().optional(),
  enum: z.array(z.unknown()).optional(),
});

// 定义递归 Schema 类型
/** @public */
export type JSONSchema =
  | boolean
  | (z.infer<typeof baseSchema> & {
      // 递归属性
      $defs?: Record<string, JSONSchema>;
      contentSchema?: JSONSchema;
      items?: JSONSchema;
      prefixItems?: JSONSchema[];
      contains?: JSONSchema;
      unevaluatedItems?: JSONSchema;
      properties?: Record<string, JSONSchema>;
      patternProperties?: Record<string, JSONSchema>;
      additionalProperties?: JSONSchema | boolean;
      propertyNames?: JSONSchema;
      dependentSchemas?: Record<string, JSONSchema>;
      unevaluatedProperties?: JSONSchema;
      allOf?: JSONSchema[];
      anyOf?: JSONSchema[];
      oneOf?: JSONSchema[];
      not?: JSONSchema;
      if?: JSONSchema;
      then?: JSONSchema;
      else?: JSONSchema;
    });

// 定义支持递归类型的 Zod Schema
export const jsonSchemaType: z.ZodType<JSONSchema> = z.lazy(() =>
  z.union([
    baseSchema.extend({
      $defs: z.record(z.string(), jsonSchemaType).optional(),
      contentSchema: jsonSchemaType.optional(),
      items: jsonSchemaType.optional(),
      prefixItems: z.array(jsonSchemaType).optional(),
      contains: jsonSchemaType.optional(),
      unevaluatedItems: jsonSchemaType.optional(),
      properties: z.record(z.string(), jsonSchemaType).optional(),
      patternProperties: z.record(z.string(), jsonSchemaType).optional(),
      additionalProperties: z.union([jsonSchemaType, z.boolean()]).optional(),
      propertyNames: jsonSchemaType.optional(),
      dependentSchemas: z.record(z.string(), jsonSchemaType).optional(),
      unevaluatedProperties: jsonSchemaType.optional(),
      allOf: z.array(jsonSchemaType).optional(),
      anyOf: z.array(jsonSchemaType).optional(),
      oneOf: z.array(jsonSchemaType).optional(),
      not: jsonSchemaType.optional(),
      if: jsonSchemaType.optional(),
      // biome-ignore lint/suspicious/noThenProperty: then 是 JSON Schema 的必需属性名
      then: jsonSchemaType.optional(),
      else: jsonSchemaType.optional(),
    }),
    z.boolean(),
  ]),
);

// 从 Schema 推导对外类型
export type SchemaType = (typeof simpleTypes)[number];

export interface NewField {
  name: string;
  type: SchemaType;
  description: string;
  required: boolean;
  validation?: ObjectJSONSchema;
  additionalProperties?: boolean;
}

export interface SchemaEditorState {
  schema: JSONSchema;
  fieldInfo: {
    type: SchemaType;
    properties: Array<{
      name: string;
      path: string[];
      schema: JSONSchema;
      required: boolean;
    }>;
  } | null;
  handleAddField: (newField: NewField, parentPath?: string[]) => void;
  handleEditField: (path: string[], updatedField: NewField) => void;
  handleDeleteField: (path: string[]) => void;
  handleSchemaEdit: (schema: JSONSchema) => void;
}

export type ObjectJSONSchema = Exclude<JSONSchema, boolean>;

export function isBooleanSchema(schema: JSONSchema): schema is boolean {
  return typeof schema === "boolean";
}

export function isObjectSchema(schema: JSONSchema): schema is ObjectJSONSchema {
  return !isBooleanSchema(schema);
}

export function asObjectSchema(schema: JSONSchema): ObjectJSONSchema {
  return isObjectSchema(schema) ? schema : { type: "null" };
}
export function getSchemaDescription(schema: JSONSchema): string {
  return isObjectSchema(schema) ? schema.description || "" : "";
}

export function withObjectSchema<T>(
  schema: JSONSchema,
  fn: (schema: ObjectJSONSchema) => T,
  defaultValue: T,
): T {
  return isObjectSchema(schema) ? fn(schema) : defaultValue;
}
