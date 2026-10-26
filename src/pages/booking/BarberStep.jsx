import { fullName, initials } from "../../lib/format";

function Option({ selected, onClick, badge, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
        selected ? "border-pole bg-red-50" : "border-ink-200 hover:border-ink-500"
      }`}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-4 border-pole-blue bg-ink-50 font-display text-xl font-extrabold">
        {badge}
      </span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="block text-sm text-ink-600">{subtitle}</span>
      </span>
    </button>
  );
}

export default function BarberStep({ team, selected, onSelect }) {
  return (
    <div>
      <h2 className="font-display text-4xl font-extrabold tracking-wide">Choose a barber</h2>
      <div className="mt-6 space-y-3">
        <Option
          selected={selected === "any"}
          onClick={() => onSelect("any")}
          badge="Any"
          title="First available"
          subtitle="Most openings. We give you whoever is free at your time."
        />
        {team.map((b) => (
          <Option
            key={b.id}
            selected={selected === b.id}
            onClick={() => onSelect(b.id)}
            badge={initials(b)}
            title={fullName(b)}
            subtitle={b.specialization}
          />
        ))}
      </div>
    </div>
  );
}
