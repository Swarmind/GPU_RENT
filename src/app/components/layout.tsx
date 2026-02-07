import { Outlet } from "react-router";
import { Header } from "./header";
import { Footer } from "./footer";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}