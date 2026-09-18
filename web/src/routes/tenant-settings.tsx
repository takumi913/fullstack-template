import TenantSettingsPage from "@/pages/TenantSettingsPage";
import { ProtectedRoute } from "@/router/RouteGuards";
import { privatePageMeta } from "@/seo/page";

export const meta = () => privatePageMeta;

export default function TenantSettingsRoute() {
  return <ProtectedRoute><TenantSettingsPage /></ProtectedRoute>;
}
