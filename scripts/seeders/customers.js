import { faker } from "@faker-js/faker";
import { dateWindows, createWindowSeeder } from "../utils.js";

export const seedCustomers = createWindowSeeder({
  name: "customers",

  getTotalWindows: (config) => Math.floor(config.spanMonths / config.intervals),

  buildRecords: async ({ from, to, config }) =>
    Array.from({ length: config.value }).map(() => ({
      name: faker.company.name(),
      email: faker.internet.email().toLowerCase(),
      address: faker.location.streetAddress(),
      createdAt: dateWindows.random(from, to),
      deletedAt: null,
    })),

  insertRecords: ({ db, records }) =>
    db.collection("customers").insertMany(records),
});
