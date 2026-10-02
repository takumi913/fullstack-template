import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";
import { localizedPath, supportedLocales } from "./i18n/locales";

const publicRoutes = [
  ["/tools", "tools-index"],
  ["/resources", "resources"],
  ["/tools/:slug", "tool"],
  ["/use-cases/:slug", "use-case"],
  ["/compare/:slug", "comparison"],
  ["/guides/:slug", "guide"],
  ["/legal/privacy-policy", "privacy"],
  ["/legal/terms", "terms"],
] as const;
const authRoutes = [
  ["/login", "login"],
  ["/register", "register"],
] as const;
const appRoutes = [
  ["/dashboard", "dashboard"],
  ["/settings/profile", "profile-settings"],
  ["/settings/security", "security-settings"],
  ["/tenant/settings", "tenant-settings"],
  ["/tenant/members", "tenant-members"],
] as const;

export default supportedLocales.flatMap((locale) => {
  const localizedRoutes = (routes: readonly (readonly [string, string])[]) =>
    routes.map(([path, module]) =>
      route(localizedPath(path, locale).slice(1), `./routes/${module}.tsx`, {
        id: `${module}-${locale}`,
      }),
    );
  return [
    layout("./routes/public-layout.tsx", { id: `public-${locale}` }, [
      locale === "en"
        ? index("./routes/home.tsx", { id: `home-${locale}` })
        : route(localizedPath("/", locale).slice(1), "./routes/home.tsx", { id: `home-${locale}` }),
      ...localizedRoutes(publicRoutes),
      ...(locale === "en" ? [route("404", "./routes/not-found.tsx")] : []),
    ]),
    layout("./routes/auth-layout.tsx", { id: `auth-${locale}` }, localizedRoutes(authRoutes)),
    layout("./routes/app-layout.tsx", { id: `app-${locale}` }, localizedRoutes(appRoutes)),
  ];
}) satisfies RouteConfig;
