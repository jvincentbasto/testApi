import { MongoClient } from "mongodb";
import dotenv from "dotenv";

import { amounts, SEED_CONFIG } from "./config.js";
import { computeBacktrackRange, setupFaker } from "./utils.js";

import { seedUsers } from "./seeders/users.js";
import { seedCustomers } from "./seeders/customers.js";
import { seedProducts } from "./seeders/products.js";
import { seedProductVariants } from "./seeders/productVariants.js";
import { seedSales } from "./seeders/sales.js";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

/* ---------------- CLEANUP ---------------- */
const cleanup = async (db) => {
  console.log("Cleaning collections...");

  // delete dependents first
  await Promise.all([
    db.collection("sales").deleteMany({}),
    db.collection("productVariants").deleteMany({}),
    db.collection("products").deleteMany({}),
    db.collection("customers").deleteMany({}),
    db.collection("users").deleteMany({}),
    db.collection("tokenBlacklist").deleteMany({}),
  ]);
};

/* ---------------- INDEXES ---------------- */
const setupTables = async (db) => {
  console.log("Setting up indexes...");

  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("customers").createIndex({ email: 1 }),
    db.collection("products").createIndex({ createdAt: 1 }),
    db.collection("productVariants").createIndex({ product: 1 }),
    db.collection("productVariants").createIndex({ stock: 1 }),
    db.collection("sales").createIndex({ createdAt: 1 }),
    db.collection("sales").createIndex({ customer: 1 }),
  ]);
};

/* ---------------- SEED ---------------- */
const seed = async () => {
  console.log("Starting seed...");
  setupFaker(SEED_CONFIG);

  await client.connect();
  const db = client.db();

  if (process.env.SEED_CLEAN === "true" || true) {
    await cleanup(db);
  }

  await setupTables(db);

  const { start, end } = computeBacktrackRange({
    year: 5,
    month: 6,
    week: 20,
    day: 45,
  });

  const spanYears = end.getFullYear() - start.getFullYear();
  const spanMonths = spanYears * 12 + (end.getMonth() - start.getMonth());
  const spanWeeks = Math.floor(
    (end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  await seedUsers({
    db,
    start,
    config: { ...amounts.users, spanYears },
  });

  await seedCustomers({
    db,
    start,
    config: { ...amounts.customers, spanMonths },
  });

  await seedProducts({
    db,
    start,
    config: { ...amounts.products, spanMonths },
  });

  await seedProductVariants({
    db,
    start,
    config: { ...amounts.productVariants, spanWeeks },
  });

  // sales is special: needs transactions + client
  await seedSales({
    client,
    db,
    start,
    config: { ...amounts.sales, spanWeeks },
  });

  await client.close();
  console.log("Seeding complete");
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
