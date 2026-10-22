import { createEffect, onSettled, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useNavigate } from "@solidjs/router";
import { useTranslation, useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { useAuth, useTenant } from "@/store/AppState";

export function ProtectedRoute(props: { children: JSX.Element }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const auth = useAuth();
  const tenant = useTenant();
  const navigate = useNavigate();
  onSettled(() => {
    if (auth.state.loading)
      void auth.loadSession().then((session) => {
        // 直接刷新租户页面时，会话响应同时恢复当前工作区。
        if (session) tenant.hydrate(session);
      });
  });
  createEffect(
    () => ({
      loading: auth.state.loading,
      authenticated: auth.state.isAuthenticated,
      locale: locale(),
    }),
    (state) => {
      if (!state.loading && !state.authenticated)
        navigate(localizedPath("/login", state.locale), { replace: true });
    },
  );
  return (
    <Show
      when={!auth.state.loading && auth.state.isAuthenticated}
      fallback={
        <Show when={auth.state.loading}>
          <div class="p-12 text-center">{t("actions.loading")}</div>
        </Show>
      }
    >
      {props.children}
    </Show>
  );
}

export function PublicRoute(props: { children: JSX.Element }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const auth = useAuth();
  const navigate = useNavigate();
  onSettled(() => {
    if (auth.state.loading) void auth.loadSession();
  });
  createEffect(
    () => ({
      loading: auth.state.loading,
      authenticated: auth.state.isAuthenticated,
      locale: locale(),
    }),
    (state) => {
      if (!state.loading && state.authenticated)
        navigate(localizedPath("/dashboard", state.locale), { replace: true });
    },
  );
  return (
    <Show
      when={!auth.state.loading && !auth.state.isAuthenticated}
      fallback={
        <Show when={auth.state.loading}>
          <div class="p-12 text-center">{t("actions.loading")}</div>
        </Show>
      }
    >
      {props.children}
    </Show>
  );
}
