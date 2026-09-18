import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  layout("./routes/site-layout.tsx", [
    index("./routes/home.tsx"),
    route("tools", "./routes/tools-index.tsx"),
    route("tools/:slug", "./routes/tool.tsx"),
    route("404", "./routes/not-found.tsx"),

    route("legal/privacy-policy", "./routes/privacy.tsx"),
    route("legal/terms", "./routes/terms.tsx"),

    route("login", "./routes/login.tsx"),
    route("register", "./routes/register.tsx"),

    route("dashboard", "./routes/dashboard.tsx"),
    route("settings/profile", "./routes/profile-settings.tsx"),
    route("settings/security", "./routes/security-settings.tsx"),
    route("tenant/settings", "./routes/tenant-settings.tsx"),
    route("tenant/members", "./routes/tenant-members.tsx"),
  ]),
] satisfies RouteConfig;
