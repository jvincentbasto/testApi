import Fastify from "fastify";
import autoload from "@fastify/autoload";
import { join } from "node:path";

async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(autoload, {
    dir: join(process.cwd(), "src/plugins"),
  });

  await app.register(autoload, {
    dir: join(process.cwd(), "src/routes"),
    options: { prefix: "/api" },
  });

  return app;
}

const app = await buildApp();
await app.listen({ port: process.env.PORT || 3000 });
