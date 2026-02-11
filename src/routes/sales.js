import * as ctl from "../modules/sales/controller.js";
import { main as salesSchemas } from "../modules/sales/schema.js";
import { main as salesReportsSchemas } from "../modules/sales/schemaSalesReport.js";

import { auth } from "../shared/middlewares/auth.js";

const routeOptions = () => {
  const name = "sales";
  const options = { preHandler: auth };

  const getAll = (values = {}) => {
    const map = {
      ...options,
      ...values,
      //
      schema: {
        tags: [name],
        summary: `Get all ${name}`,
        description: `List of ${name}`,
        //
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
            },
          },
          ...(values.response ?? {}),
        },
        ...(values.schema ?? {}),
      },
    };

    return map;
  };
  const getById = (values = {}) => {
    const map = {
      ...options,
      ...values,
      //
      schema: {
        tags: [name, "id"],
        summary: `Get by ${name} Id`,
        //
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          },
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
            },
          },
          ...(values.response ?? {}),
        },
        ...(values.schema ?? {}),
      },
    };

    return map;
  };
};

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
      },
      schema: { body: salesSchemas.default.post.req },
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
      schema: { body: salesSchemas.default.put.req },
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
    { ...options, schema: { body: salesReportsSchemas.calendar.yearly.req } },
    ctl.getYearlySales(f),
  );
  f.post(
    `/${prefix}/reports/monthly`,
    { ...options, schema: { body: salesReportsSchemas.calendar.monthly.req } },
    ctl.getMonthlySales(f),
  );
  f.post(
    `/${prefix}/reports/weekly`,
    { ...options, schema: { body: salesReportsSchemas.calendar.weekly.req } },
    ctl.getWeeklySales(f),
  );

  // sales by filters
  f.post(
    `/${prefix}/reports/by-range`,
    { ...options, schema: { body: salesReportsSchemas.range.req } },
    ctl.getSalesByRange(f),
  );
  f.post(
    `/${prefix}/reports/by-backtracing`,
    { ...options, schema: { body: salesReportsSchemas.backtracing.req } },
    ctl.getSalesByBacktracing(f),
  );

  // sales by use cases
  f.post(
    `/${prefix}/reports`,
    { ...options, schema: { body: salesReportsSchemas.default.req } },
    ctl.getSalesReports(f),
  );
}
