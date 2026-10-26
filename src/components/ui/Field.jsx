import { useId } from "react";
import { inputClasses } from "./styles";

function Wrap({ id, label, hint, error, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-900">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-500">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-pole">
          {error}
        </p>
      )}
    </div>
  );
}

const describe = (id, hint, error) =>
  error ? `${id}-err` : hint ? `${id}-hint` : undefined;

export function TextField({ label, hint, error, optional, className = "", ...props }) {
  const id = useId();
  return (
    <Wrap {...{ id, label, hint, error, optional }}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describe(id, hint, error)}
        className={`${inputClasses} ${className}`}
        {...props}
      />
    </Wrap>
  );
}

export function SelectField({ label, hint, error, optional, children, ...props }) {
  const id = useId();
  return (
    <Wrap {...{ id, label, hint, error, optional }}>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={describe(id, hint, error)}
        className={inputClasses}
        {...props}
      >
        {children}
      </select>
    </Wrap>
  );
}

export function TextAreaField({ label, hint, error, optional, ...props }) {
  const id = useId();
  return (
    <Wrap {...{ id, label, hint, error, optional }}>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={describe(id, hint, error)}
        className={inputClasses}
        {...props}
      />
    </Wrap>
  );
}

export function CheckboxField({ label, error, children, ...props }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={!!error}
          className="mt-1 size-5 shrink-0 rounded border-ink-300 accent-pole"
          {...props}
        />
        <label htmlFor={id} className="text-sm text-ink-700">
          {label ?? children}
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-pole">
          {error}
        </p>
      )}
    </div>
  );
}
