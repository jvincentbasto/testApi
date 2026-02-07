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

  //
  const pluginUpload = f.upload();
  const uploadOptions = { table: "products", field: "images" };

  // new files
  const files = Array.isArray(body.images) ? body.images : [body.images];
  body.images = req.isMultipart()
    ? await pluginUpload.upload.multiple(files, uploadOptions)
    : [];
  const res = await svc.create(f, body);

  return res;
};
export const put = (f) => async (req, reply) => {
  const id = req.params.id;
  const body = req.body;

  // parse toRemove
  let imagesToRemove = body.imagesToRemove || [];
  if (typeof imagesToRemove === "string") {
    try {
      imagesToRemove = JSON.parse(imagesToRemove);
    } catch {
      imagesToRemove = [imagesToRemove];
    }
  }
  imagesToRemove = Array.isArray(imagesToRemove)
    ? imagesToRemove
    : [imagesToRemove];

  //
  const pluginUpload = f.upload();
  const uploadOptions = { table: "products", field: "images" };

  // new files
  let files = Array.isArray(body.images)
    ? body.images
    : body.images
      ? [body.images]
      : [];
  files = files.filter(Boolean); // remove undefined
  const uploaded =
    req.isMultipart() && files.length
      ? await pluginUpload.upload.multiple(files, uploadOptions)
      : [];

  // existing files
  const existing = await svc.getById(f, id);
  let existingImages = existing?.images || [];

  // remove files
  if (imagesToRemove.length) {
    const filesExist = imagesToRemove.filter(Boolean);
    if (filesExist.length) {
      await pluginUpload.remove.multiple(filesExist);
      existingImages = existingImages.filter(
        (img) => !filesExist.includes(img),
      );
    }
  }

  delete body.imagesToRemove;
  body.images = [...existingImages, ...uploaded];

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
  const fileFields = ["images"];
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
