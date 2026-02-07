import { faker } from "@faker-js/faker";
import { ObjectId } from "mongodb";
import { randomInt, dateWindows, createWindowSeeder } from "../utils.js";

export const seedProductVariants = createWindowSeeder({
  name: "productVariants",

  getTotalWindows: (config) => Math.floor(config.spanWeeks / config.intervals),

  buildRecords: async ({ db, from, to, config }) => {
    const products = await db.collection("products").find().toArray();
    if (!products.length) return [];

    const records = [];

    for (const product of products) {
      const count = randomInt(config.min, config.max);

      for (let i = 0; i < count; i++) {
        records.push({
          _id: new ObjectId(),
          product: product._id,
          sku: faker.string.alphanumeric(8).toUpperCase(),
          stock: randomInt(50, 500),
          price: randomInt(50, 500),
          color: faker.color.human(),
          size: faker.helpers.arrayElement(["S", "M", "L", "XL"]),
          createdAt: dateWindows.random(from, to),
          deletedAt: null,
        });
      }
    }

    return records;
  },

  insertRecords: ({ db, records }) =>
    db.collection("productVariants").insertMany(records),
});
