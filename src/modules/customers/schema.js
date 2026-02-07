export const defaultSchema = {
  type: "object",
  required: ["name", "email"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 2 },
    email: { type: "string", format: "email" },
    address: { type: "string", minLength: 2 },
    // user: { type: "string", pattern: "^[a-fA-F0-9]{24}$", nullable: true },
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
