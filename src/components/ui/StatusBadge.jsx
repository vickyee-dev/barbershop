const styles = {
  pending: ["Pending", "bg-amber-100 text-amber-900", "bg-amber-500"],
  approved: ["Confirmed", "bg-blue-100 text-blue-900", "bg-pole-blue"],
  completed: ["Completed", "bg-emerald-100 text-emerald-900", "bg-emerald-600"],
  cancelled: ["Cancelled", "bg-ink-100 text-ink-600", "bg-ink-300"],
  active: ["Active", "bg-emerald-100 text-emerald-900", "bg-emerald-600"],
  inactive: ["Inactive", "bg-ink-100 text-ink-600", "bg-ink-300"],
};

export default function StatusBadge({ status }) {
  const [label, cls, dot] = styles[status] ?? styles.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
