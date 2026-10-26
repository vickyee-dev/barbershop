import { formatDayLong, formatDuration, formatMoney, formatTime, fullName } from "../lib/format";
import StatusBadge from "./ui/StatusBadge";

function Row({ label, value, empty }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className={`text-right font-semibold ${value ? "text-ink-900" : "text-ink-300"}`}>
        {value || empty}
      </dd>
    </div>
  );
}

/**
 * The appointment ticket. In the booking flow it fills in as choices are made;
 * on the confirmation screen it becomes the customer's stub.
 */
export default function Ticket({ service, barber, anyBarber, slot, reference, status, className = "" }) {
  const start = slot ? new Date(slot) : null;
  return (
    <div className={`ticket ${className}`}>
      <div className="ticket-top rounded-t-lg bg-white">
        <div className="pole-stripe h-2 rounded-t-lg" aria-hidden="true" />
        <div className="px-6 pb-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-3xl font-extrabold leading-none tracking-wide">
              {reference ? "Your ticket" : "Your appointment"}
            </h2>
            {status && <StatusBadge status={status} />}
          </div>
          <dl className="mt-3 divide-y divide-ink-100">
            <Row label="Service" value={service?.service_name} empty="Not chosen yet" />
            <Row
              label="Barber"
              value={barber ? fullName(barber) : anyBarber ? "First available" : null}
              empty="Not chosen yet"
            />
            <Row label="Day" value={start && formatDayLong(start)} empty="Not chosen yet" />
            <Row
              label="Time"
              value={
                start && service
                  ? `${formatTime(start)} (${formatDuration(service.duration_minutes)})`
                  : start
                  ? formatTime(start)
                  : null
              }
              empty="Not chosen yet"
            />
          </dl>
        </div>
      </div>
      <div className="ticket-bottom rounded-b-lg border-t-2 border-dashed border-ink-200 bg-white px-6 py-4">
        {reference ? (
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-ink-500">Reference</p>
              <p className="font-display text-4xl font-extrabold tracking-widest text-ink-900">{reference}</p>
            </div>
            {service && <p className="text-xl font-bold">{formatMoney(service.price)}</p>}
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-ink-500">Pay in the shop</p>
            <p className="font-display text-4xl font-extrabold">{service ? formatMoney(service.price) : "—"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
