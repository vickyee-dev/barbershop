// All scheduling maths happens in the visitor's local time. Appointments are
// stored as ISO strings (UTC) so they stay unambiguous.

export const pad = (n) => String(n).padStart(2, "0");

// Local calendar date as YYYY-MM-DD. (toISOString() would shift the day for
// anyone east or west of UTC, which the original project got wrong.)
export const dateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const atTime = (day, hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
};

export const addMinutes = (d, mins) => new Date(d.getTime() + mins * 60000);

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const isSameDay = (a, b) => dateKey(a) === dateKey(b);
