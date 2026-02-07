export const calendar_types = {
  weekly: "weekly",
  monthly: "monthly",
  yearly: "yearly",
};

export const SEED_CONFIG = {
  deterministic: true, // toggle this
  seed: 1337, // change seed = new dataset
  batchSize: 500,
  throttleMs: 20,
};

export const amounts = {
  users: {
    value: 25,
    type: calendar_types.yearly,
    intervals: 1,
  },
  customers: {
    value: 25,
    type: calendar_types.monthly,
    intervals: 2,
  },
  products: {
    value: 5,
    type: calendar_types.monthly,
    intervals: 1,
  },
  productVariants: {
    min: 1,
    max: 5,
    type: calendar_types.weekly,
    intervals: 30,
  },
  sales: {
    value: 50,
    items: { min: 1, max: 5 },
    type: calendar_types.weekly,
    intervals: 25,
  },
};

export const orders = [
  "users",
  "customers",
  "products",
  "productVariants",
  "sales",
];
