import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import type { LinksFunction } from "react-router";
import { resolveDocumentLocale } from "@/seo/document-locale";
import "./style.css";

export const links: LinksFunction = () => [{ rel: "icon", href: "/favicon.ico" }];

export default function Root() {
  const { pathname } = useLocation();
  const locale = resolveDocumentLocale(pathname);

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
