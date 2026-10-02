import { PrivateI18nProvider } from "@/i18n/PrivateI18nProvider";
import { Outlet } from "react-router";
import { ProtectedRoute } from "@/router/RouteGuards";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <PrivateI18nProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col bg-white">
          <AppHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    </PrivateI18nProvider>
  );
}
