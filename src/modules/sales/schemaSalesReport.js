const getProperties = (keys, props) => {
  return keys.reduce((acc, key) => {
    acc[key] = props[key];
    return acc;
  }, {});
};

//
const dateInputSchema = {
  anyOf: [
    // YYYY-MM-DD
    { type: "string", format: "date" },
    // ISO datetime
    { type: "string", format: "date-time" },
    // timestamp as string
    { type: "string", pattern: "^[0-9]{10,13}$" },
    // timestamp as number (optional but recommended)
    { type: "integer" },
  ],
};

// filter objects
const calendarBasedObject = {
  year: { type: "integer", minimum: 1970 },
  month: { type: "integer", minimum: 1, maximum: 12 },
  week: { type: "integer", minimum: 1, maximum: 53 },
};
const salesRangeObject = {
  startDate: dateInputSchema,
  endDate: dateInputSchema,
};
const backtracingObject = (prefix = false) => {
  const name = prefix ? "backtrack" : "";
  const map = {
    Year: { type: "integer" },
    Month: { type: "integer" },
    Week: { type: "integer" },
    Day: { type: "integer" },
    StartDate: dateInputSchema,
  };

  // no prefix
  if (!name) return map;

  // Appends 'backtrack'
  const newMap = Object.entries(map).reduce((acc, [key, value]) => {
    acc[`${name}${key}`] = value;
    return acc;
  }, {});

  return newMap;
};

// sales reports schemas
const salesReportsCoreObject = {
  // core fields
  customer: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
  products: {
    // productVariant
    type: "array",
    items: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
  },
};
const salesReportsObject = {
  ...salesReportsCoreObject,
  // filters fields
  ...calendarBasedObject,
  ...salesRangeObject,
  ...backtracingObject(true),
};
const salesReportsReq = {
  type: "object",
  additionalProperties: false,
  required: [],
  properties: salesReportsObject,
};
const salesReportsRes = {
  type: "object",
  properties: salesReportsObject,
};
export const salesReportsSchemas = {
  req: salesReportsReq,
  res: salesReportsRes,
};

// reports by calendar types
// yearly
const salesReportsYearlyReq = {
  ...salesReportsSchemas.req,
  required: [],
  properties: {
    ...salesReportsCoreObject,
    ...getProperties(["year"], calendarBasedObject),
  },
};
const salesReportsYearlyRes = {
  ...salesReportsSchemas.res,
  properties: {
    ...salesReportsCoreObject,
    ...getProperties(["year"], calendarBasedObject),
  },
};
// monthly
const salesReportsMonthlyReq = {
  ...salesReportsSchemas.req,
  required: [],
  properties: {
    ...salesReportsCoreObject,
    ...getProperties(["year", "month"], calendarBasedObject),
  },
};
const salesReportsMonthlyRes = {
  ...salesReportsSchemas.res,
  properties: {
    ...salesReportsCoreObject,
    ...getProperties(["year", "month"], calendarBasedObject),
  },
};
// weekly
const salesReportsWeeklyReq = {
  ...salesReportsSchemas.req,
  required: [],
  properties: {
    ...salesReportsCoreObject,
    ...getProperties(["year", "week"], calendarBasedObject),
  },
};
const salesReportsWeeklyRes = {
  ...salesReportsSchemas.res,
  properties: {
    ...salesReportsCoreObject,
    ...getProperties(["year", "week"], calendarBasedObject),
  },
};
//
export const salesReportsCalendarBasedSchemas = {
  yearly: {
    req: salesReportsYearlyReq,
    res: salesReportsYearlyRes,
  },
  monthly: {
    req: salesReportsMonthlyReq,
    res: salesReportsMonthlyRes,
  },
  weekly: {
    req: salesReportsWeeklyReq,
    res: salesReportsWeeklyRes,
  },
};

// reports by range
const salesReportsByRangerReq = {
  ...salesReportsSchemas.req,
  required: [],
  properties: {
    ...salesReportsCoreObject,
    ...salesRangeObject,
  },
};
const salesReportsByRangerRes = {
  ...salesReportsSchemas.res,
  properties: {
    ...salesReportsCoreObject,
    ...salesRangeObject,
  },
};
export const salesReportsByRangeSchemas = {
  req: salesReportsByRangerReq,
  res: salesReportsByRangerRes,
};

// reports by backtracing
const salesReportsByBacktracingReq = {
  ...salesReportsSchemas.req,
  required: [],
  properties: {
    ...salesReportsCoreObject,
    ...backtracingObject(),
  },
};
const salesReportsByBacktracingRes = {
  ...salesReportsSchemas.req,
  properties: {
    ...salesReportsCoreObject,
    ...backtracingObject(),
  },
};
export const salesReportsByBacktracingSchemas = {
  req: salesReportsByBacktracingReq,
  res: salesReportsByBacktracingRes,
};

export const main = {
  default: salesReportsSchemas,
  calendar: salesReportsCalendarBasedSchemas,
  range: salesReportsByRangeSchemas,
  backtracing: salesReportsByBacktracingSchemas,
};
export default main;
