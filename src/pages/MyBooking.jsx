import { useState } from "react";
import Ticket from "../components/Ticket";
import Button from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { DownloadIcon } from "../components/ui/Icons";
import { ConfirmModal } from "../components/ui/Modal";
import Link from "../components/ui/Link";
import { canCustomerCancel, findBooking } from "../lib/booking";
import { downloadIcs } from "../lib/download";
import { useStore } from "../state/context";

export default function MyBooking() {
  const { data, dispatch, toast } = useStore();
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [foundId, setFoundId] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const appointment = data.appointments.find((a) => a.id === foundId);
  const service = appointment && data.services.find((s) => s.id === appointment.service_id);
  const barber = appointment && data.staff.find((s) => s.id === appointment.staff_id);

  const search = (e) => {
    e.preventDefault();
    const match = findBooking(data, reference, phone);
    setFoundId(match?.id ?? null);
    setNotFound(!match);
  };

  const cancel = () => {
    dispatch({ type: "SET_APPOINTMENT_STATUS", payload: { id: appointment.id, status: "cancelled" } });
    toast("Booking cancelled. Your time is free for someone else.");
  };

  return (
    <main className="bg-ink-50 px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl font-black tracking-wide">Find my booking</h1>
          <p className="mt-3 text-ink-700">
            Enter the reference from your confirmation and the phone number you booked with.
          </p>
          <form onSubmit={search} className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow-sm" noValidate>
            <TextField
              label="Reference"
              placeholder="MB-7K2QX"
              autoCapitalize="characters"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
            <TextField
              label="Phone number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {notFound && (
              <p role="alert" className="text-sm font-medium text-pole">
                No booking matches that reference and phone number. Check both and try again.
              </p>
            )}
            <Button type="submit" size="lg">
              Find booking
            </Button>
          </form>
          <p className="mt-4 text-sm text-ink-500">
            Not booked yet? <Link to="/book" className="font-semibold text-pole underline underline-offset-4">Book a chair</Link>
          </p>
        </div>

        {appointment && (
          <div>
            <Ticket
              service={service}
              barber={barber}
              slot={appointment.appointment_date}
              reference={appointment.reference}
              status={appointment.status}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="dark" onClick={() => downloadIcs({ appointment, service, barber })}>
                <DownloadIcon className="size-4" />
                Add to calendar
              </Button>
              {canCustomerCancel(appointment) && (
                <Button variant="danger" onClick={() => setConfirmCancel(true)}>
                  Cancel booking
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        title="Cancel this booking?"
        confirmLabel="Cancel booking"
      >
        This frees your time for other customers. You can book again whenever you like.
      </ConfirmModal>
    </main>
  );
}
