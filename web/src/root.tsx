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
import { siteConfig } from "@/seo/site";
import "./style.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: siteConfig.favicon, type: "image/svg+xml" },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

export default function Root() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const locale = resolveDocumentLocale(pathname);
  const hydrate = shouldHydrateDocument(
    pathname,
    matches.length,
    Boolean(templateSiteConfig.home.primaryToolSlug),
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
        <Outlet />
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
