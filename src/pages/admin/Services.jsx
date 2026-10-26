import { useState } from "react";
import { config } from "../../config";
import Button from "../../components/ui/Button";
import { CheckboxField, SelectField, TextAreaField, TextField } from "../../components/ui/Field";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDuration, formatMoney } from "../../lib/format";
import { useStore } from "../../state/context";
import PageHeader from "./PageHeader";

const blank = { service_name: "", description: "", duration_minutes: "30", price: "", image: "haircut1.webp", is_active: true };

export default function Services() {
  const { data, dispatch, toast } = useStore();
  const [editing, setEditing] = useState(null); // null | "new" | service
  const uses = (id) => data.appointments.filter((a) => a.service_id === id).length;

  return (
    <>
      <PageHeader title="Services" subtitle="Changing a price only affects future bookings.">
        <Button onClick={() => setEditing("new")}>Add a service</Button>
      </PageHeader>

      <ul className="divide-y divide-ink-100 overflow-hidden rounded-lg bg-white shadow-sm">
        {data.services.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-4 p-4">
            <img src={`/${s.image}`} alt="" className="size-16 rounded-md object-cover" loading="lazy" />
            <div className="min-w-48 flex-1">
              <p className="font-bold">{s.service_name}</p>
              <p className="text-sm text-ink-500">
                {formatDuration(s.duration_minutes)}, {formatMoney(s.price)}. Booked {uses(s.id)} times.
              </p>
            </div>
            <StatusBadge status={s.is_active ? "active" : "inactive"} />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  dispatch({ type: "TOGGLE_SERVICE", payload: s.id });
                  toast(s.is_active ? `${s.service_name} hidden from booking.` : `${s.service_name} is bookable again.`);
                }}
              >
                {s.is_active ? "Hide" : "Show"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ServiceForm key={editing?.id ?? editing} editing={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function ServiceForm({ editing, onClose }) {
  const { dispatch, toast } = useStore();
  const isNew = editing === "new";
  const [form, setForm] = useState(() =>
    editing && !isNew
      ? { ...editing, duration_minutes: String(editing.duration_minutes), price: String(editing.price) }
      : blank
  );
  const [errors, setErrors] = useState({});
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    const e = {};
    if (!form.service_name.trim()) e.service_name = "Give the service a name.";
    const duration = Number(form.duration_minutes);
    if (!Number.isInteger(duration) || duration < 5 || duration > 240) e.duration_minutes = "Enter whole minutes from 5 to 240.";
    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price) || price < 0) e.price = "Enter a price of 0 or more.";
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({
      type: "SAVE_SERVICE",
      payload: {
        ...(isNew ? {} : { id: editing.id }),
        service_name: form.service_name.trim(),
        description: form.description.trim(),
        duration_minutes: duration,
        price,
        image: form.image,
        is_active: form.is_active,
      },
    });
    toast(isNew ? "Service added." : "Service updated.");
    onClose();
  };

  return (
    <Modal
      open={!!editing}
      onClose={onClose}
      title={isNew ? "Add a service" : "Edit service"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{isNew ? "Add service" : "Save changes"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField label="Name" value={form.service_name} error={errors.service_name} onChange={(e) => set({ service_name: e.target.value })} />
        <TextAreaField label="Description" rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Length (minutes)" type="number" min="5" max="240" step="5" value={form.duration_minutes} error={errors.duration_minutes} onChange={(e) => set({ duration_minutes: e.target.value })} />
          <TextField label={`Price (${config.currency})`} type="number" min="0" step="0.01" value={form.price} error={errors.price} onChange={(e) => set({ price: e.target.value })} />
        </div>
        <SelectField label="Photo on the price board" value={form.image} onChange={(e) => set({ image: e.target.value })}>
          {Object.entries(config.photos).map(([file, label]) => (
            <option key={file} value={file}>
              {label}
            </option>
          ))}
        </SelectField>
        <CheckboxField label="Customers can book this service" checked={form.is_active} onChange={(e) => set({ is_active: e.target.checked })} />
      </div>
    </Modal>
  );
}
