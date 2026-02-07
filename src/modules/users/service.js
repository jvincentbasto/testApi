import { col } from "../../shared/models/users.js";
import { ObjectId } from "mongodb";

// core
export const getAll = async (f) => {
  return await col(f).find({ deletedAt: null }).toArray();
};
export const getById = async (f, id) => {
  return await col(f).findOne({ _id: new ObjectId(id), deletedAt: null });
};

export const create = async (f, d) => {
  const doc = {
    ...d,
    createdAt: new Date(),
    deletedAt: null,
  };
  const res = await col(f).insertOne(doc);

  return {
    _id: res.insertedId,
    ...doc,
    password: undefined,
  };
};
export const update = async (f, id, d) => {
  const res = await col(f).findOneAndUpdate(
    { _id: new ObjectId(id), deletedAt: null },
    { $set: d },
    { returnDocument: "after" },
  );

  return { ...res, password: undefined };
};
export const remove = async (f, id) => {
  // soft delete
  const res = await col(f).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { deletedAt: new Date() } },
    { returnDocument: "after" },
  );

  return { ...res, password: undefined };
};
export const forceRemove = async (f, id) => {
  // hard delete
  return await col(f).deleteOne({
    _id: new ObjectId(id),
  });
};

// bulk
// export const bulkCreate = async (f) => {};
// export const bulkUpdate = async (f) => {};
// export const bulkRemove = async (f) => {};
// export const bulkForceRemove = async (f) => {};
