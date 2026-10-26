import { config } from "../config.js";
import { addDays, addMinutes, atTime, startOfDay } from "./time.js";

// Appointments in these states occupy a barber's chair.
export const BLOCKING = ["pending", "approved"];

export const getHours = (day, cfg = config) => cfg.hours[day.getDay()] ?? null;

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export function isStaffFree(staffId, start, end, appointments, ignoreId = null) {
  return !appointments.some((a) => {
    if (a.staff_id !== staffId || a.id === ignoreId) return false;
    if (!BLOCKING.includes(a.status)) return false;
    const aStart = new Date(a.appointment_date);
    return overlaps(start, end, aStart, addMinutes(aStart, a.duration_minutes));
  });
}

/**
 * Every start time on `day` for a service of `duration` minutes.
 * `staffId` is a barber id, or "any" for the whole active team.
 * Times already inside the lead-time window are left out entirely;
 * times that are taken are returned with `available: false`.
 */
export function getSlots({
  day,
  duration,
  staffId = "any",
  staff,
  appointments,
  now = new Date(),
  cfg = config,
  leadMinutes = cfg.leadTimeMinutes,
}) {
  const hours = getHours(day, cfg);
  if (!hours) return [];

  const pool = staff.filter(
    (s) => s.is_active && (staffId === "any" || s.id === staffId)
  );
  const close = atTime(day, hours.close);
  const earliest = addMinutes(now, leadMinutes);
  const slots = [];

  for (
    let start = atTime(day, hours.open);
    addMinutes(start, duration) <= close;
    start = addMinutes(start, cfg.slotIntervalMinutes)
  ) {
    if (start < earliest) continue;
    const end = addMinutes(start, duration);
    const freeStaffIds = pool
      .filter((s) => isStaffFree(s.id, start, end, appointments))
      .map((s) => s.id);
    slots.push({
      start,
      iso: start.toISOString(),
      freeStaffIds,
      available: freeStaffIds.length > 0,
    });
  }
  return slots;
}

/** Days a customer can book, with how many open start times each has. */
export function getBookableDays({ duration, staffId, staff, appointments, now, cfg = config }) {
  const today = startOfDay(now);
  const days = [];
  for (let i = 0; i < cfg.bookingWindowDays; i++) {
    const day = addDays(today, i);
    if (!getHours(day, cfg)) continue;
    const slots = getSlots({ day, duration, staffId, staff, appointments, now, cfg });
    days.push({ day, openings: slots.filter((s) => s.available).length });
  }
  return days;
}

/** The next few free start times for the shortest active service. */
export function nextOpenings({ services, staff, appointments, now, limit = 4, cfg = config }) {
  const active = services.filter((s) => s.is_active);
  if (!active.length) return [];
  const service = active.reduce((a, b) => (b.duration_minutes < a.duration_minutes ? b : a));
  const found = [];
  const today = startOfDay(now);
  for (let i = 0; i < cfg.bookingWindowDays && found.length < limit; i++) {
    const day = addDays(today, i);
    const slots = getSlots({
      day,
      duration: service.duration_minutes,
      staffId: "any",
      staff,
      appointments,
      now,
      cfg,
    }).filter((s) => s.available);
    // Spread suggestions across the day instead of listing 9:00, 9:30, 10:00...
    const spaced = slots.filter((_, idx) => idx % 3 === 0);
    for (const s of spaced) {
      if (found.length >= limit) break;
      found.push({ ...s, service });
    }
  }
  return found;
}
