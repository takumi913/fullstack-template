import RegisterPage from "@/pages/RegisterPage";
import { PublicRoute } from "@/router/RouteGuards";
import { privatePageMeta } from "@/seo/page";

export const meta = () => [
  { title: "注册 | Fullstack Template" },
  ...privatePageMeta,
];

export default function RegisterRoute() {
  return (
    <PublicRoute>
      <RegisterPage />
    </PublicRoute>
  );
}
