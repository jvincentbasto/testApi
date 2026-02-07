// validate dates
const isSameDay = (a, b) => {
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = a.getMonth() === b.getMonth();
  const sameDate = a.getDate() === b.getDate();
  const match = sameYear && sameMonth && sameDate;

  return match;
};
const isLeapYear = (year) => {
  // Determines whether a given year is a leap year

  // Rule 1:
  // If a year is divisible by 4, it *might* be a leap year
  // Example: 2024 % 4 === 0 → true
  const isDivisibleBy4 = year % 4 === 0;

  // Rule 2:
  // If a year is divisible by 100, it is a "century year"
  // Century years are NOT leap years by default
  // Example: 1900, 1800
  const isCenturyYear = year % 100 === 0;

  // Rule 3:
  // Century years can still be leap years IF divisible by 400
  // Example: 2000 % 400 === 0 → leap year
  const isDivisibleBy400 = year % 400 === 0;

  // Final rule combined:
  // - Must be divisible by 4
  // - AND (
  //     not a century year
  //     OR it *is* divisible by 400
  //   )
  return isDivisibleBy4 && (!isCenturyYear || isDivisibleBy400);
};

// parse dates
const parseDate = (value) => {
  // recommended formats:
  let sampleValue = "2026-02-15"; // year-month-day
  sampleValue = "2026-02-01T00:00:00.000Z"; // start
  sampleValue = "2026-02-15T23:59:59.999Z"; // end
  sampleValue = 1706745600000; // timestamps

  // avoid formats
  // "02/01/2026"
  // "Feb 1, 2026"

  if (!value) return null;

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

// get dates
const getCurrentYear = () => {
  return new Date().getFullYear();
};
const getCurrentMonth = () => {
  return new Date().getMonth() + 1; // 1–12
};
const getISOWeek = (date) => {
  // Create a copy so we don't mutate the original date
  const d = new Date(date);

  // Normalize time to midnight
  // Prevents daylight-saving / timezone issues
  d.setHours(0, 0, 0, 0);

  // JavaScript getDay(): Sun=0, Mon=1, ..., Sat=6
  // ISO wants: Mon=0, Tue=1, ..., Sun=6
  // Adding 6 and mod 7 shifts the range correctly
  const dayOfWeek = (d.getDay() + 6) % 7;

  // ISO rule:
  // The "week-year" is determined by the Thursday of the week
  // So we move the date forward/backward to Thursday
  d.setDate(d.getDate() + 3 - dayOfWeek);

  // ISO rule:
  // Week 1 is the week that contains January 4
  // January 4 is *always* in ISO week 1
  const firstThursday = new Date(d.getFullYear(), 0, 4);

  // Difference in days between this week's Thursday and Jan 4
  // 86400000 = milliseconds in one day
  const diffInDays = (d - firstThursday) / 86400000;

  // Convert days → weeks and add 1 because weeks are 1-based
  return 1 + Math.floor(diffInDays / 7);
};
const getCurrentWeek = () => {
  // Convenience wrapper that returns the ISO week for "today"
  return getISOWeek(new Date());
};
const getISOWeeksInYear = (year) => {
  // Returns whether a given year has 52 or 53 ISO weeks

  // December 31 of the given year
  const dec31 = new Date(year, 11, 31);

  // Day of week: Sun=0 ... Sat=6
  const day = dec31.getDay();

  // ISO rule:
  // A year has 53 weeks if:
  // - Dec 31 is a Thursday
  // - OR Dec 31 is a Friday AND the year is a leap year
  const has53Weeks = day === 4 || (day === 5 && isLeapYear(year));

  // Return the total number of ISO weeks
  return has53Weeks ? 53 : 52;
};

//
export const dates = {
  // validate dates
  isSameDay,
  isLeapYear,
  // parse dates
  parseDate,
  // get dates
  getCurrentYear,
  getCurrentMonth,
  getCurrentWeek,
  getISOWeeksInYear,
};
