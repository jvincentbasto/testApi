import { faker } from "@faker-js/faker";
import { dateWindows, createWindowSeeder } from "../utils.js";

export const seedProducts = createWindowSeeder({
  name: "products",

  getTotalWindows: (config) => Math.floor(config.spanMonths / config.intervals),

  buildRecords: async ({ from, to, config }) =>
    Array.from({ length: config.value }).map(() => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      createdAt: dateWindows.random(from, to),
      deletedAt: null,
    })),

  insertRecords: ({ db, records }) =>
    db.collection("products").insertMany(records),

  chunkSize: 50,
});
