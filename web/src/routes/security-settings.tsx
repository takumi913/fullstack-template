import SecuritySettingsPage from "@/pages/SecuritySettingsPage";
import { ProtectedRoute } from "@/router/RouteGuards";
import { privatePageMeta } from "@/seo/page";

export const meta = () => privatePageMeta;

export default function SecuritySettingsRoute() {
  return <ProtectedRoute><SecuritySettingsPage /></ProtectedRoute>;
}
