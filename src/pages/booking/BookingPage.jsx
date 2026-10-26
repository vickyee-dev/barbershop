import { useMemo, useState } from "react";
import Ticket from "../../components/Ticket";
import { CheckIcon } from "../../components/ui/Icons";
import { useNow } from "../../hooks";
import { getSlots } from "../../lib/availability";
import { startOfDay } from "../../lib/time";
import { useStore } from "../../state/context";
import BarberStep from "./BarberStep";
import DetailsStep from "./DetailsStep";
import ServiceStep from "./ServiceStep";
import Success from "./Success";
import TimeStep from "./TimeStep";

const STEPS = [
  ["service", "Service"],
  ["barber", "Barber"],
  ["time", "Time"],
  ["details", "Details"],
];

export default function BookingPage() {
  const { data, draft, updateDraft, updateCustomer, resetDraft, bookAppointment, toast } = useStore();
  const now = useNow();
  const [confirmedId, setConfirmedId] = useState(null);
  const [error, setError] = useState("");

  const services = data.services.filter((s) => s.is_active);
  const team = data.staff.filter((s) => s.is_active);
  const service = services.find((s) => s.id === draft.service_id) ?? null;
  const barber = typeof draft.staff_id === "number" ? team.find((s) => s.id === draft.staff_id) ?? null : null;
  const staffChoice = draft.staff_id === "any" || barber ? draft.staff_id : null;

  // A slot carried over from the landing page or an old session may have been
  // taken since: only trust it while it is still free.
  const slot = useMemo(() => {
    if (!draft.slot || !service || !staffChoice) return null;
    const day = startOfDay(new Date(draft.slot));
    const ok = getSlots({
      day,
      duration: service.duration_minutes,
      staffId: staffChoice,
      staff: data.staff,
      appointments: data.appointments,
      now,
    }).some((s) => s.iso === draft.slot && s.available);
    return ok ? draft.slot : null;
  }, [draft.slot, service, staffChoice, data, now]);

  const done = { service: !!service, barber: !!staffChoice, time: !!slot, details: false };
  const reachable = (step) => STEPS.slice(0, STEPS.findIndex(([id]) => id === step)).every(([id]) => done[id]);
  const firstIncomplete = STEPS.find(([id]) => !done[id])?.[0] ?? "details";
  const step = reachable(draft.step) ? draft.step : firstIncomplete;

  const pickService = (s) =>
    updateDraft({ service_id: s.id, slot: null, step: staffChoice ? "time" : "barber" });
  const pickBarber = (id) => updateDraft({ staff_id: id, slot: null, step: "time" });
  const pickSlot = (iso) => updateDraft({ slot: iso, step: "details" });

  const submit = () => {
    const result = bookAppointment({
      service_id: service.id,
      staff_id: staffChoice,
      appointment_date: slot,
      customer: draft.customer,
    });
    if (!result.ok) {
      setError(result.error);
      toast(result.error, "error");
      updateDraft({ slot: null, step: "time" });
      return;
    }
    setError("");
    setConfirmedId(result.appointment.id);
    resetDraft();
    window.scrollTo(0, 0);
  };

  if (confirmedId) {
    return (
      <main className="bg-ink-50 px-4 py-12 sm:px-6">
        <Success appointmentId={confirmedId} onBookAnother={() => setConfirmedId(null)} />
      </main>
    );
  }

  return (
    <main className="bg-ink-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-5xl font-black tracking-wide sm:text-6xl">Book your chair</h1>

        <ol className="mt-6 flex flex-wrap gap-x-2 gap-y-2" aria-label="Booking steps">
          {STEPS.map(([id, label], i) => {
            const current = id === step;
            const can = reachable(id);
            return (
              <li key={id}>
                <button
                  disabled={!can}
                  onClick={() => updateDraft({ step: id })}
                  aria-current={current ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-full border-2 py-1.5 pl-1.5 pr-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                    current
                      ? "border-ink-900 bg-ink-900 text-white"
                      : done[id]
                      ? "border-ink-200 bg-white text-ink-900 hover:border-ink-500"
                      : "border-ink-200 bg-transparent text-ink-500"
                  }`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs ${
                      done[id] ? "bg-emerald-600 text-white" : current ? "bg-white text-ink-900" : "bg-ink-100"
                    }`}
                  >
                    {done[id] ? <CheckIcon className="size-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <section className="min-w-0 rounded-lg bg-white p-6 shadow-sm sm:p-8">
            {error && (
              <p role="alert" className="mb-6 rounded-md border border-pole bg-red-50 p-3 text-sm font-medium text-pole">
                {error}
              </p>
            )}
            {step === "service" && (
              <ServiceStep services={services} selectedId={draft.service_id} onSelect={pickService} />
            )}
            {step === "barber" && <BarberStep team={team} selected={staffChoice} onSelect={pickBarber} />}
            {step === "time" && service && (
              <TimeStep
                service={service}
                staffId={staffChoice}
                data={data}
                now={now}
                selectedSlot={slot}
                onSelect={pickSlot}
              />
            )}
            {step === "details" && (
              <DetailsStep
                customer={draft.customer}
                agreed={draft.agreed}
                onChange={updateCustomer}
                onAgree={(agreed) => updateDraft({ agreed })}
                onSubmit={submit}
              />
            )}
          </section>

          <aside className="lg:sticky lg:top-24" aria-label="Booking summary">
            <Ticket service={service} barber={barber} anyBarber={staffChoice === "any"} slot={slot} />
          </aside>
        </div>
      </div>
    </main>
  );
}
