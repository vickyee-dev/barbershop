import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeed } from "./seed.js";
import { getSlots, isStaffFree, nextOpenings } from "./availability.js";
import { createBooking, findBooking, canCustomerCancel, buildIcs } from "./booking.js";
import { reducer } from "../state/reducer.js";
import { addDays, atTime, dateKey, startOfDay, parseKey } from "./time.js";

// A fixed "now": a Wednesday at 08:00 local time.
const NOW = new Date(2026, 9, 21, 8, 0, 0);
const day = (offset) => addDays(startOfDay(NOW), offset);
const customer = { first_name: "Ada", last_name: "Lovelace", email: "", phone: "+254 700 123 456" };

test("dateKey uses the local calendar day", () => {
  const d = new Date(2026, 0, 1, 0, 30);
  assert.equal(dateKey(d), "2026-01-01");
  assert.equal(dateKey(parseKey("2026-03-09")), "2026-03-09");
});

test("slots stay inside opening hours and respect service length", () => {
  const data = buildSeed(NOW);
  const slots = getSlots({ day: day(0), duration: 60, staffId: "any", now: NOW, ...pick(data) });
  const first = slots[0].start;
  const last = slots.at(-1).start;
  assert.equal(first.getHours(), 9);
  assert.equal(last.getHours() * 60 + last.getMinutes(), 18 * 60); // 60 min ends at close (19:00)
});

test("past times and the lead-time window are excluded", () => {
  const data = buildSeed(NOW);
  const late = new Date(2026, 9, 21, 12, 10);
  const slots = getSlots({ day: day(0), duration: 30, staffId: "any", now: late, ...pick(data) });
  assert.ok(slots.every((s) => s.start >= new Date(late.getTime() + 30 * 60000)));
});

test("a booked chair blocks overlapping times for that barber only", () => {
  const data = buildSeed(NOW);
  const target = atTime(day(1), "10:00"); // Mike, Classic Haircut (approved) in the seed
  assert.equal(isStaffFree(1, target, new Date(target.getTime() + 30 * 60000), data.appointments), false);
  assert.equal(isStaffFree(3, target, new Date(target.getTime() + 30 * 60000), data.appointments), true);
  const slots = getSlots({ day: day(1), duration: 30, staffId: 1, now: NOW, ...pick(data) });
  assert.equal(slots.find((s) => s.start.getTime() === target.getTime()).available, false);
});

test("cancelled appointments free the chair", () => {
  const data = buildSeed(NOW);
  const appt = data.appointments.find((a) => a.staff_id === 1 && dateKey(new Date(a.appointment_date)) === dateKey(day(1)));
  const freed = reducer(data, { type: "SET_APPOINTMENT_STATUS", payload: { id: appt.id, status: "cancelled" } });
  const start = new Date(appt.appointment_date);
  assert.equal(isStaffFree(1, start, new Date(start.getTime() + 30 * 60000), freed.appointments), true);
});

test("booking creates a customer, a pending appointment and snapshots price", () => {
  const data = buildSeed(NOW);
  const slot = atTime(day(3), "09:00").toISOString();
  const res = createBooking(data, { service_id: 4, staff_id: "any", appointment_date: slot, customer }, NOW);
  assert.equal(res.ok, true);
  assert.equal(res.isNewCustomer, true);
  assert.equal(res.appointment.status, "pending");
  assert.equal(res.appointment.price, 38);
  assert.equal(res.appointment.duration_minutes, 45);
  assert.match(res.appointment.reference, /^MB-[A-Z2-9]{5}$/);
  const next = reducer(data, { type: "COMMIT_BOOKING", payload: res });
  assert.equal(next.customers.length, data.customers.length + 1);
  assert.equal(next.appointments.length, data.appointments.length + 1);
});

test("returning customers are matched by phone, not duplicated", () => {
  const data = buildSeed(NOW);
  const slot = atTime(day(4), "10:30").toISOString();
  const res = createBooking(
    data,
    { service_id: 1, staff_id: 2, appointment_date: slot, customer: { ...customer, phone: "1 234-567-892", first_name: "Johnny" } },
    NOW
  );
  assert.equal(res.ok, true);
  assert.equal(res.isNewCustomer, false);
  assert.equal(res.customer.id, 1);
});

test("double booking the same barber and time is rejected", () => {
  let data = buildSeed(NOW);
  const slot = atTime(day(3), "09:00").toISOString();
  const first = createBooking(data, { service_id: 1, staff_id: 1, appointment_date: slot, customer }, NOW);
  data = reducer(data, { type: "COMMIT_BOOKING", payload: first });
  const second = createBooking(data, { service_id: 1, staff_id: 1, appointment_date: slot, customer }, NOW);
  assert.equal(second.ok, false);
});

test('"any barber" falls through to the next free barber', () => {
  let data = buildSeed(NOW);
  const slot = atTime(day(3), "09:00").toISOString();
  const seen = new Set();
  for (let i = 0; i < 3; i++) {
    const res = createBooking(data, { service_id: 1, staff_id: "any", appointment_date: slot, customer }, NOW);
    assert.equal(res.ok, true);
    seen.add(res.appointment.staff_id);
    data = reducer(data, { type: "COMMIT_BOOKING", payload: res });
  }
  assert.equal(seen.size, 3);
  const fourth = createBooking(data, { service_id: 1, staff_id: "any", appointment_date: slot, customer }, NOW);
  assert.equal(fourth.ok, false);
});

test("times outside opening hours or in the past are rejected", () => {
  const data = buildSeed(NOW);
  const early = atTime(day(2), "06:00").toISOString();
  assert.equal(createBooking(data, { service_id: 1, staff_id: "any", appointment_date: early, customer }, NOW).ok, false);
  const past = atTime(day(-1), "10:00").toISOString();
  assert.equal(createBooking(data, { service_id: 1, staff_id: "any", appointment_date: past, customer }, NOW).ok, false);
});

test("lookup needs both reference and the booking phone number", () => {
  const data = buildSeed(NOW);
  const appt = data.appointments[0];
  const owner = data.customers.find((c) => c.id === appt.customer_id);
  assert.ok(findBooking(data, appt.reference.toLowerCase(), owner.phone));
  assert.equal(findBooking(data, appt.reference, "+1 999 999 9999"), null);
  assert.equal(findBooking(data, "MB-NOPE1", owner.phone), null);
  assert.equal(canCustomerCancel({ status: "completed", appointment_date: day(2).toISOString() }, NOW), false);
});

test("service edits do not rewrite past appointment prices", () => {
  const data = buildSeed(NOW);
  const next = reducer(data, { type: "SAVE_SERVICE", payload: { id: 1, price: 99 } });
  assert.equal(next.services.find((s) => s.id === 1).price, 99);
  assert.ok(next.appointments.filter((a) => a.service_id === 1).every((a) => a.price === 30));
});

test("walk-ins by an admin can start now and are approved", () => {
  const data = buildSeed(NOW);
  const start = atTime(day(0), "09:00");
  const res = createBooking(data, { service_id: 2, staff_id: 3, appointment_date: start.toISOString(), customer }, NOW, { asAdmin: true });
  assert.equal(res.ok, true);
  assert.equal(res.appointment.status, "approved");
});

test("nextOpenings and the calendar file are well formed", () => {
  const data = buildSeed(NOW);
  const open = nextOpenings({ ...pick(data), appointments: data.appointments, now: NOW, limit: 4 });
  assert.equal(open.length, 4);
  const appt = data.appointments[0];
  const ics = buildIcs({ appointment: appt, service: data.services[0], barber: data.staff[0] });
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /DTSTART:\d{8}T\d{6}Z/);
});

function pick(data) {
  return { staff: data.staff, appointments: data.appointments, services: data.services };
}
