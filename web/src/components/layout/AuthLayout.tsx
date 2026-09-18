import { Outlet } from "react-router-dom";
import { PublicRoute } from "@/router/RouteGuards";
import { Footer } from "./Footer";
import { PublicHeader } from "./PublicHeader";

export function AuthLayout() {
  return (
    <PublicRoute>
      <div className="flex min-h-screen flex-col bg-white">
        <PublicHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </PublicRoute>
  );
}
