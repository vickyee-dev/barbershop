import { useStore } from "../../state/context";

export default function ToastRegion() {
  const { toasts } = useStore();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-md px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            t.tone === "error" ? "bg-pole" : "bg-ink-900"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
