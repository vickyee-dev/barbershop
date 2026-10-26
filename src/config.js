// Everything a shop owner is likely to change lives here.

const weekday = { open: "09:00", close: "19:00" };

export const config = {
  shop: {
    name: "Modern Barbershop",
    address: "123 Barber Street",
    city: "City, State 12345",
    phone: "(555) 123-4567",
    email: "hello@modernbarbershop.com",
  },

  // Formatting. Change both to e.g. "en-KE" / "KES" for another market.
  locale: "en-US",
  currency: "USD",

  // Opening hours by weekday (0 = Sunday). Use null for a closed day.
  // The booking calendar and the footer both read from this one table.
  hours: {
    0: { open: "10:00", close: "16:00" },
    1: weekday,
    2: weekday,
    3: weekday,
    4: weekday,
    5: weekday,
    6: { open: "09:00", close: "17:00" },
  },

  slotIntervalMinutes: 30, // gap between selectable start times
  bookingWindowDays: 21, // how far ahead customers can book
  leadTimeMinutes: 30, // how soon before a start time booking closes

  // Demo-only credentials. See the README: this is NOT real security.
  admin: { email: "admin@barbershop.com", password: "admin123" },

  storageKey: "barbershop.v2",

  // Photos available to assign to a service (files live in /public).
  photos: {
    "haircut1.webp": "Fade with beard design",
    "haircut2.webp": "Beard trim",
    "haircut3.webp": "Classic hot towel service",
    "image1.webp": "Clipper fade",
    "image2.webp": "Curly top fade",
    "image3.webp": "Beard and low fade",
    "image4.webp": "Waves cut",
  },
};
