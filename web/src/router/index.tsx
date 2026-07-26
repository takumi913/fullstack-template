import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProtectedRoute, PublicRoute } from "./RouteGuards";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ProfileSettingsPage from "@/pages/ProfileSettingsPage";
import SecuritySettingsPage from "@/pages/SecuritySettingsPage";
import TenantSettingsPage from "@/pages/TenantSettingsPage";
import TenantMembersPage from "@/pages/TenantMembersPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import ErrorPage from "@/pages/ErrorPage";
const protect = (node: React.ReactNode) => <ProtectedRoute>{node}</ProtectedRoute>;
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      { path: "dashboard", element: protect(<DashboardPage />) },
      { path: "settings/profile", element: protect(<ProfileSettingsPage />) },
      { path: "settings/security", element: protect(<SecuritySettingsPage />) },
      { path: "tenant/settings", element: protect(<TenantSettingsPage />) },
      { path: "tenant/members", element: protect(<TenantMembersPage />) },
      { path: "legal/privacy-policy", element: <PrivacyPage /> },
      { path: "legal/terms", element: <TermsPage /> },
    ],
  },
]);
