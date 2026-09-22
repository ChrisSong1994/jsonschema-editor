import z from "zod";
import type { zh } from "../constants/zh.ts";
import { baseSchema, type JSONSchema } from "./json-schema.ts";

function refineRangeConsistency(
  min: number | undefined,
  isMinExclusive: boolean,
  max: number | undefined,
  isMaxExclusive: boolean,
): boolean {
  if (min !== undefined && max !== undefined && min > max) {
    return false;
  }
  if (
    isMinExclusive &&
    isMaxExclusive &&
    min !== undefined &&
    max !== undefined &&
    max - min < 2
  ) {
    return false;
  }
  if (
    (isMinExclusive || isMaxExclusive) &&
    min !== undefined &&
    max !== undefined &&
    max - min < 1
  ) {
    return false;
  }
  return true;
}

const getJsonStringType = (t: typeof zh) =>
  z
    .object({
      minLength: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
      maxLength: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
      pattern: baseSchema.shape.pattern,
      format: baseSchema.shape.format,
      enum: baseSchema.shape.enum,
      contentMediaType: baseSchema.shape.contentMediaType, // 暂未做额外约束
      contentEncoding: baseSchema.shape.contentEncoding, // 暂未做额外约束
    })
    // 同时设置 minLength 和 maxLength 时，前者不能大于后者。
    .refine(
      ({ minLength, maxLength }) =>
        refineRangeConsistency(minLength, false, maxLength, false),
      {
        message: t.stringValidationErrorLengthRange,
        path: ["length"],
      },
    );

const getJsonNumberType = (t: typeof zh) =>
  z
    .object({
      multipleOf: z
        .number()
        .positive({ message: t.typeValidationErrorPositive })
        .optional(),
      minimum: baseSchema.shape.minimum,
      maximum: baseSchema.shape.maximum,
      exclusiveMinimum: baseSchema.shape.exclusiveMinimum,
      exclusiveMaximum: baseSchema.shape.exclusiveMaximum,
      enum: baseSchema.shape.enum,
    })
    // 同时设置最小值（含或排除）和最大值（含或排除）时，最小值不能大于最大值。
    .refine(
      ({ minimum, exclusiveMinimum, maximum, exclusiveMaximum }) =>
        refineRangeConsistency(minimum, false, maximum, false) &&
        refineRangeConsistency(minimum, false, exclusiveMaximum, true) &&
        refineRangeConsistency(exclusiveMinimum, true, maximum, false) &&
        refineRangeConsistency(exclusiveMinimum, true, exclusiveMaximum, true),
      {
        message: t.numberValidationErrorMinMax,
        path: ["minMax"],
      },
    )
    // 不能同时设置 exclusiveMinimum 和 minimum
    .refine(
      ({ minimum, exclusiveMinimum }) =>
        exclusiveMinimum === undefined || minimum === undefined,
      {
        message: t.numberValidationErrorBothExclusiveAndInclusiveMin,
        path: ["redundantMinimum"],
      },
    )
    // 不能同时设置 exclusiveMaximum 和 maximum
    .refine(
      ({ maximum, exclusiveMaximum }) =>
        exclusiveMaximum === undefined || maximum === undefined,
      {
        message: t.numberValidationErrorBothExclusiveAndInclusiveMax,
        path: ["redundantMaximum"],
      },
    )
    // 设置范围时，检查枚举值是否均位于范围内
    .refine(
      ({
        enum: enumValues,
        minimum,
        maximum,
        exclusiveMinimum,
        exclusiveMaximum,
      }) => {
        if (!enumValues || enumValues.length === 0) return true;
        return enumValues.every((val) => {
          if (typeof val !== "number") return false;
          if (minimum !== undefined && val < minimum) return false;
          if (maximum !== undefined && val > maximum) return false;
          if (exclusiveMinimum !== undefined && val <= exclusiveMinimum)
            return false;
          if (exclusiveMaximum !== undefined && val >= exclusiveMaximum)
            return false;
          return true;
        });
      },
      {
        message: t.numberValidationErrorEnumOutOfRange,
        path: ["enum"],
      },
    );

const getJsonArrayType = (t: typeof zh) =>
  z
    .object({
      minItems: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
      maxItems: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
      uniqueItems: z.boolean().optional(),
      minContains: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
      maxContains: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
    })
    // 同时设置 minItems 和 maxItems 时，前者不能大于后者。
    .refine(
      ({ minItems, maxItems }) =>
        refineRangeConsistency(minItems, false, maxItems, false),
      {
        message: t.arrayValidationErrorMinMax,
        path: ["minmax"],
      },
    )
    // 同时设置 minContains 和 maxContains 时，前者不能大于后者。
    .refine(
      ({ minContains, maxContains }) =>
        refineRangeConsistency(minContains, false, maxContains, false),
      {
        message: t.arrayValidationErrorContainsMinMax,
        path: ["minmaxContains"],
      },
    );

const getJsonObjectType = (t: typeof zh) =>
  z
    .object({
      minProperties: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
      maxProperties: z
        .number()
        .int({ message: t.typeValidationErrorIntValue })
        .min(0, { message: t.typeValidationErrorNegativeLength })
        .optional(),
    })
    // 同时设置 minProperties 和 maxProperties 时，前者不能大于后者。
    .refine(
      ({ minProperties, maxProperties }) =>
        refineRangeConsistency(minProperties, false, maxProperties, false),
      {
        message: t.objectValidationErrorMinMax,
        path: ["minmax"],
      },
    );

export function getTypeValidation(type: string, t: typeof zh) {
  const jsonTypesValidation: Record<string, z.ZodTypeAny> = {
    string: getJsonStringType(t),
    number: getJsonNumberType(t),
    array: getJsonArrayType(t),
    object: getJsonObjectType(t),
  };

  return jsonTypesValidation[type] || z.any();
}

export interface TypeValidationResult {
  success: boolean;
  errors?: z.core.$ZodIssue[];
}

export function validateSchemaByType(
  schema: unknown,
  type: string,
  t: typeof zh,
): TypeValidationResult {
  const zodSchema = getTypeValidation(type, t);
  const result = zodSchema.safeParse(schema);
  if (result.success) {
    return { success: true };
  } else {
    return { success: false, errors: result.error.issues };
  }
}

export interface ValidationTreeNode {
  name: string;
  validation: TypeValidationResult;
  children: Record<string, ValidationTreeNode>;
  cumulativeChildrenErrors: number; // Total errors in this node and all its descendants
}

export function buildValidationTree(
  schema: JSONSchema,
  t: typeof zh,
): ValidationTreeNode {
  // 从可能为 string、string[] 或 undefined 的 schema.type 中确定具体类型
  const deriveType = (sch: unknown): string | undefined => {
    if (!sch || typeof sch !== "object") return undefined;
    const declared = (sch as Record<string, unknown>).type;
    if (typeof declared === "string") return declared;
    if (
      Array.isArray(declared) &&
      declared.length > 0 &&
      typeof declared[0] === "string"
    )
      return declared[0];
    return undefined;
  };

  // 布尔 Schema 的处理约定：
  // true 表示始终有效，false 表示始终无效
  if (typeof schema === "boolean") {
    const validation: TypeValidationResult =
      schema === true
        ? { success: true }
        : {
            success: false,
            errors: [
              {
                code: "custom",
                message: t.validatorErrorSchemaValidation,
                path: [],
              } as unknown as z.core.$ZodIssue,
            ],
          };

    const node: ValidationTreeNode = {
      name: String(schema),
      validation,
      children: {},
      cumulativeChildrenErrors: validation.success
        ? 0
        : (validation.errors?.length ?? 0),
    };

    return node;
  }

  // 此处 schema 为对象形式的 JSONSchema
  const sch = schema as Record<string, unknown>;
  const currentType = deriveType(sch);

  const validation = validateSchemaByType(schema, currentType ?? "unknown", t);

  const children: Record<string, ValidationTreeNode> = {};

  // 遍历对象属性
  if (currentType === "object") {
    const properties = sch.properties;
    if (properties && typeof properties === "object") {
      for (const [propName, propSchema] of Object.entries(
        properties as Record<string, JSONSchema>,
      )) {
        children[propName] = buildValidationTree(propSchema, t);
      }
    }
    // 浅层处理 patternProperties；dependentSchemas 暂未展开
    if (sch.patternProperties && typeof sch.patternProperties === "object") {
      for (const [patternName, patternSchema] of Object.entries(
        sch.patternProperties as Record<string, JSONSchema>,
      )) {
        children[`pattern:${patternName}`] = buildValidationTree(
          patternSchema,
          t,
        );
      }
    }
  }

  // 遍历数组 items 和 prefixItems
  if (currentType === "array") {
    const items = sch.items;
    if (Array.isArray(items)) {
      items.forEach((it, idx) => {
        children[`items[${idx}]`] = buildValidationTree(it, t);
      });
    } else if (items) {
      children.items = buildValidationTree(items as JSONSchema, t);
    }

    if (Array.isArray(sch.prefixItems)) {
      (sch.prefixItems as JSONSchema[]).forEach((it, idx) => {
        children[`prefixItems[${idx}]`] = buildValidationTree(it, t);
      });
    }
  }

  // 浅层遍历组合关键字 allOf、anyOf、oneOf 和 not
  const combinators: Array<"allOf" | "anyOf" | "oneOf"> = [
    "allOf",
    "anyOf",
    "oneOf",
  ];
  for (const comb of combinators) {
    const arr = sch[comb];
    if (Array.isArray(arr)) {
      arr.forEach((subSchema, idx) => {
        children[[comb, idx].join(":")] = buildValidationTree(
          subSchema as JSONSchema,
          t,
        );
      });
    }
  }

  if (sch.not) {
    children.not = buildValidationTree(sch.not as JSONSchema, t);
  }

  // 浅层遍历 $defs 和 definitions
  if (sch.$defs && typeof sch.$defs === "object") {
    for (const [defName, defSchema] of Object.entries(
      sch.$defs as Record<string, JSONSchema>,
    )) {
      children[`$defs:${defName}`] = buildValidationTree(defSchema, t);
    }
  }

  // definitions 是 $defs 的旧称，因此同时兼容
  const definitions = (sch as Record<string, unknown>).definitions;
  if (definitions && typeof definitions === "object") {
    for (const [defName, defSchema] of Object.entries(
      definitions as Record<string, JSONSchema>,
    )) {
      children[`definitions:${defName}`] = buildValidationTree(defSchema, t);
    }
  }

  // 统计当前节点及全部后代的累计错误数
  const ownErrors = validation.success ? 0 : (validation.errors?.length ?? 0);
  const childrenErrors = Object.values(children).reduce(
    (sum, child) => sum + child.cumulativeChildrenErrors,
    0,
  );

  return {
    name: currentType ?? "unknown",
    validation,
    children,
    cumulativeChildrenErrors: ownErrors + childrenErrors,
  };
}
