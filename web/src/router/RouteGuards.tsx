import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { useEffect } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
// 恢复会话时一并填充租户 store，否则直接刷新 /tenant/* 页面会因为没有 activeTenant 而永远空白。
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { isAuthenticated, loading, loadSession } = useAuthStore();
  useEffect(() => {
    if (loading)
      void loadSession().then((auth) => {
        if (auth) useTenantStore.getState().hydrate(auth);
      });
  }, [loading, loadSession]);
  if (loading) return <div className="p-12 text-center">{t("actions.loading")}</div>;
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to={localizedPath("/login", locale)} replace />
  );
}
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { isAuthenticated, loading, loadSession } = useAuthStore();
  useEffect(() => {
    if (loading) void loadSession();
  }, [loading, loadSession]);
  if (loading) return <div className="p-12 text-center">{t("actions.loading")}</div>;
  return isAuthenticated ? (
    <Navigate to={localizedPath("/dashboard", locale)} replace />
  ) : (
    <>{children}</>
  );
}
