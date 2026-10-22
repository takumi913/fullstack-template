import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useTranslation, useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { userApi } from "@/api";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useAuth } from "@/store/AppState";
import { Input } from "./LoginPage";
import { SettingsPage } from "@/components/layout/SettingsPage";

export default function SecuritySettingsPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const { error, pending, run } = createAsyncAction();
  const navigate = useNavigate();
  const auth = useAuth();

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const data = { old_password: oldPassword(), new_password: newPassword() };
    const destination = localizedPath("/login", locale());
    void run(async () => {
      await userApi.changePassword(data);
      auth.clearAuth();
      navigate(destination);
    });
  }

  return (
    <SettingsPage title={t("security.title")} description={t("security.description")}>
      <form onSubmit={submit} class="panel max-w-2xl p-6">
        <div class="space-y-5">
          <Input
            label={t("security.currentPassword")}
            type="password"
            value={oldPassword()}
            onChange={setOldPassword}
          />
          <Input
            label={t("security.newPassword")}
            type="password"
            value={newPassword()}
            onChange={setNewPassword}
          />
          {error() && <p class="text-sm text-destructive">{error()}</p>}
        </div>
        <div class="mt-6 border-t pt-5">
          <button class="button-primary" disabled={pending()}>
            {pending() ? t("security.updating") : t("security.update")}
          </button>
        </div>
      </form>
    </SettingsPage>
  );
}
