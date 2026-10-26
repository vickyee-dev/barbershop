import { formatDuration, formatMoney } from "../../lib/format";

export default function ServiceStep({ services, selectedId, onSelect }) {
  return (
    <div>
      <h2 className="font-display text-4xl font-extrabold tracking-wide">Choose a service</h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {services.map((s) => {
          const selected = s.id === selectedId;
          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s)}
                aria-pressed={selected}
                className={`flex h-full w-full flex-col rounded-lg border-2 p-4 text-left transition-colors ${
                  selected ? "border-pole bg-red-50" : "border-ink-200 hover:border-ink-500"
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-bold">{s.service_name}</span>
                  <span className="font-display text-2xl font-extrabold text-pole">{formatMoney(s.price)}</span>
                </span>
                <span className="mt-1 text-sm text-ink-600">{s.description}</span>
                <span className="mt-3 text-sm font-medium text-ink-500">{formatDuration(s.duration_minutes)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {services.length === 0 && <p className="mt-6 text-ink-600">No services are open for booking right now.</p>}
    </div>
  );
}
