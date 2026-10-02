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
];

export default function Root() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const locale = resolveDocumentLocale(pathname);
  const hydrate = shouldHydrateDocument(
    pathname,
    matches.length,
    Boolean(siteConfig.homePrimaryToolSlug),
  );

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={templateSiteConfig.appearance.themeColor} />
        <Meta />
        <Links />
      </head>
      <body>
        <SiteI18nProvider key={locale} locale={locale}>
          <Outlet />
        </SiteI18nProvider>
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
