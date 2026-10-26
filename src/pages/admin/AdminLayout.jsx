import { useState } from "react";
import { config } from "../../config";
import Button from "../../components/ui/Button";
import Link from "../../components/ui/Link";
import { ConfirmModal } from "../../components/ui/Modal";
import { PoleMark } from "../../components/ui/Icons";
import { useStore } from "../../state/context";

const NAV = [
  ["/admin", "Overview"],
  ["/admin/appointments", "Appointments"],
  ["/admin/services", "Services"],
  ["/admin/staff", "Barbers"],
  ["/admin/customers", "Customers"],
];

export default function AdminLayout({ path, children }) {
  const { data, logoutAdmin, resetDemoData, toast } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const pending = data.appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-ink-50 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink-900 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="pole-stripe h-1.5" aria-hidden="true" />
        <div className="flex items-center gap-2.5 px-5 py-4">
          <PoleMark className="size-8" />
          <span className="font-display text-xl font-extrabold leading-tight tracking-wide">
            {config.shop.name}
            <span className="block text-xs font-medium tracking-normal text-ink-300">Staff</span>
          </span>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible">
          {NAV.map(([to, label]) => {
            const current = path === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={current ? "page" : undefined}
                className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-semibold ${
                  current ? "bg-white text-ink-900" : "text-ink-200 hover:bg-white/10"
                }`}
              >
                {label}
                {to === "/admin/appointments" && pending > 0 && (
                  <span className="rounded-full bg-pole px-2 py-0.5 text-xs text-white">{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="hidden space-y-2 border-t border-white/10 p-3 lg:block">
          <Link to="/" className="block rounded-md px-3 py-2 text-sm text-ink-200 hover:bg-white/10">
            View customer site
          </Link>
          <button
            onClick={() => setConfirmReset(true)}
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-ink-200 hover:bg-white/10"
          >
            Reset demo data
          </button>
          <Button variant="outlineLight" size="sm" className="w-full" onClick={logoutAdmin}>
            Log out
          </Button>
        </div>
      </aside>

      <div className="min-w-0 px-4 py-8 sm:px-8">
        {children}
        <div className="mt-10 flex flex-wrap gap-3 border-t border-ink-200 pt-6 lg:hidden">
          <Link to="/" button variant="outline" size="sm">
            Customer site
          </Link>
          <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>
            Reset demo data
          </Button>
          <Button variant="dark" size="sm" onClick={logoutAdmin}>
            Log out
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          toast("Demo data restored.");
        }}
        title="Reset all data?"
        confirmLabel="Reset data"
      >
        This replaces every appointment, customer, service and barber with the original demo data.
      </ConfirmModal>
    </div>
  );
}
