import * as svc from "./service.js";

// core
export const getAll = (f) => async (req, reply) => {
  const res = await svc.getAll(f);
  return res;
};
export const getById = (f) => async (req, reply) => {
  const id = req.params.id;
  const res = await svc.getById(f, id);

  return res;
};

export const post = (f) => async (req, reply) => {
  let body = req.body;

  // parse items
  const pluginMultipart = f.multipart();
  body.items = pluginMultipart.parseJsonField(body.items);
  console.log("body", body);

  //
  const pluginUpload = f.upload();
  const uploadOptions = { table: "sales", field: "attachments" };

  // new files
  const files = Array.isArray(body.attachments)
    ? body.attachments
    : [body.attachments];
  body.attachments = req.isMultipart()
    ? await pluginUpload.upload.multiple(files, uploadOptions)
    : [];
  const res = await svc.create(f, body);

  return res;
};
export const put = (f) => async (req, reply) => {
  const id = req.params.id;
  const body = req.body;

  // parse items
  const pluginMultipart = f.multipart();
  body.items = pluginMultipart.parseJsonField(body.items);
  let attachmentsToRemove =
    pluginMultipart.parseJsonField(body.attachmentsToRemove) || [];

  attachmentsToRemove = Array.isArray(attachmentsToRemove)
    ? attachmentsToRemove
    : [attachmentsToRemove];

  //
  const pluginUpload = f.upload();
  const uploadOptions = { table: "sales", field: "attachments" };

  // new files
  let files = Array.isArray(body.attachments)
    ? body.attachments
    : body.attachments
      ? [body.attachments]
      : [];
  files = files.filter(Boolean); // remove undefined

  const uploaded =
    req.isMultipart() && files.length
      ? await pluginUpload.upload.multiple(files, uploadOptions)
      : [];

  // existing files
  const existing = await svc.getById(f, id);
  let existingImages = existing?.attachments || [];

  // remove files
  if (attachmentsToRemove.length) {
    const filesExist = attachmentsToRemove.filter(Boolean);
    if (filesExist.length) {
      await pluginUpload.remove.multiple(filesExist);
      existingImages = existingImages.filter(
        (img) => !filesExist.includes(img),
      );
    }
  }

  delete body.attachmentsToRemove;
  body.attachments = [...existingImages, ...uploaded];

  const res = await svc.update(f, id, body);
  return res;
};
export const remove = (f) => async (req, reply) => {
  const id = req.params.id;
  const force = req.query.force === "true";

  // existing record
  const existing = await svc.getById(f, id);
  if (!existing) {
    return reply.notFound("Record not found");
  }

  // initialize upload plugin
  const pluginUpload = f.upload();

  // collect file fields dynamically
  const fileFields = ["attachments"];
  let filesToRemove = [];

  for (const field of fileFields) {
    if (Array.isArray(existing[field])) {
      filesToRemove.push(...existing[field]);
    }
  }

  // remove only if forced
  if (force && filesToRemove.length) {
    await pluginUpload.remove.multiple(filesToRemove);
  }

  const res = force ? await svc.forceRemove(f, id) : await svc.remove(f, id);
  return res;
};

// bulk
// export const bulkPost = (f) => async (req, reply) => {};
// export const bulkPut = (f) => async (req, reply) => {};
// export const bulkRemove = (f) => async (req, reply) => {};

// sales by types
export const getYearlySales = (f) => async (req, reply) => {
  const body = req.body;
  const res = await svc.getYearlySales(f, body);

  return res;
};
export const getMonthlySales = (f) => async (req, reply) => {
  const body = req.body;
  const res = await svc.getMonthlySales(f, body);

  return res;
};
export const getWeeklySales = (f) => async (req, reply) => {
  const body = req.body;
  const res = await svc.getWeeklySales(f, body);

  return res;
};

// sales by filters
export const getSalesByRange = (f) => async (req) => {
  const body = req.body;
  const res = await svc.getSalesByRange(f, body);

  return res;
};
export const getSalesByBacktracing = (f) => async (req) => {
  const body = req.body;
  const res = await svc.getSalesByBacktracing(f, body);

  return res;
};

// sales by use cases
export const getSalesReports = (f) => async (req) => {
  const body = req.body;
  const res = await svc.getSalesReports(f, body);

  return res;
};
