import { PrivateI18nProvider } from "@/i18n/PrivateI18nProvider";
import { Outlet } from "react-router";
import { PublicRoute } from "@/router/RouteGuards";
import { Footer } from "./Footer";
import { PublicHeader } from "./PublicHeader";

export function AuthLayout() {
  return (
    <PrivateI18nProvider>
      <PublicRoute>
        <div className="flex min-h-screen flex-col bg-white">
          <PublicHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </PublicRoute>
    </PrivateI18nProvider>
  );
}
