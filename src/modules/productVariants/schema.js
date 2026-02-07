import { imagesSchema } from "../../shared/schemas/files.js";

export const defaultSchema = {
  type: "object",
  required: ["product", "sku", "stock", "price"],
  additionalProperties: false,
  properties: {
    product: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    sku: { type: "string", minLength: 1 },
    stock: { type: "integer", minimum: 0 },
    price: { type: "integer", minimum: 0 },
    color: { type: "string", nullable: true },
    size: { type: "string", nullable: true },
    images: imagesSchema,
    imagesToRemove: {
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
