import { addDays, addMinutes, atTime, startOfDay } from "./time.js";

// Demo data. Appointments are placed relative to "today" so the dashboard
// always has something realistic to show, whenever you run the project.

const iso = (d) => d.toISOString();

const staff = [
  { id: 1, first_name: "Mike", last_name: "Johnson", specialization: "Haircut specialist", phone: "+1 234 567 890" },
  { id: 2, first_name: "Sarah", last_name: "Wilson", specialization: "Beard grooming expert", phone: "+1 234 567 891" },
  { id: 3, first_name: "Daniel", last_name: "Reyes", specialization: "Skin fades and designs", phone: "+1 234 567 893" },
];

const services = [
  { id: 1, service_name: "Classic Haircut", description: "Traditional haircut with modern finishing touches and styling advice.", duration_minutes: 30, price: 30, image: "haircut1.webp" },
  { id: 2, service_name: "Beard Trim & Shape", description: "Precision trimming and shaping, finished with conditioning oil.", duration_minutes: 20, price: 20, image: "haircut2.webp" },
  { id: 3, service_name: "Royal Grooming Package", description: "Haircut, beard trim and a hot towel treatment with premium products.", duration_minutes: 60, price: 65, image: "haircut3.webp" },
  { id: 4, service_name: "Skin Fade", description: "A clean, blended fade from skin to length, lined up to finish.", duration_minutes: 45, price: 38, image: "image1.webp" },
  { id: 5, service_name: "Junior Cut", description: "Patient, quick cuts for kids under 12.", duration_minutes: 20, price: 18, image: "image2.webp" },
];

const customers = [
  { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@email.com", phone: "+1 234 567 892" },
  { id: 2, first_name: "Amina", last_name: "Hassan", email: "amina.h@email.com", phone: "+1 555 010 2211" },
  { id: 3, first_name: "Carlos", last_name: "Mendes", email: "", phone: "+1 555 010 3342" },
  { id: 4, first_name: "Peter", last_name: "Kamau", email: "peter.k@email.com", phone: "+1 555 010 4456" },
  { id: 5, first_name: "Liam", last_name: "O'Brien", email: "", phone: "+1 555 010 5567" },
  { id: 6, first_name: "Tunde", last_name: "Bakare", email: "tunde.b@email.com", phone: "+1 555 010 6678" },
];

// [dayOffset, "HH:MM", staffId, serviceId, customerId, future status | "cancelled"]
const schedule = [
  [-3, "10:00", 1, 1, 1], [-3, "11:00", 2, 2, 2], [-3, "14:00", 1, 3, 3],
  [-2, "10:30", 3, 4, 4], [-2, "12:00", 1, 1, 5], [-2, "13:00", 2, 3, 1, "cancelled"],
  [-1, "10:00", 2, 2, 6], [-1, "11:30", 3, 4, 2], [-1, "15:00", 1, 5, 5],
  [0, "10:00", 1, 1, 1], [0, "10:30", 2, 2, 3], [0, "11:30", 3, 4, 4],
  [0, "13:00", 1, 3, 6], [0, "14:30", 2, 1, 2], [0, "15:00", 3, 5, 5],
  [1, "10:00", 1, 1, 3, "approved"], [1, "11:00", 2, 3, 4, "pending"], [1, "14:00", 3, 4, 6, "pending"],
  [2, "10:30", 1, 4, 2, "approved"], [2, "13:00", 2, 2, 1, "pending"],
  [3, "11:00", 3, 1, 5, "pending"],
];

// Small deterministic generator so seeded reference codes are stable.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const seededRef = (n) => {
  let x = n * 7919 + 104729;
  let code = "";
  for (let i = 0; i < 5; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    code += ALPHABET[x % ALPHABET.length];
  }
  return `MB-${code}`;
};

export function buildSeed(now = new Date()) {
  const created = iso(addDays(now, -30));
  const today = startOfDay(now);

  const appointments = schedule.map(([offset, time, staff_id, service_id, customer_id, flag], i) => {
    const start = atTime(addDays(today, offset), time);
    const service = services.find((s) => s.id === service_id);
    const status =
      flag === "cancelled" ? "cancelled" : start < now ? "completed" : flag ?? "approved";
    return {
      id: i + 1,
      reference: seededRef(i + 1),
      customer_id,
      staff_id,
      service_id,
      appointment_date: iso(start),
      duration_minutes: service.duration_minutes,
      price: service.price,
      status,
      source: "online",
      is_active: true,
      created_at: iso(addMinutes(start, -2 * 24 * 60)),
    };
  });

  return {
    staff: staff.map((s) => ({ ...s, is_active: true, created_at: created })),
    services: services.map((s) => ({ ...s, is_active: true, created_at: created })),
    customers: customers.map((c) => ({ ...c, is_active: true, created_at: created })),
    appointments,
  };
}
