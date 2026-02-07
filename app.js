import autoload from "@fastify/autoload";
import { join } from "node:path";

export default async function (fastify, opts) {
  await fastify.register(autoload, {
    dir: join(process.cwd(), "src/plugins"),
  });

  await fastify.register(autoload, {
    dir: join(process.cwd(), "src/routes"),
    options: { prefix: "/api" },
  });
}

export const options = {
  port: process.env.PORT ?? 3000,
  host: process.env.HOST ?? "127.0.0.1",
  logger: {
    level: "info",
  },
  // connectionTimeout: 30_000,
  // requestTimeout: 60_000,
};
