import { col } from "../../shared/models/productVariants.js";
import { ObjectId } from "mongodb";

// core
export const getAll = async (f) => {
  return col(f).find({ deletedAt: null }).toArray();
};
export const getById = async (f, id) => {
  return col(f).findOne({ _id: new ObjectId(id), deletedAt: null });
};

export const create = async (f, d) => {
  const doc = {
    ...d,
    product: new ObjectId(d.product),
    createdAt: new Date(),
    deletedAt: null,
  };
  const res = await col(f).insertOne(doc);

  return {
    _id: res.insertedId,
    ...doc,
  };
};
export const update = async (f, id, d) => {
  const updateDoc = { ...d };
  if (d.product) {
    updateDoc.product = new ObjectId(d.product);
  }

  const res = await col(f).findOneAndUpdate(
    { _id: new ObjectId(id), deletedAt: null },
    { $set: updateDoc },
    { returnDocument: "after" },
  );

  return res;
};
export const remove = async (f, id) => {
  // soft delete
  return col(f).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { deletedAt: new Date() } },
    { returnDocument: "after" },
  );
};
export const forceRemove = async (f, id) => {
  // hard delete
  return col(f).deleteOne({
    _id: new ObjectId(id),
  });
};

// bulk
// export const bulkCreate = async (f) => {};
// export const bulkUpdate = async (f) => {};
// export const bulkRemove = async (f) => {};
// export const bulkForceRemove = async (f) => {};
