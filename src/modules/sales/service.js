import { col } from "../../shared/models/sales.js";
import { col as productVariantCol } from "../../shared/models/productVariants.js";
import { ObjectId } from "mongodb";

import { dates } from "../../utils/date.js";
import { helpers } from "./helpers.js";

// core
export const getAll = async (f) => {
  return col(f).find({ deletedAt: null }).toArray();
};
export const getById = async (f, id) => {
  return col(f).findOne({ _id: new ObjectId(id), deletedAt: null });
};

export const create = async (f, d) => {
  const session = f.mongo.client.startSession();

  try {
    let result;

    // transaction
    await session.withTransaction(async () => {
      // ids
      const variantIds = d.items.map((item) => new ObjectId(item.product));

      // product variants
      const variants = await productVariantCol(f)
        .find(
          {
            _id: { $in: variantIds },
            deletedAt: null,
          },
          { session },
        )
        .toArray();

      if (variants.length !== d.items.length) {
        throw new Error("Variant not found");
      }

      // validate and deduct stocks
      for (const item of d.items) {
        const variant = variants.find((v) => v._id.toString() === item.product);

        if (!variant || variant.stock < item.qty) {
          throw new Error("Insufficient stock");
        }

        await productVariantCol(f).updateOne(
          { _id: variant._id },
          { $inc: { stock: -item.qty } },
          { session },
        );
      }

      // compute total
      const total = d.items.reduce((sum, item) => {
        const variant = variants.find((v) => v._id.toString() === item.product);

        return sum + variant.price * item.qty;
      }, 0);

      // insert
      const saleDoc = {
        ...d,
        customer: new ObjectId(d.customer),
        items: d.items.map((item) => ({
          product: new ObjectId(item.product),
          qty: item.qty,
        })),
        total,
        createdAt: new Date(),
        deletedAt: null,
      };
      const res = await col(f).insertOne(saleDoc, { session });

      result = {
        _id: res.insertedId,
        ...saleDoc,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
export const update = async (f, id, d) => {
  const session = f.mongo.client.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const salesCollection = col(f);
      const variantCollection = productVariantCol(f);

      // 1️⃣ Fetch existing sale
      const existingSale = await salesCollection.findOne(
        { _id: new ObjectId(id), deletedAt: null },
        { session },
      );

      if (!existingSale) {
        throw new Error("Sale not found");
      }

      // 2️⃣ Restore stock from old items
      for (const item of existingSale.items) {
        await variantCollection.updateOne(
          { _id: new ObjectId(item.product) },
          { $inc: { stock: item.qty } },
          { session },
        );
      }

      // 3️⃣ Prepare new variant ids
      const variantIds = d.items.map((item) => new ObjectId(item.product));

      const variants = await variantCollection
        .find({ _id: { $in: variantIds }, deletedAt: null }, { session })
        .toArray();

      if (variants.length !== d.items.length) {
        throw new Error("One or more variants not found");
      }

      // 4️⃣ Validate and deduct new stock
      for (const item of d.items) {
        const variant = variants.find((v) => v._id.toString() === item.product);
        if (!variant || variant.stock < item.qty) {
          throw new Error("Insufficient stock for one or more items");
        }

        await variantCollection.updateOne(
          { _id: variant._id },
          { $inc: { stock: -item.qty } },
          { session },
        );
      }

      // 5️⃣ Compute total
      const total = d.items.reduce((sum, item) => {
        const variant = variants.find((v) => v._id.toString() === item.product);
        return sum + variant.price * item.qty;
      }, 0);

      // 6️⃣ Update sale
      const updateDoc = {
        ...d,
        customer: d.customer ? new ObjectId(d.customer) : existingSale.customer,
        items: d.items.map((item) => ({
          product: new ObjectId(item.product),
          qty: item.qty,
        })),
        total,
      };

      const res = await salesCollection.findOneAndUpdate(
        { _id: new ObjectId(id), deletedAt: null },
        { $set: updateDoc },
        { returnDocument: "after", session },
      );

      result = res;
    });

    return result;
  } finally {
    await session.endSession();
  }
};
export const remove = async (f, id) => {
  const session = f.mongo.client.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const sale = await col(f).findOne(
        { _id: new ObjectId(id), deletedAt: null },
        { session },
      );

      if (!sale) throw new Error("Sale not found");

      // restore stock
      for (const item of sale.items) {
        await productVariantCol(f).updateOne(
          { _id: new ObjectId(item.product) },
          { $inc: { stock: item.qty } },
          { session },
        );
      }

      result = await col(f).updateOne(
        { _id: sale._id },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after", session },
      );
    });

    return result;
  } finally {
    await session.endSession();
  }
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

// sales reports by types | calendar based
export const getYearlySales = async (f, payload) => {
  const year = payload.year ?? dates.getCurrentYear();

  const start = new Date(year, 0, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, 11, 31);
  end.setHours(23, 59, 59, 999);

  return col(f)
    .aggregate(
      helpers.buildReportPipeline({
        start,
        end,
        customer: payload.customer,
        products: payload.products,
      }),
    )
    .toArray();
};
export const getMonthlySales = async (f, payload) => {
  const year = payload.year ?? dates.getCurrentYear();
  const month = payload.month ?? dates.getCurrentMonth();

  const start = new Date(year, month - 1, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, month, 0);
  end.setHours(23, 59, 59, 999);

  return col(f)
    .aggregate(
      helpers.buildReportPipeline({
        start,
        end,
        customer: payload.customer,
        products: payload.products,
      }),
    )
    .toArray();
};
export const getWeeklySales = async (f, payload) => {
  const year = payload.year ?? dates.getCurrentYear();
  const week = payload.week ?? dates.getCurrentWeek();

  // validate
  helpers.validateISOWeek(year, week);

  // ISO week start (Monday)
  const jan4 = new Date(year, 0, 4);
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return col(f)
    .aggregate(
      helpers.buildReportPipeline({
        start,
        end,
        customer: payload.customer,
        products: payload.products,
      }),
    )
    .toArray();
};

// sales reports by filters
export const getSalesByRange = async (f, payload) => {
  const { start, end } = helpers.normalizeDateRange({
    startDate: payload.startDate,
    endDate: payload.endDate,
  });

  return col(f)
    .aggregate(
      helpers.buildReportPipeline({
        start,
        end,
        customer: payload.customer,
        products: payload.products,
      }),
    )
    .toArray();
};
export const getSalesByBacktracing = async (f, payload) => {
  const { year = 0, month = 0, week = 0, day = 0, ...rest } = payload;
  const { defaultDays = 30, startDate, customer, products } = rest;

  const now = new Date();
  let end = dates.parseDate(startDate) || new Date(now);

  // normalize end to end-of-day
  end.setHours(23, 59, 59, 999);

  let start = new Date(end);
  const hasAnyUnit = year || month || week || day;

  // default: last 30 days
  if (!hasAnyUnit) {
    start.setDate(start.getDate() - defaultDays);
  } else {
    if (year) {
      start.setFullYear(start.getFullYear() - year);
    }
    if (month) {
      start.setMonth(start.getMonth() - month);
    }
    if (week) {
      start.setDate(start.getDate() - week * 7);
    }
    if (day) {
      start.setDate(start.getDate() - day);
    }
  }

  // normalize start to start-of-day
  start.setHours(0, 0, 0, 0);

  return col(f)
    .aggregate(
      helpers.buildReportPipeline({
        start,
        end,
        customer,
        products,
      }),
    )
    .toArray();
};

// sales reports by use cases
export const getSalesReports = async (f, payload) => {
  const { year, month, week, startDate, endDate, ...rest } = payload;
  const {
    backtrackYear,
    backtrackMonth,
    backtrackWeek,
    backtrackDay,
    backtrackStartDate,
  } = rest;

  // sales by filters
  if (startDate || endDate) {
    const res = await getSalesByRange(f, payload);
    return {
      data: res,
      meta: { type: "by-range", startDate, endDate },
    };
  }

  // sales by types
  if (year && week) {
    const res = await getWeeklySales(f, payload);
    return {
      data: res,
      meta: { type: "weekly", year, week },
    };
  }
  if (year && month) {
    const res = await getMonthlySales(f, payload);
    return {
      data: res,
      meta: { type: "monthly", year, month },
    };
  }
  if (year) {
    const res = await getYearlySales(f, payload);
    return {
      data: res,
      meta: { type: "yearly", year },
    };
  }

  // Backtracing (default + relative time)
  const res = await getSalesByBacktracing(f, payload);
  return {
    data: res,
    meta: {
      type: "by-backtracing",
      year: backtrackYear,
      month: backtrackMonth,
      week: backtrackWeek,
      day: backtrackDay,
      startDate: backtrackStartDate,
    },
  };
};
