import TenantMembersPage from "@/pages/TenantMembersPage";
import { ProtectedRoute } from "@/router/RouteGuards";
import { privatePageMeta } from "@/seo/page";

export const meta = () => privatePageMeta;

export default function TenantMembersRoute() {
  return (
    <ProtectedRoute>
      <TenantMembersPage />
    </ProtectedRoute>
  );
}
