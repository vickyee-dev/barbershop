import { useState } from "react";
import { config } from "../../config";
import { goToSection, usePath } from "../../lib/router";
import Link from "../ui/Link";
import { CloseIcon, MenuIcon, PoleMark } from "../ui/Icons";

const sections = [
  ["services", "Prices"],
  ["work", "Our work"],
  ["team", "Barbers"],
  ["visit", "Visit"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePath();

  const jump = (id) => {
    setOpen(false);
    goToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      <div className="pole-stripe h-1.5" aria-hidden="true" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-ink-900" aria-label={`${config.shop.name} home`}>
          <PoleMark />
          <span className="font-display text-2xl font-extrabold tracking-wide">{config.shop.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {sections.map(([id, label]) => (
            <button
              key={id}
              onClick={() => jump(id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              {label}
            </button>
          ))}
          <Link
            to="/booking"
            className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-ink-100 ${
              path === "/booking" ? "text-pole" : "text-ink-700"
            }`}
          >
            My booking
          </Link>
          <Link to="/book" button size="md" className="ml-2">
            Book a chair
          </Link>
        </nav>

        <button
          className="rounded-md p-2 text-ink-900 hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink-100 bg-white px-4 py-3 md:hidden" aria-label="Main">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {sections.map(([id, label]) => (
              <button
                key={id}
                onClick={() => jump(id)}
                className="rounded-md px-3 py-3 text-left font-medium text-ink-900 hover:bg-ink-100"
              >
                {label}
              </button>
            ))}
            <Link to="/booking" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 font-medium hover:bg-ink-100">
              My booking
            </Link>
            <Link to="/book" button size="lg" className="mt-2" onClick={() => setOpen(false)}>
              Book a chair
            </Link>
          </div>
        </nav>
      )}
      <div className="h-px bg-ink-100" />
    </header>
  );
}
