import fp from "fastify-plugin";
import mongo from "@fastify/mongodb";

export default fp(async (fastify) => {
  await fastify.register(mongo, {
    url: fastify.config.MONGO_URI,
  });

  // onReady hook
  fastify.addHook("onReady", async () => {
    const db = fastify.mongo.db;

    // auto delete expired blacklist entries
    await db
      .collection("tokenBlacklist")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    // prevent duplicate JTIs
    await db
      .collection("tokenBlacklist")
      .createIndex({ jti: 1 }, { unique: true });

    // sales
    await db.collection("sales").createIndex({ createdAt: 1, deletedAt: 1 });
    await db.collection("sales").createIndex({ customer: 1 });
    await db.collection("sales").createIndex({ "items.product": 1 });
  });
});
