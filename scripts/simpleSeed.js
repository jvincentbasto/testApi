import { MongoClient, ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { hash } from "../src/utils/password.js";

dotenv.config();
const client = new MongoClient(process.env.MONGO_URI);

const USERS = 5;
const CUSTOMERS = 5;
const PRODUCTS = 5;
const VARIANTS_PER_PRODUCT = 5;
const SALES = 25;
const MAX_ITEMS_PER_SALE = 5;

function randomPastDate(daysBack = 365) {
  const past = new Date();
  past.setDate(past.getDate() - faker.number.int({ min: 0, max: daysBack }));
  return past;
}

async function seed() {
  await client.connect();
  const db = client.db();

  const users = db.collection("users");
  const customers = db.collection("customers");
  const products = db.collection("products");
  const productVariants = db.collection("productVariants");
  const sales = db.collection("sales");

  console.log("Cleaning collections...");
  await Promise.all([
    users.deleteMany({}),
    customers.deleteMany({}),
    products.deleteMany({}),
    productVariants.deleteMany({}),
    sales.deleteMany({}),
  ]);

  /* ---------------- USERS ---------------- */
  console.log("Seeding users...");
  const userDocs = [];
  userDocs.push({
    name: "testing",
    email: "testing@gmail.com",
    password: await hash("testing123"),
    // role: "user",
    image: null,
    emailVerified: false,
    createdAt: randomPastDate(),
    deletedAt: null,
  });

  for (let i = 0; i < USERS; i++) {
    userDocs.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: await hash("testing123"),
      // role: "user",
      image: null,
      emailVerified: true,
      createdAt: randomPastDate(),
      deletedAt: null,
    });
  }
  await users.insertMany(userDocs);

  /* ---------------- CUSTOMERS ---------------- */
  console.log("Seeding customers...");
  const customerDocs = [];
  for (let i = 0; i < CUSTOMERS; i++) {
    customerDocs.push({
      name: faker.company.name(),
      email: faker.internet.email().toLowerCase(),
      address: faker.location.streetAddress(),
      createdAt: randomPastDate(),
      deletedAt: null,
    });
  }
  const customerRes = await customers.insertMany(customerDocs);
  const customerIds = Object.values(customerRes.insertedIds);

  /* ---------------- PRODUCTS ---------------- */
  console.log("Seeding products...");
  const productDocs = [];
  for (let i = 0; i < PRODUCTS; i++) {
    productDocs.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      createdAt: randomPastDate(),
      deletedAt: null,
    });
  }
  const productRes = await products.insertMany(productDocs);
  const productIds = Object.values(productRes.insertedIds);

  /* ---------------- PRODUCT VARIANTS ---------------- */
  console.log("Seeding product variants...");
  const variantDocs = [];
  for (const productId of productIds) {
    for (let i = 0; i < VARIANTS_PER_PRODUCT; i++) {
      variantDocs.push({
        _id: new ObjectId(),
        product: productId,
        sku: faker.string.alphanumeric(8).toUpperCase(),
        stock: faker.number.int({ min: 50, max: 1000 }),
        price: faker.number.int({ min: 50, max: 500 }),
        color: faker.color.human(),
        size: faker.helpers.arrayElement(["S", "M", "L", "XL"]),
        createdAt: randomPastDate(),
        deletedAt: null,
      });
    }
  }
  const variantRes = await productVariants.insertMany(variantDocs);
  const variantList = Object.entries(variantRes.insertedIds).map(([i, id]) => ({
    _id: id,
    ...variantDocs[i],
  }));

  /* ---------------- SALES WITH TRANSACTION ---------------- */
  console.log("Seeding sales with transactions...");
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      for (let i = 0; i < SALES; i++) {
        const customerId = faker.helpers.arrayElement(customerIds);
        const itemsCount = faker.number.int({
          min: 1,
          max: MAX_ITEMS_PER_SALE,
        });
        const selectedVariants = faker.helpers
          .shuffle(variantList)
          .slice(0, itemsCount);

        const items = selectedVariants.map((variant) => ({
          product: variant._id,
          qty: faker.number.int({ min: 1, max: 10 }),
        }));

        // validate stock
        for (const item of items) {
          const variant = selectedVariants.find((v) =>
            v._id.equals(item.product),
          );
          if (variant.stock < item.qty)
            throw new Error("Insufficient stock during seeding");
        }

        // decrement stock
        for (const item of items) {
          await productVariants.updateOne(
            { _id: item.product },
            { $inc: { stock: -item.qty } },
            { session },
          );
        }

        // compute total
        const total = items.reduce((sum, item) => {
          const variant = selectedVariants.find((v) =>
            v._id.equals(item.product),
          );
          return sum + variant.price * item.qty;
        }, 0);

        // insert sale
        await sales.insertOne(
          {
            customer: customerId,
            items,
            total,
            createdAt: randomPastDate(),
            deletedAt: null,
          },
          { session },
        );
      }
    });

    console.log("Sales seeded with transaction successfully!");
  } finally {
    await session.endSession();
  }

  await client.close();
}

seed().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
