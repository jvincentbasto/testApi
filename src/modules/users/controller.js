import * as svc from "./service.js";

import { hash } from "../../utils/password.js";
import { randomUUID } from "node:crypto";

// core
export const getAll = (f) => async (req, reply) => {
  const res = await svc.getAll(f);
  const users = res.map((m) => ({ ...m, password: undefined }));

  return users;
};
export const getById = (f) => async (req, reply) => {
  const id = req.params.id;
  const res = await svc.getById(f, id);

  return { ...res, password: undefined };
};

export const post = (f) => async (req, reply) => {
  const body = req.body;

  //
  const pluginUpload = f.upload();
  const uploadOptions = { table: "users", field: "image" };

  const user = {
    email: body.email,
    password: await hash(body.password),
    //
    // role: "user",
    // customer: null,
    image: null,
    // email verification
    emailVerified: false,
    emailToken: randomUUID(),
  };

  // new image
  const files = Array.isArray(body.image) ? body.image : [body.image];
  const uploaded = req.isMultipart()
    ? await pluginUpload.upload.multiple(files, uploadOptions)
    : [];
  if (uploaded.length) user.image = uploaded[0];

  const res = await svc.create(f, user);
  return res;
};
export const put = (f) => async (req, reply) => {
  const id = req.params.id;
  const body = req.body;

  // parse toRemove
  let imageToRemove = body.imageToRemove || [];
  if (typeof imageToRemove === "string") {
    try {
      imageToRemove = JSON.parse(imageToRemove);
    } catch {
      imageToRemove = [imageToRemove];
    }
  }
  imageToRemove = Array.isArray(imageToRemove)
    ? imageToRemove
    : [imageToRemove];

  //
  const pluginUpload = f.upload();
  const uploadOptions = { table: "users", field: "image" };

  const user = {
    ...body,
    password: await hash(body.password),
  };

  // new files
  let files = Array.isArray(user.image)
    ? user.image
    : user.image
      ? [user.image]
      : [];
  files = files.filter(Boolean); // remove undefined
  const uploaded =
    req.isMultipart() && files.length
      ? await pluginUpload.upload.multiple(files, uploadOptions)
      : [];

  // existing files
  const existing = await svc.getById(f, id);
  let existingImages = existing?.image || [];

  // remove files
  if (imageToRemove.length) {
    const filesExist = imageToRemove.filter(Boolean);
    if (filesExist.length) {
      await pluginUpload.remove.multiple(filesExist);
      existingImages = existingImages.filter(
        (img) => !filesExist.includes(img),
      );
    }
  }

  delete user.imageToRemove;
  user.image = [...existingImages, ...uploaded];

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
  const fileFields = ["image"];
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
