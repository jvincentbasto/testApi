export const defaultSchema = {
  type: "object",
  required: ["name", "email", "password"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 2 },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    image: { type: "string", nullable: true },
    imageToRemove: {
      anyOf: [
        { type: "string", nullable: true },
        {
          type: "array",
          items: { type: "string", nullable: true },
        },
      ],
    },
    // customer: { type: "string", pattern: "^[a-fA-F0-9]{24}$", nullable: true },
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
