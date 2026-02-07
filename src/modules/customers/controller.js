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
  const body = req.body;
  const res = await svc.create(f, body);

  return res;
};
export const put = (f) => async (req, reply) => {
  const id = req.params.id;
  const body = req.body;
  const res = await svc.update(f, id, body);

  return res;
};
export const remove = (f) => async (req, reply) => {
  const id = req.params.id;
  const force = req.query.force;

  const res = Boolean(force)
    ? await svc.forceRemove(f, id)
    : await svc.remove(f, id);

  return res;
};

// bulk
// export const bulkPost = (f) => async (req, reply) => {};
// export const bulkPut = (f) => async (req, reply) => {};
// export const bulkRemove = (f) => async (req, reply) => {};
