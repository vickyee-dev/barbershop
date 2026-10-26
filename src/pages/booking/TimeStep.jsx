import { useMemo, useState } from "react";
import { getBookableDays, getSlots } from "../../lib/availability";
import { formatDayLong, formatTime } from "../../lib/format";
import { dateKey, parseKey, startOfDay } from "../../lib/time";

const periods = [
  ["Morning", (h) => h < 12],
  ["Afternoon", (h) => h >= 12 && h < 17],
  ["Evening", (h) => h >= 17],
];

export default function TimeStep({ service, staffId, data, now, selectedSlot, onSelect }) {
  const [chosenKey, setChosenKey] = useState(null);

  const days = useMemo(
    () =>
      getBookableDays({
        duration: service.duration_minutes,
        staffId,
        staff: data.staff,
        appointments: data.appointments,
        now,
      }),
    [service, staffId, data, now]
  );

  const firstOpen = days.find((d) => d.openings > 0);
  const key =
    chosenKey ??
    (selectedSlot ? dateKey(new Date(selectedSlot)) : firstOpen ? dateKey(firstOpen.day) : null);

  const slots = useMemo(
    () =>
      key
        ? getSlots({
            day: startOfDay(parseKey(key)),
            duration: service.duration_minutes,
            staffId,
            staff: data.staff,
            appointments: data.appointments,
            now,
          })
        : [],
    [key, service, staffId, data, now]
  );

  if (!firstOpen) {
    return (
      <div>
        <h2 className="font-display text-4xl font-extrabold tracking-wide">Pick a day and time</h2>
        <p className="mt-6 rounded-lg bg-ink-50 p-4 text-ink-700">
          There are no free times for this service and barber in the next few weeks. Try another barber, or call the shop.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-4xl font-extrabold tracking-wide">Pick a day and time</h2>

      <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Day">
        {days.map(({ day, openings }) => {
          const k = dateKey(day);
          const selected = k === key;
          return (
            <button
              key={k}
              disabled={openings === 0}
              onClick={() => setChosenKey(k)}
              aria-pressed={selected}
              className={`flex w-[4.5rem] shrink-0 flex-col items-center rounded-lg border-2 px-2 py-2.5 transition-colors disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-50 disabled:text-ink-300 ${
                selected ? "border-pole bg-red-50" : "border-ink-200 hover:border-ink-500"
              }`}
            >
              <span className="text-sm font-medium">{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className="font-display text-3xl font-extrabold leading-none">{day.getDate()}</span>
              <span className="mt-1 text-xs">{openings === 0 ? "Full" : `${openings} free`}</span>
            </button>
          );
        })}
      </div>

      {key && (
        <div className="mt-6" aria-live="polite">
          <h3 className="font-semibold">{formatDayLong(parseKey(key))}</h3>
          {periods.map(([label, test]) => {
            const group = slots.filter((s) => test(s.start.getHours()));
            if (!group.length) return null;
            return (
              <div key={label} className="mt-4">
                <p className="mb-2 text-sm font-medium text-ink-500">{label}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {group.map((s) => (
                    <button
                      key={s.iso}
                      disabled={!s.available}
                      onClick={() => onSelect(s.iso)}
                      aria-pressed={s.iso === selectedSlot}
                      className={`rounded-md border-2 px-2 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-50 disabled:text-ink-300 disabled:line-through ${
                        s.iso === selectedSlot
                          ? "border-pole bg-pole text-white"
                          : "border-ink-200 hover:border-ink-500"
                      }`}
                    >
                      {formatTime(s.start)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {slots.length === 0 && <p className="mt-4 text-ink-600">No times left on this day.</p>}
        </div>
      )}
    </div>
  );
}
