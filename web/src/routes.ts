import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("./routes/public-layout.tsx", [
    index("./routes/home.tsx"),
    route("tools", "./routes/tools-index.tsx"),
    route("resources", "./routes/resources.tsx"),
    route("tools/:slug", "./routes/tool.tsx"),
    route(":locale/tools/:slug", "./routes/localized-tool.tsx"),
    route("use-cases/:slug", "./routes/use-case.tsx"),
    route("compare/:slug", "./routes/comparison.tsx"),
    route("guides/:slug", "./routes/guide.tsx"),
    route(":locale/use-cases/:slug", "./routes/localized-use-case.tsx"),
    route(":locale/compare/:slug", "./routes/localized-comparison.tsx"),
    route(":locale/guides/:slug", "./routes/localized-guide.tsx"),
    route("404", "./routes/not-found.tsx"),
    route("legal/privacy-policy", "./routes/privacy.tsx"),
    route("legal/terms", "./routes/terms.tsx"),
  ]),

  layout("./routes/auth-layout.tsx", [
    route("login", "./routes/login.tsx"),
    route("register", "./routes/register.tsx"),
  ]),

  layout("./routes/app-layout.tsx", [
    route("dashboard", "./routes/dashboard.tsx"),
    route("settings/profile", "./routes/profile-settings.tsx"),
    route("settings/security", "./routes/security-settings.tsx"),
    route("tenant/settings", "./routes/tenant-settings.tsx"),
    route("tenant/members", "./routes/tenant-members.tsx"),
  ]),
] satisfies RouteConfig;
