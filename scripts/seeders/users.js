import { faker } from "@faker-js/faker";
import { dateWindows, hash, createWindowSeeder } from "../utils.js";

export const seedUsers = createWindowSeeder({
  name: "users",

  getTotalWindows: (config) => Math.floor(config.spanYears / config.intervals),

  buildRecords: async ({ from, to, config }) => {
    const PASSWORD_HASH = await hash("testing123");
    const records = [];

    // records.push({
    //   name: "testing",
    //   email: "testing@gmail.com",
    //   password: PASSWORD_HASH,
    //   role: faker.helpers.arrayElement(["normal", "admin"]),
    //   image: null,
    //   emailVerified: faker.helpers.arrayElement([true, false]),
    //   createdAt: dateWindows.random(from, to),
    //   deletedAt: null,
    // });

    for (let i = 0; i < config.value; i++) {
      records.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: await hash("testing123" + Math.random()),
        role: faker.helpers.arrayElement(["normal", "admin"]),
        image: null,
        emailVerified: faker.helpers.arrayElement([true, false]),
        createdAt: dateWindows.random(from, to),
        deletedAt: null,
      });
    }

    return records;
  },

  insertRecords: ({ db, records }) =>
    db.collection("users").insertMany(records),
});
