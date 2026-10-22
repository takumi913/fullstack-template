import { createEffect, Errored, Loading } from "solid-js";
import { getRequestEvent, isServer, useHead, type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import { Router } from "./routes";
import { SiteI18nProvider, useTranslation } from "./i18n/context";
import { localeFromPath } from "./i18n/locales";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import ErrorPage from "./pages/ErrorPage";
import "./style.css";

function SiteShell(props: { children?: JSX.Element }) {
  const location = useLocation();
  const locale = () => localeFromPath(location.pathname);
  createEffect(locale, (value) => {
    document.documentElement.lang = value;
  });
  return (
    <SiteI18nProvider locale={locale()}>
      <ThemeProvider>
        <Errored fallback={(error) => <ErrorPage error={error()} />}>
          <Loading fallback={<PageLoading />}>{props.children}</Loading>
        </Errored>
      </ThemeProvider>
    </SiteI18nProvider>
  );
}

function PageLoading() {
  const { t } = useTranslation();
  return (
    <div class="shell py-20" role="status">
      {t("actions.loading")}
    </div>
  );
}

function PrivateAppShell() {
  useHead({ tag: "meta", props: { name: "robots", content: "noindex, nofollow" } });
  return null;
}

export default function App() {
  // Private routes share an empty static document and mount their own client state.
  return (
    <>
      {isServer && new URL(getRequestEvent()!.request.url).pathname === "/__spa-fallback" ? (
        <PrivateAppShell />
      ) : (
        <Router>{(props) => <SiteShell>{props.children}</SiteShell>}</Router>
      )}
    </>
  );
}
