import { lazy, type Component } from "solid-js";
import { createRouter } from "@solidjs/router";
import { localizedPath, supportedLocales } from "./i18n/locales";

const publicPages = [
  ["/", lazy(() => import("./routes/home"))],
  ["/tools", lazy(() => import("./routes/tools-index"))],
  ["/resources", lazy(() => import("./routes/resources"))],
  ["/pricing", lazy(() => import("./routes/pricing"))],
  ["/tools/:slug", lazy(() => import("./routes/tool"))],
  ["/use-cases/:slug", lazy(() => import("./routes/use-case"))],
  ["/compare/:slug", lazy(() => import("./routes/comparison"))],
  ["/guides/:slug", lazy(() => import("./routes/guide"))],
  ["/legal/privacy-policy", lazy(() => import("./routes/privacy"))],
  ["/legal/terms", lazy(() => import("./routes/terms"))],
] as const;
const authPages = [
  ["/login", lazy(() => import("./routes/login"))],
  ["/register", lazy(() => import("./routes/register"))],
] as const;
const privatePages = [
  ["/dashboard", lazy(() => import("./routes/dashboard"))],
  ["/settings/profile", lazy(() => import("./routes/profile-settings"))],
  ["/settings/security", lazy(() => import("./routes/security-settings"))],
  ["/tenant/settings", lazy(() => import("./routes/tenant-settings"))],
  ["/tenant/members", lazy(() => import("./routes/tenant-members"))],
] as const;
const localized = (pages: readonly (readonly [string, Component])[]) =>
  supportedLocales.flatMap((locale) =>
    pages.map(([path, component]) => ({
      path: localizedPath(path, locale),
      component,
    })),
  );

export const Router = createRouter({
  routes: [
    {
      component: lazy(() => import("./routes/public-layout")),
      children: [
        ...localized(publicPages),
        { path: "*404", component: lazy(() => import("./routes/not-found")) },
      ],
    },
    {
      component: lazy(() => import("./routes/private-layout")),
      children: [
        { component: lazy(() => import("./routes/auth-layout")), children: localized(authPages) },
        { component: lazy(() => import("./routes/app-layout")), children: localized(privatePages) },
      ],
    },
  ],
});
