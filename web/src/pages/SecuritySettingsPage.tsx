import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { useState } from "react";
import { useNavigate } from "react-router";
import { userApi } from "@/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useAuthStore } from "@/store/authStore";
import { Input } from "./LoginPage";
import { SettingsPage } from "@/components/layout/SettingsPage";

export default function SecuritySettingsPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { error, pending, run } = useAsyncAction();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      await userApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      clearAuth();
      navigate(localizedPath("/login", locale));
    });
  }

  return (
    <SettingsPage title={t("security.title")} description={t("security.description")}>
      <form onSubmit={submit} className="panel max-w-2xl p-6">
        <div className="space-y-5">
          <Input
            label={t("security.currentPassword")}
            type="password"
            value={oldPassword}
            onChange={setOldPassword}
          />
          <Input
            label={t("security.newPassword")}
            type="password"
            value={newPassword}
            onChange={setNewPassword}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="mt-6 border-t pt-5">
          <button className="button-primary" disabled={pending}>
            {pending ? t("security.updating") : t("security.update")}
          </button>
        </div>
      </form>
    </SettingsPage>
  );
}
