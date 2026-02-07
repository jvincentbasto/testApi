import fp from "fastify-plugin";
import blipp from "fastify-blipp";

export default fp(async (fastify) => {
  if (process.env.NODE_ENV !== "production") {
    fastify.register(blipp);

    fastify.addHook("onReady", async () => {
      // console.log(fastify.printRoutes());
    });
  }
});
