import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async (fastify) => {
  fastify.register(jwt, {
    secret: fastify.config.JWT_SECRET,
  });
});
