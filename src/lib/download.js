import { buildIcs } from "./booking";

export function downloadIcs({ appointment, service, barber }) {
  const blob = new Blob([buildIcs({ appointment, service, barber })], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${appointment.reference}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
