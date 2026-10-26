const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

const variants = {
  primary: "bg-pole text-white hover:bg-pole-dark",
  dark: "bg-ink-900 text-white hover:bg-ink-700",
  light: "bg-white text-ink-900 hover:bg-ink-100",
  outline: "border border-ink-300 bg-white text-ink-900 hover:bg-ink-100",
  outlineLight: "border border-white/50 text-white hover:bg-white/10",
  ghost: "text-ink-700 hover:bg-ink-100",
  danger: "border border-pole bg-white text-pole hover:bg-pole hover:text-white",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export const buttonClasses = ({ variant = "primary", size = "md", className = "" } = {}) =>
  `${base} ${variants[variant]} ${sizes[size]} ${className}`;

export const inputClasses =
  "w-full rounded-md border border-ink-300 bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-500/70 aria-[invalid=true]:border-pole";
