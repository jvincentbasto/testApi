import { imagesSchema } from "../../shared/schemas/files.js";

export const defaultSchema = {
  type: "object",
  required: ["name"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 2 },
    description: { type: "string", minLength: 2 },
    categoryId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    subCategoryId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    // store: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    // owner: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
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
