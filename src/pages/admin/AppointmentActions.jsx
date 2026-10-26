import { useState } from "react";
import Button from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/Modal";

const confirmCopy = {
  cancelled: {
    title: "Cancel this appointment?",
    body: "The customer isn't notified automatically, so call or text them. The time becomes free to book again.",
    label: "Cancel appointment",
  },
};

export default function AppointmentActions({ appt, onStatus }) {
  const [confirming, setConfirming] = useState(null);

  if (appt.status === "completed" || appt.status === "cancelled") {
    return <span className="text-sm text-ink-300">No actions</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {appt.status === "pending" && (
        <Button size="sm" onClick={() => onStatus(appt, "approved")}>
          Approve
        </Button>
      )}
      {appt.status === "approved" && (
        <Button size="sm" variant="dark" onClick={() => onStatus(appt, "completed")}>
          Mark done
        </Button>
      )}
      <Button size="sm" variant="danger" onClick={() => setConfirming("cancelled")}>
        {appt.status === "pending" ? "Decline" : "Cancel"}
      </Button>

      <ConfirmModal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={() => onStatus(appt, confirming)}
        title={confirmCopy.cancelled.title}
        confirmLabel={confirmCopy.cancelled.label}
      >
        {confirmCopy.cancelled.body}
      </ConfirmModal>
    </div>
  );
}
