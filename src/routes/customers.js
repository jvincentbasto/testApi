import * as ctl from "../modules/customers/controller.js";
import * as schema from "../modules/customers/schema.js";

import { auth } from "../shared/middlewares/auth.js";

export default async function (f) {
  const prefix = "customers";
  const options = { preHandler: auth };

  // core
  f.get(`/${prefix}`, { ...options }, ctl.getAll(f));
  f.get(`/${prefix}/:id`, { ...options }, ctl.getById(f));

  f.post(
    `/${prefix}`,
    { ...options, schema: { body: schema.postSchema } },
    ctl.post(f),
  );
  f.put(
    `/${prefix}/:id`,
    { ...options, schema: { body: schema.putSchema } },
    ctl.put(f),
  );
  f.delete(`/${prefix}/:id`, { ...options }, ctl.remove(f));

  // bulk
  // f.post(`/${prefix}/bulk`, { ...options }, ctl.bulkPost(f));
  // f.put(`/${prefix}/bulk`, { ...options }, ctl.bulkPut(f));
  // f.delete(`/${prefix}/bulk`, { ...options }, ctl.bulkRemove(f));
}
