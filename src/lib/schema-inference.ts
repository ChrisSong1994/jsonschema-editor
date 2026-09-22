import { asObjectSchema, type JSONSchema } from "../types/json-schema.ts";

/**
 * 合并两个 JSON Schema。
 * 兼容类型（例如 integer 与 number）会尝试合并。
 * 两个 Schema 完全相同时返回第一个。
 * 无法兼容时返回使用 oneOf 的 Schema。
 */
function mergeSchemas(schema1: JSONSchema, schema2: JSONSchema): JSONSchema {
  const s1 = asObjectSchema(schema1);
  const s2 = asObjectSchema(schema2);

  // 通过序列化结果进行深度比较
  if (JSON.stringify(s1) === JSON.stringify(s2)) {
    return schema1;
  }

  // 处理基础类型合并，例如将 integer 合并为 number
  if (s1.type === "integer" && s2.type === "number") return { type: "number" };
  if (s1.type === "number" && s2.type === "integer") return { type: "number" };

  // 类型不同或需要复杂合并时使用 oneOf
  const existingOneOf = Array.isArray(s1.oneOf) ? s1.oneOf : [s1];
  const newSchemaToAdd = s2;

  // 避免向 oneOf 添加重复 Schema
  if (
    !existingOneOf.some(
      (s) => JSON.stringify(s) === JSON.stringify(newSchemaToAdd),
    )
  ) {
    const mergedOneOf = [...existingOneOf, newSchemaToAdd];
    // 合并后仅剩一个唯一 Schema 时简化 oneOf
    const uniqueSchemas = [
      ...new Map(mergedOneOf.map((s) => [JSON.stringify(s), s])).values(),
    ];
    if (uniqueSchemas.length === 1) {
      return uniqueSchemas[0];
    }
    return { oneOf: uniqueSchemas };
  }

  return s1.oneOf ? s1 : { oneOf: [s1] }; // 保留已有 oneOf，否则创建新的
}

// --- 类型推断辅助函数 ---

function inferObjectSchema(obj: Record<string, unknown>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    properties[key] = inferSchema(value); // 递归推断
    if (value !== undefined && value !== null) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    required: required.length > 0 ? required.sort() : undefined, // 对必填字段排序
  };
}

function detectEnumsInArrayItems(
  mergedProperties: Record<string, JSONSchema>,
  originalArray: Record<string, unknown>[],
  totalItems: number,
): Record<string, JSONSchema> {
  if (totalItems < 10 || Object.keys(mergedProperties).length === 0) {
    return mergedProperties; // 数据不足或没有可检查的属性
  }

  const valueMap: Record<string, Set<string | number>> = {};

  // 收集去重后的值
  for (const item of originalArray) {
    for (const key in mergedProperties) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const value = item[key];
        if (typeof value === "string" || typeof value === "number") {
          if (!valueMap[key]) valueMap[key] = new Set();
          valueMap[key].add(value);
        }
      }
    }
  }

  const updatedProperties = { ...mergedProperties };
  // 为疑似枚举的属性更新 Schema
  for (const key in valueMap) {
    const distinctValues = Array.from(valueMap[key]);
    if (
      distinctValues.length > 1 &&
      distinctValues.length <= 10 &&
      distinctValues.length < totalItems / 2
    ) {
      const currentSchema = asObjectSchema(updatedProperties[key]);
      if (
        currentSchema.type === "string" ||
        currentSchema.type === "number" ||
        currentSchema.type === "integer"
      ) {
        updatedProperties[key] = {
          type: currentSchema.type,
          enum: distinctValues.sort(),
        };
      }
    }
  }
  return updatedProperties;
}

function detectSemanticFormatsInArrayItems(
  mergedProperties: Record<string, JSONSchema>,
  originalArray: Record<string, unknown>[],
): Record<string, JSONSchema> {
  const updatedProperties = { ...mergedProperties };

  for (const key in updatedProperties) {
    const currentSchema = asObjectSchema(updatedProperties[key]);

    // 坐标格式识别
    if (
      /coordinates?|coords?|latLon|lonLat|point/i.test(key) &&
      currentSchema.type === "array"
    ) {
      const itemsSchema =
        currentSchema.items === undefined
          ? undefined
          : asObjectSchema(currentSchema.items);
      if (itemsSchema?.type === "number" || itemsSchema?.type === "integer") {
        let isValidCoordArray = true;
        let coordLength: number | null = null;
        for (const item of originalArray) {
          if (
            Object.prototype.hasOwnProperty.call(item, key) &&
            Array.isArray(item[key])
          ) {
            const arr = item[key] as unknown[];
            if (coordLength === null) coordLength = arr.length;
            if (
              arr.length !== coordLength ||
              (arr.length !== 2 && arr.length !== 3) ||
              !arr.every((v) => typeof v === "number")
            ) {
              isValidCoordArray = false;
              break;
            }
          } else if (Object.prototype.hasOwnProperty.call(item, key)) {
            isValidCoordArray = false;
            break;
          }
        }
        if (isValidCoordArray && coordLength !== null) {
          updatedProperties[key] = {
            type: "array",
            items: { type: "number" },
            minItems: coordLength,
            maxItems: coordLength,
          };
        }
      }
    }

    // 时间戳格式识别
    if (
      /timestamp|createdAt|updatedAt|occurredAt/i.test(key) &&
      currentSchema.type === "integer"
    ) {
      let isTimestampLike = true;
      const now = Date.now();
      const fiftyYearsAgo = now - 50 * 365 * 24 * 60 * 60 * 1000;
      for (const item of originalArray) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const val = item[key];
          if (
            typeof val !== "number" ||
            !Number.isInteger(val) ||
            val < fiftyYearsAgo
          ) {
            isTimestampLike = false;
            break;
          }
        }
      }
      if (isTimestampLike) {
        updatedProperties[key] = {
          type: "integer",
          format: "unix-timestamp",
          description: "Unix 时间戳（可能为毫秒）",
        };
      }
    }
    // 后续可在此扩展更多语义识别
  }
  return updatedProperties;
}

function processArrayOfObjects(
  itemSchemas: JSONSchema[],
  originalArray: Record<string, unknown>[],
): JSONSchema {
  let mergedProperties: Record<string, JSONSchema> = {};
  const propertyCounts: Record<string, number> = {};
  const totalItems = itemSchemas.length;

  for (const schema of itemSchemas) {
    const objSchema = asObjectSchema(schema);
    if (!objSchema.properties) continue;
    for (const [key, value] of Object.entries(objSchema.properties)) {
      propertyCounts[key] = (propertyCounts[key] || 0) + 1;
      if (key in mergedProperties) {
        mergedProperties[key] = mergeSchemas(mergedProperties[key], value);
      } else {
        mergedProperties[key] = value;
      }
    }
  }

  const requiredProps = Object.entries(propertyCounts)
    .filter(([_, count]) => count === totalItems)
    .map(([key, _]) => key);

  // 应用枚举识别
  mergedProperties = detectEnumsInArrayItems(
    mergedProperties,
    originalArray,
    totalItems,
  );

  // 应用语义格式识别
  mergedProperties = detectSemanticFormatsInArrayItems(
    mergedProperties,
    originalArray,
  );

  return {
    type: "object",
    properties: mergedProperties,
    required: requiredProps.length > 0 ? requiredProps.sort() : undefined,
  };
}

function inferArraySchema(obj: unknown[]): JSONSchema {
  if (obj.length === 0) return { type: "array", items: {} };

  const itemSchemas = obj.map((item) => inferSchema(item)); // 递归推断

  const firstItemSchema = asObjectSchema(itemSchemas[0]);
  const allSameType = itemSchemas.every(
    (schema) => asObjectSchema(schema).type === firstItemSchema.type,
  );

  if (allSameType) {
    if (firstItemSchema.type === "object") {
      const itemsSchema = processArrayOfObjects(
        itemSchemas,
        obj as Record<string, unknown>[],
      );
      return {
        type: "array",
        items: itemsSchema,
        minItems: 0, // 保持 minItems 一致
      };
    }
    return {
      type: "array",
      items: itemSchemas[0],
      minItems: 0,
    };
  }

  // 混合类型数组
  const uniqueSchemas = [
    ...new Map(itemSchemas.map((s) => [JSON.stringify(s), s])).values(),
  ];

  // 检查合并后的 Schema 是否只包含单一对象类型
  if (
    uniqueSchemas.length === 1 &&
    asObjectSchema(uniqueSchemas[0]).type === "object"
  ) {
    return {
      type: "array",
      items: uniqueSchemas[0],
      minItems: 0,
    };
  }

  return {
    type: "array",
    items:
      uniqueSchemas.length === 1 ? uniqueSchemas[0] : { oneOf: uniqueSchemas },
    minItems: 0,
  };
}

function inferStringSchema(str: string): JSONSchema {
  const formats: Record<string, RegExp> = {
    date: /^\d{4}-\d{2}-\d{2}$/,
    "date-time":
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
    email: /^[^@]+@[^@]+\.[^@]+$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    uri: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
  };

  for (const [format, regex] of Object.entries(formats)) {
    if (regex.test(str)) {
      return { type: "string", format };
    }
  }

  return { type: "string" };
}

function inferNumberSchema(num: number): JSONSchema {
  return Number.isInteger(num) ? { type: "integer" } : { type: "number" };
}

// --- 主推断函数 ---

/**
 * 根据 JSON 对象推断 JSON Schema
 * 参考 json-schema-generator 的推断策略
 */
export function inferSchema(obj: unknown): JSONSchema {
  if (obj === null) return { type: "null" };

  const type = Array.isArray(obj) ? "array" : typeof obj;

  switch (type) {
    case "object":
      return inferObjectSchema(obj as Record<string, unknown>); // 此处已完成对象类型判断
    case "array":
      return inferArraySchema(obj as unknown[]); // 此处已完成数组类型判断
    case "string":
      return inferStringSchema(obj as string);
    case "number":
      return inferNumberSchema(obj as number);
    case "boolean":
      return { type: "boolean" }; // 简单类型直接返回
    default:
      // 合法 JSON 不应进入此分支，返回空 Schema 作为兜底
      return {};
  }
}

/**
 * 根据 JSON 对象创建完整的 JSON Schema 文档
 */
export function createSchemaFromJson(jsonObject: unknown): JSONSchema {
  const inferredSchema = inferSchema(jsonObject);

  // 即使输入是数组或基础类型，也保证根 Schema 为对象
  const rootSchema = asObjectSchema(inferredSchema);
  const finalSchema: Record<string, unknown> = {
    $schema: "https://json-schema.org/draft-07/schema",
    title: "生成的 Schema",
    description: "根据 JSON 数据生成",
  };

  if (rootSchema.type === "object" || rootSchema.properties) {
    finalSchema.type = "object";
    finalSchema.properties = rootSchema.properties;
    if (rootSchema.required) finalSchema.required = rootSchema.required;
  } else if (rootSchema.type === "array" || rootSchema.items) {
    finalSchema.type = "array";
    finalSchema.items = rootSchema.items;
    if (rootSchema.minItems !== undefined)
      finalSchema.minItems = rootSchema.minItems;
    if (rootSchema.maxItems !== undefined)
      finalSchema.maxItems = rootSchema.maxItems;
  } else if (rootSchema.type) {
    // 处理根节点为基础类型的情况，例如输入仅为 "hello"
    // 此类输入较少见，但仍将其包装为对象以保持编辑器结构一致。
    finalSchema.type = "object";
    finalSchema.properties = { value: rootSchema };
    finalSchema.required = ["value"];
    finalSchema.title = "生成的 Schema（基础类型根节点）";
    finalSchema.description = "输入为基础类型，已包装为对象。";
  } else {
    // 完全无法推断时使用空对象 Schema
    finalSchema.type = "object";
  }

  return finalSchema as JSONSchema;
}
