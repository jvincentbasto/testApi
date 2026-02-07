import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, {
    schema: {
      type: "object",
      required: ["MONGO_URI", "JWT_SECRET", "URL"],
      properties: {
        NODE_ENV: { type: "string" },
        URL: { type: "string" },
        PORT: { type: "string" },
        //
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
