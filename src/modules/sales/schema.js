import { main as fileSchemas } from "../../shared/schemas/files.js";

// sales items schemas
const salesItemsObject = {
  // productVariant
  product: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
  qty: { type: "integer", minimum: 1 },
};
const salesItemsReq = {
  anyOf: [
    {
      type: "array",
      items: {
        type: "object",
        required: ["product", "qty"],
        additionalProperties: false,
        properties: salesItemsObject,
      },
      minItems: 1,
    },
    { type: "string" },
  ],
};
const saleItemsRes = {
  anyOf: [
    {
      type: "array",
      items: {
        type: "object",
        properties: salesItemsObject,
        nullable: true,
      },
      minItems: 1,
    },
    { type: "string" },
  ],
};
export const salesItemsSchemas = {
  req: salesItemsReq,
  res: saleItemsRes,
};

// sales schemas
const salesObject = (values = {}, type = "req") => {
  const map = {
    customer: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
    items: salesItemsSchemas.req,
    // total: { type: "number", minimum: 0 },
    attachments: fileSchemas.attachments.default[type],
    attachmentsToRemove: fileSchemas.attachments.toRemove[type],
    ...values,
  };

  return map;
};
const salesReq = {
  type: "object",
  required: ["customer", "items"],
  additionalProperties: false,
  properties: salesObject({}, "req"),
};
const salesRes = {
  type: "object",
  properties: salesObject({}, "res"),
};
export const salesSchemas = {
  req: salesReq,
  req: salesRes,
};

// core schemas
const salesGetAllRes = {
  type: "array",
  items: salesRes,
};
const salesGetByIdRes = salesRes;
// post
const salesPostReq = {
  ...salesReq,
  properties: {
    ...salesReq.properties,
  },
};
const salesPostRes = {
  ...salesRes,
  properties: {
    ...salesRes.properties,
  },
};
// put
const salesPutReq = {
  ...salesReq,
  required: [],
  properties: {
    ...salesReq.properties,
  },
};
const salesPutRes = {
  ...salesReq,
  required: [],
  properties: {
    ...salesReq.properties,
  },
};
// remove
const salesRemoveRes = {
  type: "object",
  additionalProperties: true,
};

//
export const salesRouteSchemas = {
  getAll: salesGetAllRes,
  getById: salesGetByIdRes,
  post: {
    req: salesPostReq,
    res: salesPostRes,
  },
  put: {
    req: salesPutReq,
    res: salesPutRes,
  },
  remove: salesRemoveRes,
};

//
export const salesBulkRouteSchemas = {};

export const main = {
  default: salesRouteSchemas,
  bulk: salesBulkRouteSchemas,
};
export default main;
