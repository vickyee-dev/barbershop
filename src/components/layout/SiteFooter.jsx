import { config } from "../../config";
import Link from "../ui/Link";

export default function SiteFooter() {
  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="pole-stripe h-1.5" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {config.shop.name}. {config.shop.address}, {config.shop.city}
        </p>
        <div className="flex gap-5">
          <Link to="/booking" className="hover:text-white">
            Find my booking
          </Link>
          <Link to="/admin" className="hover:text-white">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
