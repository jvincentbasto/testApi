import * as ctl from "../modules/sales/controller.js";
import * as schema from "../modules/sales/schema.js";

import { auth } from "../shared/middlewares/auth.js";
const { reports } = schema;

export default async function (f) {
  const prefix = "sales";
  const options = { preHandler: auth };

  // core
  f.get(`/${prefix}`, { ...options }, ctl.getAll(f));
  f.get(`/${prefix}/:id`, { ...options }, ctl.getById(f));

  f.post(
    `/${prefix}`,
    {
      ...options,
      preValidation: async (req) => {
        const pluginMultipart = f.multipart();
        pluginMultipart.parse(req);
        console.log("req.body", req.body);
      },

      schema: { body: schema.postSchema },
    },
    ctl.post(f),
  );
  f.put(
    `/${prefix}/:id`,
    {
      ...options,
      preValidation: async (req) => {
        const pluginMultipart = f.multipart();
        pluginMultipart.parse(req);
      },

      schema: { body: schema.putSchema },
    },
    ctl.put(f),
  );
  f.delete(`/${prefix}/:id`, { ...options }, ctl.remove(f));

  // bulk
  // f.post(`/${prefix}/bulk`, { ...options }, ctl.bulkPost(f));
  // f.put(`/${prefix}/bulk`, { ...options }, ctl.bulkPut(f));
  // f.delete(`/${prefix}/bulk`, { ...options }, ctl.bulkRemove(f));

  // sales by types
  f.post(
    `/${prefix}/reports/yearly`,
    { ...options, schema: { body: reports.yearly } },
    ctl.getYearlySales(f),
  );
  f.post(
    `/${prefix}/reports/monthly`,
    { ...options, schema: { body: reports.monthly } },
    ctl.getMonthlySales(f),
  );
  f.post(
    `/${prefix}/reports/weekly`,
    { ...options, schema: { body: reports.weekly } },
    ctl.getWeeklySales(f),
  );

  // sales by filters
  f.post(
    `/${prefix}/reports/by-range`,
    { ...options, schema: { body: reports.byRange } },
    ctl.getSalesByRange(f),
  );
  f.post(
    `/${prefix}/reports/by-backtracing`,
    { ...options, schema: { body: reports.byBacktracing } },
    ctl.getSalesByBacktracing(f),
  );

  // sales by use cases
  f.post(
    `/${prefix}/reports`,
    { ...options, schema: { body: reports.default } },
    ctl.getSalesReports(f),
  );
}
