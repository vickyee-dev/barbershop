import { digitsOnly, fullName } from "./format.js";
import { getSlots } from "./availability.js";
import { addMinutes, pad, startOfDay } from "./time.js";
import { config } from "../config.js";

export const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

export function makeReference(existing, rand = Math.random) {
  const taken = new Set(existing.map((a) => a.reference));
  for (;;) {
    let code = "";
    for (let i = 0; i < 5; i++) code += REF_ALPHABET[Math.floor(rand() * REF_ALPHABET.length)];
    const ref = `MB-${code}`;
    if (!taken.has(ref)) return ref;
  }
}

/**
 * Validate and build a booking. Pure: it never mutates `data`, so the UI can
 * call it, then dispatch the result.
 *
 * input: { service_id, staff_id ("any" | id), appointment_date (ISO),
 *          customer: { first_name, last_name, email, phone } }
 * options: { asAdmin } walk-ins skip the lead time and are approved straight away.
 */
export function createBooking(data, input, now = new Date(), { asAdmin = false } = {}) {
  const service = data.services.find((s) => s.id === input.service_id && s.is_active);
  if (!service) return { ok: false, error: "That service is no longer available." };

  const start = new Date(input.appointment_date);
  if (Number.isNaN(start.getTime())) return { ok: false, error: "Pick a date and time." };

  const slots = getSlots({
    day: startOfDay(start),
    duration: service.duration_minutes,
    staffId: input.staff_id,
    staff: data.staff,
    appointments: data.appointments,
    now,
    leadMinutes: asAdmin ? 0 : config.leadTimeMinutes,
  });
  const slot = slots.find((s) => s.iso === start.toISOString() && s.available);
  if (!slot) {
    return { ok: false, error: "That time was just taken. Pick another time." };
  }

  const staffId = slot.freeStaffIds[0];
  const phoneKey = digitsOnly(input.customer.phone);
  const email = input.customer.email?.trim().toLowerCase() ?? "";
  let customer = data.customers.find(
    (c) =>
      (phoneKey && digitsOnly(c.phone) === phoneKey) ||
      (email && c.email?.toLowerCase() === email)
  );
  const isNewCustomer = !customer;
  const person = {
    first_name: input.customer.first_name.trim(),
    last_name: input.customer.last_name?.trim() ?? "",
    email,
    phone: input.customer.phone.trim(),
  };
  if (customer) {
    customer = {
      ...customer,
      ...person,
      email: person.email || customer.email,
      last_name: person.last_name || customer.last_name,
      updated_at: now.toISOString(),
    };
  } else {
    customer = {
      id: nextId(data.customers),
      ...person,
      is_active: true,
      created_at: now.toISOString(),
    };
  }

  const appointment = {
    id: nextId(data.appointments),
    reference: makeReference(data.appointments),
    customer_id: customer.id,
    staff_id: staffId,
    service_id: service.id,
    appointment_date: start.toISOString(),
    duration_minutes: service.duration_minutes, // snapshots: later edits to the
    price: service.price, // service must not rewrite history
    status: asAdmin ? "approved" : "pending",
    source: asAdmin ? "admin" : "online",
    is_active: true,
    created_at: now.toISOString(),
  };

  return { ok: true, customer, isNewCustomer, appointment };
}

/** Look up a booking by reference + phone (what a customer can prove). */
export function findBooking(data, reference, phone) {
  const ref = reference.trim().toUpperCase();
  const key = digitsOnly(phone);
  if (!ref || !key) return null;
  const appt = data.appointments.find((a) => a.reference === ref);
  if (!appt) return null;
  const customer = data.customers.find((c) => c.id === appt.customer_id);
  return customer && digitsOnly(customer.phone) === key ? appt : null;
}

export const canCustomerCancel = (appt, now = new Date()) =>
  ["pending", "approved"].includes(appt.status) && new Date(appt.appointment_date) > now;

// ---- calendar file (.ics) --------------------------------------------------

const icsStamp = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T` +
  `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

const icsEscape = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

export function buildIcs({ appointment, service, barber }) {
  const start = new Date(appointment.appointment_date);
  const end = addMinutes(start, appointment.duration_minutes);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Modern Barbershop//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${appointment.reference}@barbershop`,
    `DTSTAMP:${icsStamp(new Date(appointment.created_at))}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(`${service?.service_name ?? "Appointment"} at ${config.shop.name}`)}`,
    `DESCRIPTION:${icsEscape(`Barber: ${fullName(barber)}. Reference ${appointment.reference}.`)}`,
    `LOCATION:${icsEscape(`${config.shop.address}, ${config.shop.city}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
