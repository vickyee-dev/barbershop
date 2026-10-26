import { useEffect } from "react";
import { config } from "./config";
import { usePath } from "./lib/router";
import StoreProvider from "./state/StoreProvider";
import { useStore } from "./state/context";
import SiteFooter from "./components/layout/SiteFooter";
import SiteHeader from "./components/layout/SiteHeader";
import Link from "./components/ui/Link";
import ToastRegion from "./components/ui/ToastRegion";
import Landing from "./pages/Landing";
import MyBooking from "./pages/MyBooking";
import BookingPage from "./pages/booking/BookingPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import Appointments from "./pages/admin/Appointments";
import Customers from "./pages/admin/Customers";
import Overview from "./pages/admin/Overview";
import Services from "./pages/admin/Services";
import Staff from "./pages/admin/Staff";

const adminPages = {
  "/admin": [Overview, "Overview"],
  "/admin/appointments": [Appointments, "Appointments"],
  "/admin/services": [Services, "Services"],
  "/admin/staff": [Staff, "Barbers"],
  "/admin/customers": [Customers, "Customers"],
};

const sitePages = {
  "/": [Landing, "Book online"],
  "/book": [BookingPage, "Book a chair"],
  "/booking": [MyBooking, "Find my booking"],
};

function NotFound() {
  return (
    <main className="px-4 py-24 text-center">
      <h1 className="font-display text-6xl font-black">Page not found</h1>
      <Link to="/" button className="mt-6">
        Back to the shop
      </Link>
    </main>
  );
}

function Shell() {
  const path = usePath();
  const { isAdmin } = useStore();
  const admin = path.startsWith("/admin");
  const entry = admin ? adminPages[path] : sitePages[path];
  const title = entry?.[1] ?? "Page not found";

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | ${admin ? "Staff | " : ""}${config.shop.name}`;
  }, [path, title, admin]);

  if (admin) {
    if (!isAdmin) return <AdminLogin />;
    const Page = entry?.[0] ?? NotFound;
    return (
      <AdminLayout path={path}>
        <Page />
      </AdminLayout>
    );
  }

  const Page = entry?.[0] ?? NotFound;
  return (
    <>
      <SiteHeader />
      <Page />
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
      <ToastRegion />
    </StoreProvider>
  );
}
