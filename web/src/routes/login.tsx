import LoginPage from "@/pages/LoginPage";
import { PublicRoute } from "@/router/RouteGuards";
import { privatePageMeta } from "@/seo/page";

export const meta = () => [
  { title: "登录 | Fullstack Template" },
  ...privatePageMeta,
];

export default function LoginRoute() {
  return (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  );
}
