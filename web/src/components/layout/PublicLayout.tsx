import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { PublicHeader } from "./PublicHeader";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
