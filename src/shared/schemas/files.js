// files schemas
export const imagesSchema = {
  type: "array",
  items: { type: "object", additionalProperties: true },
  maxItems: 10,
};
export const attachmentsSchema = {
  type: "array",
  items: { type: "object", additionalProperties: true },
  maxItems: 10,
};
