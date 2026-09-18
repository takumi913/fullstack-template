import LoginPage from "@/pages/LoginPage";
import { privatePageMeta } from "@/seo/page";

export const meta = () => [
  { title: "登录 | Fullstack Template" },
  ...privatePageMeta,
];

export default LoginPage;
