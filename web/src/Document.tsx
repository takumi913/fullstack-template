import { getRequestEvent, HydrationScript, isServer, type JSX } from "@solidjs/web";
import { resolveDocumentLocale } from "./seo/document-locale";
import { templateSiteConfig } from "./config/site-config";
import { siteConfig } from "./seo/site";
import { publicAssetMimeType } from "./seo/public-asset";
import { themeBootstrap } from "./components/layout/ThemeProvider";

export default function Document(props: { children?: JSX.Element }) {
  const pathname = isServer
    ? new URL(getRequestEvent()!.request.url).pathname
    : window.location.pathname;
  return (
    <html
      lang={resolveDocumentLocale(pathname)}
      data-theme={isServer ? "dark" : document.documentElement.dataset.theme}
      data-spa={pathname === "/__spa-fallback" ? "true" : undefined}
    >
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={templateSiteConfig.appearance.themeColor} />
        <link rel="icon" href={siteConfig.favicon} type={publicAssetMimeType(siteConfig.favicon)} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;700&display=swap"
        />
        <script>{themeBootstrap}</script>
        <HydrationScript />
        <script type="module" src="/src/entry-client.tsx" async />
      </head>
      <body>
        <div id="app">{props.children}</div>
      </body>
    </html>
  );
}
