import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useMatches,
} from "react-router";
import type { LinksFunction } from "react-router";
import { ThemeProvider } from "next-themes";
import { templateSiteConfig } from "@/config/site-config";
import { shouldHydrateDocument } from "@/runtime/client-runtime";
import { resolveDocumentLocale } from "@/seo/document-locale";
import { publicAssetMimeType } from "@/seo/public-asset";
import { siteConfig } from "@/seo/site";
import { SiteI18nProvider } from "@/i18n/SiteI18nProvider";
import "./style.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: siteConfig.favicon, type: publicAssetMimeType(siteConfig.favicon) },
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;700&display=swap",
  },
];

export default function Root() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const locale = resolveDocumentLocale(pathname);
  const hydrate = shouldHydrateDocument(
    pathname,
    matches.length,
    Boolean(siteConfig.homePrimaryToolSlug),
    true,
  );

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={templateSiteConfig.appearance.themeColor} />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="toolsmith-theme"
        >
          <SiteI18nProvider key={locale} locale={locale}>
            <Outlet />
          </SiteI18nProvider>
        </ThemeProvider>
        {hydrate ? (
          <>
            <ScrollRestoration />
            <Scripts />
          </>
        ) : null}
      </body>
    </html>
  );
}
