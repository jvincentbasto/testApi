import fp from "fastify-plugin";
import multipart from "@fastify/multipart";

export default fp(async (fastify) => {
  fastify.register(multipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 10 * 1024 * 1024, // optional
    },
  });

  const parse = async (req) => {
    if (!req.isMultipart()) return;

    for (const [key, value] of Object.entries(req.body)) {
      // skip file fields for now
      if (Array.isArray(value) && value[0]?.file) continue;
      if (value?.file) continue;

      // handle array of text fields
      if (Array.isArray(value)) {
        req.body[key] = value.map((v) => v.value);
      } else {
        req.body[key] = value.value;
      }
    }

    // single file object -> array
    for (const [key, value] of Object.entries(req.body)) {
      if (value?.file) {
        req.body[key] = [value];
      }
    }
  };
  const parseJsonField = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  };

  fastify.decorate("multipart", () => {
    const data = { parse, parseJsonField };

    return data;
  });
});
