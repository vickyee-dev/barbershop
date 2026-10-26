import { useEffect, useRef } from "react";
import Button from "./Button";

// Built on the native <dialog>: focus trapping, Escape to close and the
// backdrop come from the browser.
export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const width = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" }[size];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-lg bg-white p-0 shadow-2xl backdrop:bg-ink-950/60`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
            <h2 id="modal-title" className="font-display text-2xl font-extrabold tracking-wide">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-ink-100 bg-ink-50 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, children, confirmLabel, danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Keep it
          </Button>
          <Button
            variant={danger ? "primary" : "dark"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-ink-700">{children}</div>
    </Modal>
  );
}
