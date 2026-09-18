import ProfileSettingsPage from "@/pages/ProfileSettingsPage";
import { ProtectedRoute } from "@/router/RouteGuards";
import { privatePageMeta } from "@/seo/page";

export const meta = () => privatePageMeta;

export default function ProfileSettingsRoute() {
  return <ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>;
}
