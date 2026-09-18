import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/router/RouteGuards";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-white">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
