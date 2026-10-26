# Modern Barbershop: online booking

A booking site for a barbershop, with a customer side and a staff side. Customers pick a service and a barber, see times that are really free, and send a request. Staff approve requests, add walk-ins and manage services, barbers and customers.

Built with React 19, Vite 7 and Tailwind CSS 4. There is no backend: data is saved in the browser's `localStorage`, so it is a complete, working demo and a solid front end to connect to a real API later.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
npm run lint
npm test           # booking and availability logic
```

Needs Node 20 or newer.

**Staff login:** open `/#/admin`, or use "Staff login" in the footer.
Demo credentials: `admin@barbershop.com` / `admin123` (set in `src/config.js`).

## What it does

**Customers**
- Four-step booking: service, barber (or "first available"), day and time, details.
- Availability is calculated from opening hours, service length and every barber's existing appointments. Booked, past and too-soon times can't be chosen.
- A live appointment ticket fills in as choices are made. The landing page shows the next free chairs and starts a booking in one tap.
- After booking: a reference code (like `MB-7K2QX`) and an "Add to calendar" `.ics` file.
- "Find my booking": reference plus phone number lets a customer check status or cancel.

**Staff**
- Overview: today's bookings by barber, requests waiting for an answer, 7-day load, last-7-day earnings.
- Appointments: filter by status, date, barber or search; approve, decline, complete, cancel; add walk-in or phone bookings.
- Services and barbers: add, edit, hide or show. Hidden items disappear from booking but history is kept.
- Customers: created automatically on first booking (matched by phone or email), with visit history and total spent.

## Configure it

`src/config.js` holds everything a shop owner would change: name and contact details, opening hours per weekday, slot interval, how far ahead people can book, minimum notice, currency and locale, admin credentials, and the photos available for services. The footer hours and the booking calendar both read from the same table, so they can't disagree.

## Project layout

```
src/
  config.js            shop settings
  lib/
    availability.js    slot generation and conflict checks
    booking.js         create/look up bookings, reference codes, .ics
    seed.js            demo data, placed relative to today
    storage.js         localStorage persistence
    router.js          small hash router (works on any static host)
    booking.test.js    14 tests for the logic above
  state/               reducer, context, provider
  components/          ui kit, layout, appointment ticket
  pages/               Landing, booking/ (4 steps + success), MyBooking, admin/
```

## What changed from the first version

- **Real availability.** Slots were random (`Math.random()`); now they come from the schedule, and the same barber can't be booked twice for overlapping times. "Any barber" assigns whoever is free.
- **Customers are saved.** Bookings used to have `customer_id: null` and the customer list never grew.
- **Editing works.** Saving a service edit used to show an alert and change nothing.
- **Prices and durations are snapshotted** on each appointment, so changing a price doesn't rewrite past revenue.
- **Consistent data.** The landing page showed different prices from the booking flow and hours that didn't match the calendar; it now reads live data. Invented stats ("5K+ clients, 15+ barbers") and placeholder news articles were removed.
- **Bug fixes:** dates were built with `toISOString()`, which shifts the day by timezone; phone validation only accepted North American numbers; the terms checkbox wasn't enforced.
- **Accessibility:** labelled fields with inline errors, keyboard-usable controls, visible focus, native dialogs, reduced-motion support.
- **Performance:** images converted from ~10 MB of PNG to ~0.7 MB of WebP; fonts are self-hosted.
- **New:** booking lookup and cancel, calendar download, walk-in bookings, persistence, routing with working back button.

## Before going live

This is a front-end demo. To run a real shop you need:

1. **A backend and database.** `src/state/` is the single place data is read and written; replace it with API calls. The record shapes already follow a relational layout (`staff`, `services`, `customers`, `appointments`).
2. **Real authentication.** The admin login is checked in the browser and is not secure. Use server-side sessions or an auth provider.
3. **Server-side conflict checks.** The browser prevents double bookings only within one browser; the server must enforce it for everyone.
4. **Notifications.** Approving or declining doesn't message the customer yet. Add SMS or email (for example via a webhook on status change).
5. **Time zone.** Hours are interpreted in the visitor's local time, which is right when customers are near the shop.

Use "Reset demo data" in the staff sidebar to restore the sample data.
