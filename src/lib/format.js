import { config } from "../config.js";

const money0 = new Intl.NumberFormat(config.locale, {
  style: "currency",
  currency: config.currency,
  maximumFractionDigits: 0,
});
const money2 = new Intl.NumberFormat(config.locale, {
  style: "currency",
  currency: config.currency,
});

export const formatMoney = (n) =>
  Number.isInteger(n) ? money0.format(n) : money2.format(n);

export const formatTime = (d) =>
  new Date(d).toLocaleTimeString(config.locale, {
    hour: "numeric",
    minute: "2-digit",
  });

export const formatDayLong = (d) =>
  new Date(d).toLocaleDateString(config.locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export const formatDayShort = (d) =>
  new Date(d).toLocaleDateString(config.locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const formatDateTime = (d) => `${formatDayShort(d)}, ${formatTime(d)}`;

export const formatDuration = (mins) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

export const fullName = (p) =>
  p ? [p.first_name, p.last_name].filter(Boolean).join(" ") : "";

export const initials = (p) =>
  p
    ? `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase()
    : "";

export const digitsOnly = (s = "") => s.replace(/\D/g, "");

export const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// International friendly: 7 to 15 digits, optional + and common separators.
export const isValidPhone = (s) => {
  if (!/^[+\d\s().-]+$/.test(s)) return false;
  const n = digitsOnly(s).length;
  return n >= 7 && n <= 15;
};

export const formatHours = ({ open, close }) => {
  const f = (t) => formatTime(new Date(`2000-01-01T${t}:00`));
  return `${f(open)} to ${f(close)}`;
};
