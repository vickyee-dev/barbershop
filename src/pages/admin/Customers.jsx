import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import { SelectField, TextField } from "../../components/ui/Field";
import StatusBadge from "../../components/ui/StatusBadge";
import { digitsOnly, formatDayShort, formatMoney, fullName } from "../../lib/format";
import { useStore } from "../../state/context";
import PageHeader from "./PageHeader";
import { byDate, indexById } from "./helpers";

export default function Customers() {
  const { data, dispatch } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const services = indexById(data.services);
  const staff = indexById(data.staff);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = digitsOnly(query);
    return data.customers
      .filter((c) => (filter === "all" ? true : filter === "active" ? c.is_active : !c.is_active))
      .filter(
        (c) =>
          !q ||
          fullName(c).toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          (qDigits && digitsOnly(c.phone).includes(qDigits))
      )
      .map((c) => {
        const history = data.appointments.filter((a) => a.customer_id === c.id).sort((a, b) => byDate(b, a));
        const done = history.filter((a) => a.status === "completed");
        return { c, history, visits: done.length, spent: done.reduce((s, a) => s + a.price, 0) };
      });
  }, [data, query, filter]);

  return (
    <>
      <PageHeader title="Customers" subtitle="Customers are added automatically the first time they book." />

      <div className="grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-[2fr_1fr]">
        <TextField label="Search" placeholder="Name, phone or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SelectField label="Show" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Everyone</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectField>
      </div>

      <ul className="mt-4 space-y-3">
        {rows.map(({ c, history, visits, spent }) => (
          <li key={c.id} className="rounded-lg bg-white shadow-sm">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-4 p-4">
                <div className="min-w-48 flex-1">
                  <p className="font-bold">{fullName(c)}</p>
                  <p className="text-sm text-ink-500">
                    {c.phone}
                    {c.email ? `, ${c.email}` : ""}
                  </p>
                </div>
                <p className="text-sm text-ink-600">
                  {visits} {visits === 1 ? "visit" : "visits"}, {formatMoney(spent)} spent
                </p>
                <StatusBadge status={c.is_active ? "active" : "inactive"} />
              </summary>
              <div className="border-t border-ink-100 p-4">
                {history.length === 0 ? (
                  <p className="text-sm text-ink-500">No appointments yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {history.slice(0, 6).map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>
                          {formatDayShort(a.appointment_date)}: {services.get(a.service_id)?.service_name} with{" "}
                          {staff.get(a.staff_id)?.first_name}
                        </span>
                        <StatusBadge status={a.status} />
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => dispatch({ type: "TOGGLE_CUSTOMER", payload: c.id })}
                >
                  {c.is_active ? "Mark inactive" : "Mark active"}
                </Button>
              </div>
            </details>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="mt-6 rounded-lg bg-white p-8 text-center text-ink-500">No customers match.</p>}
    </>
  );
}
