import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import { SelectField, TextField } from "../../components/ui/Field";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { useNow } from "../../hooks";
import { getSlots } from "../../lib/availability";
import { formatDayShort, formatMoney, formatTime, fullName, isValidPhone } from "../../lib/format";
import { dateKey, parseKey, startOfDay } from "../../lib/time";
import { useStore } from "../../state/context";
import AppointmentActions from "./AppointmentActions";
import PageHeader from "./PageHeader";
import { byDate, indexById } from "./helpers";

const STATUSES = ["all", "pending", "approved", "completed", "cancelled"];
const STATUS_LABEL = { all: "All", pending: "Pending", approved: "Confirmed", completed: "Completed", cancelled: "Cancelled" };

export default function Appointments() {
  const { data, dispatch, toast } = useStore();
  const now = useNow();
  const [status, setStatus] = useState("all");
  const [when, setWhen] = useState("upcoming");
  const [barberId, setBarberId] = useState("all");
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  const services = indexById(data.services);
  const staff = indexById(data.staff);
  const customers = indexById(data.customers);

  const scoped = useMemo(() => {
    const todayKey = dateKey(now);
    const q = query.trim().toLowerCase();
    return data.appointments.filter((a) => {
      const start = new Date(a.appointment_date);
      if (when === "today" && dateKey(start) !== todayKey) return false;
      if (when === "upcoming" && dateKey(start) < todayKey) return false;
      if (when === "past" && dateKey(start) >= todayKey) return false;
      if (barberId !== "all" && a.staff_id !== Number(barberId)) return false;
      if (q) {
        const c = customers.get(a.customer_id);
        const hay = `${fullName(c)} ${c?.phone} ${a.reference}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.appointments, when, barberId, query, now, customers]);

  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, s === "all" ? scoped.length : scoped.filter((a) => a.status === s).length])
  );
  const rows = scoped
    .filter((a) => status === "all" || a.status === status)
    .sort((a, b) => (when === "past" ? byDate(b, a) : byDate(a, b)));

  const changeStatus = (appt, next) => {
    dispatch({ type: "SET_APPOINTMENT_STATUS", payload: { id: appt.id, status: next } });
    toast({ approved: "Appointment approved.", completed: "Marked as done.", cancelled: "Appointment cancelled." }[next]);
  };

  return (
    <>
      <PageHeader title="Appointments" subtitle="Approve requests, finish visits and add walk-ins.">
        <Button onClick={() => setShowNew(true)}>Add walk-in or phone booking</Button>
      </PageHeader>

      <div className="grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-3">
        <TextField label="Search" placeholder="Name, phone or reference" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SelectField label="When" value={when} onChange={(e) => setWhen(e.target.value)}>
          <option value="upcoming">Today and later</option>
          <option value="today">Today only</option>
          <option value="past">Before today</option>
          <option value="all">All dates</option>
        </SelectField>
        <SelectField label="Barber" value={barberId} onChange={(e) => setBarberId(e.target.value)}>
          <option value="all">Everyone</option>
          {data.staff.map((s) => (
            <option key={s.id} value={s.id}>
              {fullName(s)}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Status">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${
              status === s ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white hover:border-ink-500"
            }`}
          >
            {STATUS_LABEL[s]} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left">
          <thead className="border-b border-ink-100 text-sm text-ink-500">
            <tr>
              {["When", "Customer", "Service", "Barber", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((a) => {
              const c = customers.get(a.customer_id);
              return (
                <tr key={a.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{formatDayShort(a.appointment_date)}</p>
                    <p className="text-sm text-ink-500">{formatTime(a.appointment_date)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{fullName(c)}</p>
                    <p className="text-sm text-ink-500">{c?.phone}</p>
                    <p className="text-xs text-ink-300">{a.reference}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{services.get(a.service_id)?.service_name}</p>
                    <p className="text-sm text-ink-500">{formatMoney(a.price)}</p>
                  </td>
                  <td className="px-4 py-3">{staff.get(a.staff_id)?.first_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <AppointmentActions appt={a} onStatus={changeStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-ink-500">No appointments match these filters.</p>
        )}
      </div>

      <NewBookingModal open={showNew} onClose={() => setShowNew(false)} />
    </>
  );
}

function NewBookingModal({ open, onClose }) {
  const { data, bookAppointment, toast } = useStore();
  const now = useNow();
  const services = data.services.filter((s) => s.is_active);
  const team = data.staff.filter((s) => s.is_active);
  const [form, setForm] = useState({
    service_id: services[0]?.id ?? "",
    staff_id: team[0]?.id ?? "",
    date: dateKey(new Date()),
    slot: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const serviceId = Number(form.service_id);
  const service = services.find((s) => s.id === serviceId);
  const slots = useMemo(() => {
    const svc = data.services.find((s) => s.id === serviceId);
    if (!svc || !form.date) return [];
    return getSlots({
      day: startOfDay(parseKey(form.date)),
      duration: svc.duration_minutes,
      staffId: Number(form.staff_id),
      staff: data.staff,
      appointments: data.appointments,
      now,
      leadMinutes: 0,
    }).filter((s) => s.available);
  }, [serviceId, form.date, form.staff_id, data, now]);

  const submit = () => {
    if (!form.first_name.trim()) return setError("Enter the customer's first name.");
    if (!isValidPhone(form.phone)) return setError("Enter a phone number with 7 to 15 digits.");
    if (!form.slot) return setError("Pick a time.");
    const res = bookAppointment(
      {
        service_id: service.id,
        staff_id: Number(form.staff_id),
        appointment_date: form.slot,
        customer: { first_name: form.first_name, last_name: form.last_name, email: "", phone: form.phone },
      },
      { asAdmin: true }
    );
    if (!res.ok) return setError(res.error);
    toast(`Booked ${form.first_name} for ${formatTime(form.slot)}. Reference ${res.appointment.reference}.`);
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a booking"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Book and approve</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Service" value={form.service_id} onChange={(e) => set({ service_id: e.target.value, slot: "" })}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.service_name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Barber" value={form.staff_id} onChange={(e) => set({ staff_id: e.target.value, slot: "" })}>
          {team.map((s) => (
            <option key={s.id} value={s.id}>
              {fullName(s)}
            </option>
          ))}
        </SelectField>
        <TextField label="Date" type="date" value={form.date} min={dateKey(new Date())} onChange={(e) => set({ date: e.target.value, slot: "" })} />
        <SelectField label="Time" value={form.slot} onChange={(e) => set({ slot: e.target.value })}>
          <option value="">{slots.length ? "Choose a time" : "No free times"}</option>
          {slots.map((s) => (
            <option key={s.iso} value={s.iso}>
              {formatTime(s.start)}
            </option>
          ))}
        </SelectField>
        <TextField label="First name" value={form.first_name} onChange={(e) => set({ first_name: e.target.value })} />
        <TextField label="Last name" optional value={form.last_name} onChange={(e) => set({ last_name: e.target.value })} />
        <div className="sm:col-span-2">
          <TextField label="Phone number" type="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-pole">
          {error}
        </p>
      )}
    </Modal>
  );
}
