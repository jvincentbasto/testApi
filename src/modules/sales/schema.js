import { attachmentsSchema } from "../../shared/schemas/files.js";

export const saleItemSchema = {
  type: "object",
  required: ["product", "qty"],
  additionalProperties: false,
  properties: {
    product: { type: "string", pattern: "^[a-fA-F0-9]{24}$" }, // productVariant
    qty: { type: "integer", minimum: 1 },
  },
};
export const defaultSchema = {
  type: "object",
  required: ["customer", "items"],
  additionalProperties: false,
  properties: {
    customer: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    items: {
      anyOf: [
        {
          type: "array",
          minItems: 1,
          items: saleItemSchema,
        },
        {
          type: "string",
        },
      ],
    },
    // total: { type: "number", minimum: 0 },
    attachments: attachmentsSchema,
    attachmentsToRemove: {
      anyOf: [
        { type: "string", nullable: true },
        {
          type: "array",
          items: { type: "string", nullable: true },
        },
      ],
    },
  },
};
export default defaultSchema;

export const postSchema = {
  ...defaultSchema,
  properties: {
    ...defaultSchema.properties,
  },
};
export const putSchema = {
  ...defaultSchema,
  required: [],
  properties: {
    ...defaultSchema.properties,
  },
};

const dateInputSchema = {
  anyOf: [
    // YYYY-MM-DD
    { type: "string", format: "date" },

    // ISO datetime
    { type: "string", format: "date-time" },

    // timestamp as string
    { type: "string", pattern: "^[0-9]{10,13}$" },

    // timestamp as number (optional but recommended)
    { type: "integer" },
  ],
};
const reportSchema = {
  type: "object",
  additionalProperties: false,
  required: [],
  properties: {
    // time units
    year: { type: "integer", minimum: 1970 },
    month: { type: "integer", minimum: 1, maximum: 12 },
    week: { type: "integer", minimum: 1, maximum: 53 },
    // backtracing units
    backtrackYear: { type: "integer" },
    backtrackMonth: { type: "integer" },
    backtrackWeek: { type: "integer" },
    backtrackDay: { type: "integer" },
    // ranges
    startDate: dateInputSchema,
    endDate: dateInputSchema,
    backtrackStartDate: dateInputSchema,
    // fields
    customer: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    products: {
      type: "array",
      items: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    }, // productVariant
  },
};

const getProperties = (keys, props) => {
  return keys.reduce((acc, key) => {
    acc[key] = props[key];
    return acc;
  }, {});
};

// reports by types
const reportsYearlySchema = {
  ...reportSchema,
  required: [],
  properties: {
    ...getProperties(["customer", "products", "year"], reportSchema.properties),
  },
};
const reportsMonthlySchema = {
  ...reportSchema,
  required: [],
  properties: {
    ...getProperties(
      ["customer", "products", "year", "month"],
      reportSchema.properties,
    ),
  },
};
const reportsWeeklySchema = {
  ...reportSchema,
  required: [],
  properties: {
    ...getProperties(
      ["customer", "products", "year", "week"],
      reportSchema.properties,
    ),
  },
};

// reports by filters
const reportsByRangeSchema = {
  ...reportSchema,
  required: [],
  properties: {
    ...getProperties(
      ["customer", "products", "startDate", "endDate"],
      reportSchema.properties,
    ),
  },
};
const reportsByBacktracingSchema = {
  ...reportSchema,
  required: [],
  properties: {
    ...getProperties(
      ["customer", "products", "startDate"],
      reportSchema.properties,
    ),
    year: { type: "integer" },
    month: { type: "integer" },
    week: { type: "integer" },
    day: { type: "integer" },
  },
};

export const reports = {
  dateInput: dateInputSchema,
  default: reportSchema,
  // calendar based
  yearly: reportsYearlySchema,
  monthly: reportsMonthlySchema,
  weekly: reportsWeeklySchema,
  // filters
  byRange: reportsByRangeSchema,
  byBacktracing: reportsByBacktracingSchema,
};
