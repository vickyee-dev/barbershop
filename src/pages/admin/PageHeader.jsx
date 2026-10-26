export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-5xl font-black tracking-wide">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
