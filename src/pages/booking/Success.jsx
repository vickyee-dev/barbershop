import Ticket from "../../components/Ticket";
import Button from "../../components/ui/Button";
import Link from "../../components/ui/Link";
import { DownloadIcon } from "../../components/ui/Icons";
import { downloadIcs } from "../../lib/download";
import { useStore } from "../../state/context";

export default function Success({ appointmentId, onBookAnother }) {
  const { data } = useStore();
  const appointment = data.appointments.find((a) => a.id === appointmentId);
  if (!appointment) return null;
  const service = data.services.find((s) => s.id === appointment.service_id);
  const barber = data.staff.find((s) => s.id === appointment.staff_id);

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-6xl font-black leading-none tracking-wide">Request sent</h1>
        <p className="mt-4 text-lg text-ink-700">
          The shop will confirm your time shortly. Keep your reference. With the phone number you gave, it lets you
          check or cancel this booking at any time.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="dark" onClick={() => downloadIcs({ appointment, service, barber })}>
            <DownloadIcon className="size-4" />
            Add to calendar
          </Button>
          <Link to="/booking" button variant="outline">
            Find my booking
          </Link>
          <Button variant="ghost" onClick={onBookAnother}>
            Book another
          </Button>
        </div>
      </div>
      <Ticket
        service={service}
        barber={barber}
        slot={appointment.appointment_date}
        reference={appointment.reference}
        status={appointment.status}
      />
    </div>
  );
}
