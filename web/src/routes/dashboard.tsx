import DashboardPage from "@/pages/DashboardPage";
import { ProtectedRoute } from "@/router/RouteGuards";
import { privatePageMeta } from "@/seo/page";

export const meta = () => privatePageMeta;

export default function DashboardRoute() {
  return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
}
