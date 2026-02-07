import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

/* ---------------- PASSWORD ---------------- */
const SALT_ROUNDS = 12;
export const hash = async (password) => bcrypt.hash(password, SALT_ROUNDS);
/* ---------------- FAKER ---------------- */
export const setupFaker = ({ deterministic = false, seed = 1337 } = {}) => {
  if (deterministic) {
    faker.seed(seed);
    console.log(`Faker seeded (deterministic): ${seed}`);
  }
};

/* ---------------- RANGE ---------------- */
export const computeBacktrackRange = ({
  year = 0,
  month = 0,
  week = 0,
  day = 0,
}) => {
  const end = new Date();
  const start = new Date(end);

  start.setFullYear(start.getFullYear() - year);
  start.setMonth(start.getMonth() - month);
  start.setDate(start.getDate() - week * 7);
  start.setDate(start.getDate() - day);

  return { start, end };
};
/* ---------------- RANDOM ---------------- */
export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* ---------------- DATE WINDOWS ---------------- */
const MS_WEEK = 7 * 24 * 60 * 60 * 1000;

const getYearWindow = ({ start, index, intervals }) => ({
  from: new Date(start.getFullYear() + index * intervals, 0, 1),
  to: new Date(start.getFullYear() + (index + 1) * intervals, 0, 1),
});
const getMonthWindow = ({ start, index, intervals }) => ({
  from: new Date(start.getFullYear(), start.getMonth() + index * intervals, 1),
  to: new Date(
    start.getFullYear(),
    start.getMonth() + (index + 1) * intervals,
    1,
  ),
});
const getWeekWindow = ({ start, index, intervals }) => ({
  from: new Date(start.getTime() + index * intervals * MS_WEEK),
  to: new Date(start.getTime() + (index + 1) * intervals * MS_WEEK),
});

export const dateWindows = {
  resolver: ({ type, ...rest }) => {
    if (type === "yearly") return getYearWindow(rest);
    if (type === "monthly") return getMonthWindow(rest);
    if (type === "weekly") return getWeekWindow(rest);
    throw new Error(`Unknown type: ${type}`);
  },
  random: (from, to) => new Date(from.getTime() + Math.random() * (to - from)),
};

/* ---------------- WINDOW SEEDER ---------------- */
export const createWindowSeeder = ({
  name,
  getTotalWindows,
  buildRecords,
  insertRecords,
  chunkSize = 100,
  delayMs = 0,
}) => {
  return async ({ db, start, config }) => {
    const totalWindows = getTotalWindows(config);
    const startedAt = Date.now();

    for (let w = 0; w < totalWindows; w++) {
      const { from, to } = dateWindows.resolver({
        type: config.type,
        start,
        index: w,
        intervals: config.intervals,
      });

      //
      const records = await buildRecords({ db, from, to, config });
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);

        await insertRecords({
          db,
          records: chunk,
          from,
          to,
        });
      }

      //
      const elapsed = (Date.now() - startedAt) / 1000;
      const pct = (((w + 1) / totalWindows) * 100).toFixed(1);

      // progress
      console.log(
        `[${name}] window ${w + 1}/${totalWindows} (${pct}%) – ${elapsed.toFixed(
          1,
        )}s`,
      );

      // delay
      if (delayMs) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  };
};
