import { ObjectId } from "mongodb";
import { dates } from "../../utils/date.js";

// sales pipelines
const buildReportPipeline = ({ start, end, customer, products }) => {
  // match dates
  const match = {
    createdAt: { $gte: start, $lte: end },
    deletedAt: null,
  };

  // match orders
  if (customer) {
    match.customer = new ObjectId(customer);
  }

  // match products from items.products
  if (products?.length) {
    match["items.product"] = {
      $in: products.map((p) => new ObjectId(p)),
    };
  }

  return [{ $match: match }, { $sort: { createdAt: -1 } }];
};
// date normalization
const normalizeDateRange = ({ startDate, endDate }) => {
  const now = new Date();
  let start = dates.parseDate(startDate);
  let end = dates.parseDate(endDate);

  // no start & no end
  if (!start && !end) {
    start = new Date(now);
    end = new Date(now);
    end.setDate(end.getDate() + 1);
  }

  // no start | has end
  else if (!start && end) {
    start = new Date(now);

    // end is today → tommorrow
    if (dates.isSameDay(end, now)) {
      end = new Date(now);
      end.setDate(end.getDate() + 1);
    }
  }

  // has start, no end
  else if (start && !end) {
    end = new Date(now);

    // start is today → yesterday
    if (dates.isSameDay(start, now)) {
      start = new Date(now);
      start.setDate(start.getDate() - 1);
    }
  }

  // normalize to full-day bounds
  start.setHours(0, 0, 0, 0); // start of day
  end.setHours(23, 59, 59, 999); // end of day

  // safety: swap if inverted
  if (start > end) {
    [start, end] = [end, start];
  }

  return { start, end };
};
// validate
const validateISOWeek = (year, week) => {
  if (!Number.isInteger(week)) {
    throw new Error("Week must be an integer");
  }

  const maxWeeks = dates.getISOWeeksInYear(year);
  if (week < 1 || week > maxWeeks) {
    throw new Error(
      `Invalid week ${week} for year ${year}. Valid range: 1–${maxWeeks}`,
    );
  }
};

//
export const helpers = {
  buildReportPipeline,
  normalizeDateRange,
  validateISOWeek,
};
