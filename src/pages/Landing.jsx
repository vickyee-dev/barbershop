import { useMemo, useState } from "react";
import { config } from "../config";
import { useNow } from "../hooks";
import { nextOpenings } from "../lib/availability";
import { formatDayShort, formatDuration, formatHours, formatMoney, formatTime, fullName, initials } from "../lib/format";
import { goToSection, navigate } from "../lib/router";
import { useStore } from "../state/context";
import Button from "../components/ui/Button";
import Link from "../components/ui/Link";
import { ArrowRightIcon, PinIcon } from "../components/ui/Icons";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Collapse consecutive days that share the same hours: "Monday to Friday".
function groupHours() {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const groups = [];
  for (const d of order) {
    const h = config.hours[d];
    const key = h ? `${h.open}-${h.close}` : "closed";
    const last = groups.at(-1);
    if (last && last.key === key) last.days.push(d);
    else groups.push({ key, days: [d], hours: h });
  }
  return groups.map((g) => ({
    label:
      g.days.length === 1
        ? DAY_NAMES[g.days[0]]
        : `${DAY_NAMES[g.days[0]]} to ${DAY_NAMES[g.days.at(-1)]}`,
    text: g.hours ? formatHours(g.hours) : "Closed",
  }));
}

const gallery = [
  { src: "image1.webp", alt: "A barber fading the side of a client's head with gold clippers" },
  { src: "image2.webp", alt: "A curly top with a sharp taper fade" },
  { src: "image3.webp", alt: "A short fade paired with a full, shaped beard" },
  { src: "image4.webp", alt: "A waves cut being lined up with clippers" },
];

export default function Landing() {
  const { data, updateDraft } = useStore();
  const now = useNow();
  const [activeId, setActiveId] = useState(null);

  const services = data.services.filter((s) => s.is_active);
  const team = data.staff.filter((s) => s.is_active);
  const active = services.find((s) => s.id === activeId) ?? services[0];

  const openings = useMemo(
    () =>
      nextOpenings({
        services: data.services,
        staff: data.staff,
        appointments: data.appointments,
        now,
        limit: 4,
      }),
    [data, now]
  );

  const bookService = (s) => {
    updateDraft({ service_id: s.id, staff_id: null, slot: null, step: "barber" });
    navigate("/book");
  };
  const bookBarber = (b) => {
    updateDraft({ staff_id: b.id, service_id: null, slot: null, step: "service" });
    navigate("/book");
  };
  const bookOpening = (o) => {
    updateDraft({ service_id: o.service.id, staff_id: o.freeStaffIds[0], slot: o.iso, step: "details" });
    navigate("/book");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <img
          src="/hero.webp"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-24">
          <div>
            <h1 className="reveal font-display text-6xl font-black leading-[0.95] tracking-wide sm:text-8xl">
              Book your chair.
              <br />
              Skip the wait.
            </h1>
            <p className="reveal mt-6 max-w-lg text-lg text-ink-200" style={{ "--d": "120ms" }}>
              Pick a service and a barber, see the times that are actually free, and the shop confirms
              your spot.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3" style={{ "--d": "220ms" }}>
              <Link to="/book" button size="lg">
                Book an appointment
              </Link>
              <Button size="lg" variant="outlineLight" onClick={() => goToSection("services")}>
                See prices
              </Button>
            </div>
          </div>

          <div className="reveal rounded-lg bg-white p-6 text-ink-900 shadow-2xl" style={{ "--d": "340ms" }}>
            <h2 className="font-display text-3xl font-extrabold tracking-wide">Next free chairs</h2>
            <p className="mt-1 text-sm text-ink-500">Tap a time to start booking it.</p>
            {openings.length === 0 ? (
              <p className="mt-6 text-ink-700">No openings in the next {config.bookingWindowDays} days. Call the shop on {config.shop.phone}.</p>
            ) : (
              <ul className="mt-4 divide-y divide-ink-100 border-y border-ink-100">
                {openings.map((o) => {
                  const barber = data.staff.find((s) => s.id === o.freeStaffIds[0]);
                  return (
                    <li key={o.iso}>
                      <button
                        onClick={() => bookOpening(o)}
                        className="group flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-ink-50"
                      >
                        <span>
                          <span className="block font-semibold">
                            {formatDayShort(o.start)}, {formatTime(o.start)}
                          </span>
                          <span className="block text-sm text-ink-500">
                            {o.service.service_name} with {barber?.first_name}
                          </span>
                        </span>
                        <ArrowRightIcon className="size-5 text-ink-300 group-hover:text-pole" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link to="/book" className="mt-4 inline-block text-sm font-semibold text-pole underline underline-offset-4">
              See every time
            </Link>
          </div>
        </div>
      </section>

      {/* Price board */}
      <section id="services" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="font-display text-5xl font-extrabold tracking-wide">The price board</h2>
            <p className="mt-2 max-w-md text-ink-500">What we do, how long it takes, what it costs. You pay in the shop.</p>
            <ul className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
              {services.map((s) => (
                <li
                  key={s.id}
                  onMouseEnter={() => setActiveId(s.id)}
                  onFocus={() => setActiveId(s.id)}
                  className="py-5"
                >
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-display text-3xl font-extrabold tracking-wide">{s.service_name}</h3>
                    <span className="min-w-6 flex-1 translate-y-[-4px] border-b-2 border-dotted border-ink-300" aria-hidden="true" />
                    <span className="font-display text-3xl font-extrabold text-pole">{formatMoney(s.price)}</span>
                  </div>
                  <p className="mt-1 max-w-md text-ink-600">{s.description}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-sm font-medium text-ink-500">{formatDuration(s.duration_minutes)}</span>
                    <button
                      onClick={() => bookService(s)}
                      className="text-sm font-semibold text-pole underline underline-offset-4 hover:text-pole-dark"
                    >
                      Book {s.service_name}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-28 overflow-hidden rounded-lg">
              {active && (
                <img
                  key={active.image}
                  src={`/${active.image}`}
                  alt={config.photos[active.image] ?? active.service_name}
                  className="aspect-[4/5] w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="scroll-mt-20 bg-ink-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-5xl font-extrabold tracking-wide">Fresh from the chair</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((g, i) => (
              <img
                key={g.src}
                src={`/${g.src}`}
                alt={g.alt}
                loading="lazy"
                className={`aspect-[4/5] w-full rounded-md object-cover ${i % 2 ? "md:mt-10" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-5xl font-extrabold tracking-wide">Your barbers</h2>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-lg bg-ink-100 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((b) => (
              <li key={b.id} className="flex items-center gap-4 bg-white p-6">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-pole-blue bg-ink-50 font-display text-2xl font-extrabold text-ink-900">
                  {initials(b)}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{fullName(b)}</h3>
                  <p className="text-sm text-ink-500">{b.specialization}</p>
                  <button
                    onClick={() => bookBarber(b)}
                    className="mt-1 text-sm font-semibold text-pole underline underline-offset-4 hover:text-pole-dark"
                  >
                    Book {b.first_name}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="scroll-mt-20 bg-ink-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-5xl font-extrabold tracking-wide">Opening hours</h2>
            <dl className="mt-6 divide-y divide-ink-200 border-y border-ink-200">
              {groupHours().map((g) => (
                <div key={g.label} className="flex justify-between gap-4 py-3">
                  <dt className="font-medium">{g.label}</dt>
                  <dd className="text-ink-600">{g.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-display text-5xl font-extrabold tracking-wide">Find us</h2>
            <p className="mt-6 flex items-start gap-3 text-lg">
              <PinIcon className="mt-1 size-5 shrink-0 text-pole" />
              <span>
                {config.shop.address}
                <br />
                {config.shop.city}
              </span>
            </p>
            <p className="mt-4 text-ink-700">
              Call <a className="font-semibold underline underline-offset-4" href={`tel:${config.shop.phone.replace(/[^+\d]/g, "")}`}>{config.shop.phone}</a>
              <br />
              Email <a className="font-semibold underline underline-offset-4" href={`mailto:${config.shop.email}`}>{config.shop.email}</a>
            </p>
            <Link to="/book" button size="lg" className="mt-8">
              Book an appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
