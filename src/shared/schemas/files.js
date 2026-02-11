// file schema helpers
const fileReqHelper = (values = {}) => {
  const map = {
    ...(values ?? {}),
    anyOf: [
      // single
      {
        type: "object",
        additionalProperties: true,
      },
      // multiple
      {
        type: "array",
        items: { type: "object", additionalProperties: true },
        maxItems: 10,
      },
      ...(values?.anyOf ?? []),
    ],
  };

  return map;
};
const fileResHelper = (values = {}) => {
  const map = {
    ...(values ?? {}),
    anyOf: [
      // array objets
      {
        type: "array",
        items: { type: "object", additionalProperties: true, nullable: true },
        maxItems: 10,
      },
      // array strings
      {
        type: "array",
        items: { type: "string", nullable: true },
        maxItems: 10,
      },
      // string
      {
        type: "string",
        nullable: true,
      },
      ...(values?.anyOf ?? []),
    ],
  };

  return map;
};
export const fileSchemaHelpers = {
  req: fileReqHelper,
  res: fileResHelper,
};

// toRemove files schemas
const fileToRemoveReqHelper = (values = {}) => {
  const map = {
    ...(values ?? {}),
    anyOf: [
      // json
      {
        type: "array",
        items: { type: "string", nullable: true },
      },
      {
        type: "array",
        items: { type: "object", additionalProperties: true, nullable: true },
      },
      // form-data
      { type: "string", nullable: true },
    ],
    ...(values?.anyOf ?? []),
  };

  return map;
};
const fileToRemoveResHelper = (values = {}) => {
  const map = {
    ...(values ?? {}),
    anyOf: [
      // multiple
      {
        type: "array",
        items: { type: "string", nullable: true },
      },
      {
        type: "array",
        items: { type: "object", additionalProperties: true, nullable: true },
      },
      // single
      { type: "string", nullable: true },
      { type: "object", additionalProperties: true, nullable: true },
    ],
    ...(values?.anyOf ?? []),
  };

  return map;
};
export const fileToRemoveSchemaHelpers = {
  req: fileToRemoveReqHelper,
  res: fileToRemoveResHelper,
};

// images schemas
const imagesReq = fileReqHelper({});
const imagesRes = fileResHelper({});
const imagesToRemoveReq = fileToRemoveReqHelper({});
const imagesToRemoveRes = fileToRemoveReqHelper({});
export const imagesSchemas = {
  default: {
    req: imagesReq,
    res: imagesRes,
  },
  toRemove: {
    req: imagesToRemoveReq,
    res: imagesToRemoveRes,
  },
};

// audios schemas
const audiosReq = fileReqHelper({});
const audiosRes = fileResHelper({});
const audiosToRemoveReq = fileToRemoveReqHelper({});
const audiosToRemoveRes = fileToRemoveReqHelper({});
export const audiosSchemas = {
  default: {
    req: audiosReq,
    res: audiosRes,
  },
  toRemove: {
    req: audiosToRemoveReq,
    res: audiosToRemoveRes,
  },
};

// videos schemas
const videosReq = fileReqHelper({});
const videosRes = fileResHelper({});
const videosToRemoveReq = fileToRemoveReqHelper({});
const videosToRemoveRes = fileToRemoveReqHelper({});
export const videosSchemas = {
  default: {
    req: videosReq,
    res: videosRes,
  },
  toRemove: {
    req: videosToRemoveReq,
    res: videosToRemoveRes,
  },
};

// attachments schemas
const attachmentsReq = fileReqHelper({});
const attachmentsRes = fileResHelper({});
const attachmentsToRemoveReq = fileToRemoveReqHelper({});
const attachmentsToRemoveRes = fileToRemoveReqHelper({});
export const attachmentsSchemas = {
  default: {
    req: attachmentsReq,
    res: attachmentsRes,
  },
  toRemove: {
    req: attachmentsToRemoveReq,
    res: attachmentsToRemoveRes,
  },
};

export const main = {
  helpers: {
    file: fileSchemaHelpers,
    fileToRemove: fileToRemoveSchemaHelpers,
  },
  images: imagesSchemas,
  audios: audiosSchemas,
  videos: videosSchemas,
  attachments: attachmentsSchemas,
};
export default main;

export const imagesSchema = {
  type: "array",
  items: { type: "object", additionalProperties: true },
  maxItems: 10,
};
