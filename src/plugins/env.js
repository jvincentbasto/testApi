import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, {
    schema: {
      type: "object",
      required: ["MONGO_URI", "JWT_SECRET"],
      properties: {
        PORT: { type: "string" },
        NODE_ENV: { type: "string" },
        MONGO_URI: { type: "string" },
        JWT_SECRET: { type: "string" },
        CLOUDINARY_URL: { type: "string" },
      },
    },
    dotenv: {
      path: ".env",
      debug: process.env.NODE_ENV !== "production",
    },
  });
});
