import { useNow } from "../../hooks";
import { formatDayLong, formatMoney, formatTime, fullName } from "../../lib/format";
import { addDays, dateKey, startOfDay } from "../../lib/time";
import { useStore } from "../../state/context";
import StatusBadge from "../../components/ui/StatusBadge";
import AppointmentActions from "./AppointmentActions";
import PageHeader from "./PageHeader";
import { byDate, indexById } from "./helpers";

export default function Overview() {
  const { data, dispatch, toast } = useStore();
  const now = useNow();
  const services = indexById(data.services);
  const staff = indexById(data.staff);
  const customers = indexById(data.customers);

  const todayKey = dateKey(now);
  const onDay = (a, key) => dateKey(new Date(a.appointment_date)) === key;
  const live = data.appointments.filter((a) => a.status !== "cancelled");
  const todays = live.filter((a) => onDay(a, todayKey)).sort(byDate);
  const pending = data.appointments.filter((a) => a.status === "pending").sort(byDate);
  const weekAgo = addDays(now, -7);
  const earned = data.appointments
    .filter((a) => a.status === "completed" && new Date(a.appointment_date) >= weekAgo)
    .reduce((sum, a) => sum + a.price, 0);

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfDay(now), i);
    return { day, count: live.filter((a) => onDay(a, dateKey(day))).length };
  });
  const peak = Math.max(1, ...week.map((w) => w.count));

  const setStatus = (appt, status) => {
    dispatch({ type: "SET_APPOINTMENT_STATUS", payload: { id: appt.id, status } });
    toast(
      { approved: "Appointment approved.", completed: "Marked as done.", cancelled: "Appointment cancelled." }[status]
    );
  };

  const stats = [
    ["Booked today", todays.length],
    ["Waiting for approval", pending.length],
    ["Earned in the last 7 days", formatMoney(earned)],
    ["Active customers", data.customers.filter((c) => c.is_active).length],
  ];

  return (
    <>
      <PageHeader title="Overview" subtitle={formatDayLong(now)} />

      <dl className="grid grid-cols-2 divide-ink-200 overflow-hidden rounded-lg bg-white shadow-sm lg:grid-cols-4 lg:divide-x">
        {stats.map(([label, value]) => (
          <div key={label} className="border-b border-ink-100 p-5 lg:border-b-0">
            <dt className="text-sm text-ink-500">{label}</dt>
            <dd className="mt-1 font-display text-5xl font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8" aria-labelledby="pending-h">
        <h2 id="pending-h" className="font-display text-3xl font-extrabold tracking-wide">
          Needs your answer
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-lg bg-white p-5 text-ink-500 shadow-sm">All caught up. No requests are waiting.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100 rounded-lg bg-white shadow-sm">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">
                    {fullName(customers.get(a.customer_id))} wants {services.get(a.service_id)?.service_name}
                  </p>
                  <p className="text-sm text-ink-500">
                    {formatDayLong(a.appointment_date)} at {formatTime(a.appointment_date)} with{" "}
                    {staff.get(a.staff_id)?.first_name}
                  </p>
                </div>
                <AppointmentActions appt={a} onStatus={setStatus} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="today-h">
        <h2 id="today-h" className="font-display text-3xl font-extrabold tracking-wide">
          Today by barber
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.staff
            .filter((s) => s.is_active)
            .map((b) => {
              const mine = todays.filter((a) => a.staff_id === b.id);
              return (
                <div key={b.id} className="rounded-lg bg-white p-5 shadow-sm">
                  <h3 className="font-bold">{fullName(b)}</h3>
                  {mine.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-500">Nothing booked today.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {mine.map((a) => (
                        <li key={a.id} className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{formatTime(a.appointment_date)}</p>
                            <p className="text-sm text-ink-600">
                              {fullName(customers.get(a.customer_id))}, {services.get(a.service_id)?.service_name}
                            </p>
                          </div>
                          <StatusBadge status={a.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="week-h">
        <h2 id="week-h" className="font-display text-3xl font-extrabold tracking-wide">
          Next 7 days
        </h2>
        <div className="mt-3 flex items-end gap-2 rounded-lg bg-white p-5 shadow-sm" role="img"
          aria-label={`Bookings per day: ${week.map((w) => `${w.day.toLocaleDateString(undefined, { weekday: "long" })} ${w.count}`).join(", ")}`}>
          {week.map((w) => (
            <div key={dateKey(w.day)} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-sm font-semibold">{w.count}</span>
              <div className="flex h-28 w-full items-end">
                <div
                  className="w-full rounded-t bg-pole-blue"
                  style={{ height: `${Math.max(4, (w.count / peak) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-ink-500">{w.day.toLocaleDateString(undefined, { weekday: "short" })}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
