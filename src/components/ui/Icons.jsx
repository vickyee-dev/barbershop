const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const MenuIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const DownloadIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />
  </svg>
);
export const ArrowLeftIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M19 12H5m0 0l6-6m-6 6l6 6" />
  </svg>
);
export const ArrowRightIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
  </svg>
);
export const PinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

// Brand mark: a barber pole capsule.
export function PoleMark({ className = "size-9" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <clipPath id="pole-clip">
          <rect x="10" y="3" width="12" height="26" rx="6" />
        </clipPath>
      </defs>
      <g clipPath="url(#pole-clip)">
        <rect x="10" y="3" width="12" height="26" fill="#f8f9fb" />
        <path d="M6 6l24 12v6L6 12zM6 18l24 12v-2L6 16zM6-6l24 12v6L6 0z" fill="#c0272d" />
        <path d="M6 14l24 12v4L6 18zM6 2l24 12v4L6 6z" fill="#2c5fa8" />
      </g>
      <rect x="10" y="3" width="12" height="26" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
