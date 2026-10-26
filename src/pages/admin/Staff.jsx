import { useState } from "react";
import Button from "../../components/ui/Button";
import { CheckboxField, TextField } from "../../components/ui/Field";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { fullName, initials, isValidPhone } from "../../lib/format";
import { useStore } from "../../state/context";
import PageHeader from "./PageHeader";

const blank = { first_name: "", last_name: "", specialization: "", phone: "", is_active: true };

export default function Staff() {
  const { data, dispatch, toast } = useStore();
  const [editing, setEditing] = useState(null);
  const upcoming = (id) =>
    data.appointments.filter(
      (a) => a.staff_id === id && ["pending", "approved"].includes(a.status) && new Date(a.appointment_date) > new Date()
    ).length;

  return (
    <>
      <PageHeader title="Barbers" subtitle="Hidden barbers can't be booked. Their past appointments stay on record.">
        <Button onClick={() => setEditing("new")}>Add a barber</Button>
      </PageHeader>

      <ul className="divide-y divide-ink-100 overflow-hidden rounded-lg bg-white shadow-sm">
        {data.staff.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-4 p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-4 border-pole-blue bg-ink-50 font-display text-xl font-extrabold">
              {initials(s)}
            </span>
            <div className="min-w-48 flex-1">
              <p className="font-bold">{fullName(s)}</p>
              <p className="text-sm text-ink-500">
                {s.specialization}. {s.phone}. {upcoming(s.id)} upcoming.
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
                  dispatch({ type: "TOGGLE_STAFF", payload: s.id });
                  toast(s.is_active ? `${s.first_name} is hidden from booking.` : `${s.first_name} is bookable again.`);
                }}
              >
                {s.is_active ? "Hide" : "Show"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <StaffForm key={editing?.id ?? editing} editing={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function StaffForm({ editing, onClose }) {
  const { dispatch, toast } = useStore();
  const isNew = editing === "new";
  const [form, setForm] = useState(() => (editing && !isNew ? { ...editing } : blank));
  const [errors, setErrors] = useState({});
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Enter a first name.";
    if (!form.last_name.trim()) e.last_name = "Enter a last name.";
    if (form.phone.trim() && !isValidPhone(form.phone)) e.phone = "Use 7 to 15 digits.";
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({
      type: "SAVE_STAFF",
      payload: {
        ...(isNew ? {} : { id: editing.id }),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        specialization: form.specialization.trim(),
        phone: form.phone.trim(),
        is_active: form.is_active,
      },
    });
    toast(isNew ? "Barber added." : "Barber updated.");
    onClose();
  };

  return (
    <Modal
      open={!!editing}
      onClose={onClose}
      title={isNew ? "Add a barber" : "Edit barber"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{isNew ? "Add barber" : "Save changes"}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" value={form.first_name} error={errors.first_name} onChange={(e) => set({ first_name: e.target.value })} />
        <TextField label="Last name" value={form.last_name} error={errors.last_name} onChange={(e) => set({ last_name: e.target.value })} />
        <div className="sm:col-span-2">
          <TextField label="Speciality" placeholder="Skin fades and designs" value={form.specialization} onChange={(e) => set({ specialization: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <TextField label="Phone" type="tel" optional value={form.phone} error={errors.phone} onChange={(e) => set({ phone: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <CheckboxField label="Customers can book this barber" checked={form.is_active} onChange={(e) => set({ is_active: e.target.checked })} />
        </div>
      </div>
    </Modal>
  );
}
