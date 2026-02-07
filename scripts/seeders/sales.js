import { faker } from "@faker-js/faker";
import { dateWindows, randomInt, createWindowSeeder } from "../utils.js";

export const seedSales = async ({ client, db, start, config }) => {
  const customers = await db.collection("customers").find().toArray();
  if (!customers.length) return;

  const seeder = createWindowSeeder({
    name: "sales",

    getTotalWindows: (config) =>
      Math.floor(config.spanWeeks / config.intervals),

    buildRecords: async () => Array.from({ length: config.value }), // placeholders

    insertRecords: async ({ records, from, to }) => {
      const session = client.startSession();

      try {
        await session.withTransaction(async () => {
          const variants = await db
            .collection("productVariants")
            .find({ deletedAt: null, stock: { $gt: 0 } })
            .toArray();

          if (variants.length < config.items.min) return;

          for (let i = 0; i < records.length; i++) {
            const customer = faker.helpers.arrayElement(customers);
            const itemCount = randomInt(config.items.min, config.items.max);

            const picked = faker.helpers.shuffle(variants).slice(0, itemCount);

            const items = [];
            let total = 0;

            for (const v of picked) {
              const qty = randomInt(1, 5);
              if (v.stock < qty) continue;

              items.push({ product: v._id, qty });
              total += v.price * qty;

              await db
                .collection("productVariants")
                .updateOne(
                  { _id: v._id },
                  { $inc: { stock: -qty } },
                  { session },
                );
            }

            if (!items.length) continue;

            await db.collection("sales").insertOne(
              {
                customer: customer._id,
                items,
                total,
                createdAt: dateWindows.random(from, to),
                deletedAt: null,
              },
              { session },
            );
          }
        });
      } finally {
        await session.endSession();
      }
    },

    chunkSize: 1, // sales MUST be serialized
    delayMs: 5,
  });

  await seeder({ db, start, config });
};
