import { createSignal, untrack } from "solid-js";
import { SettingsPage } from "@/components/layout/SettingsPage";
import { useTranslation } from "@/i18n/context";
import { userApi } from "@/api";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useAuth } from "@/store/AppState";
import { Input } from "./LoginPage";

export default function ProfileSettingsPage() {
  const { t } = useTranslation(["app", "common"]);
  const auth = useAuth();
  // 表单编辑独立于后台状态更新，初始化时只取一次当前用户。
  const user = untrack(() => ({ ...auth.state.user! }));
  const [username, setUsername] = createSignal(user.username);
  const [email, setEmail] = createSignal(user.email);
  const [avatar, setAvatar] = createSignal(user.avatar_url);
  const [saved, setSaved] = createSignal(false);
  const { error, pending, run } = createAsyncAction();

  function submit(event: SubmitEvent) {
    event.preventDefault();
    setSaved(false);
    const data = { username: username(), email: email(), avatar_url: avatar() };
    void run(async () => {
      const response = await userApi.updateProfile(data);
      auth.setUser(response.data);
      setSaved(true);
    });
  }

  return (
    <SettingsPage title={t("profile.title")} description={t("profile.description")}>
      <form onSubmit={submit} class="panel max-w-2xl p-6">
        <div class="space-y-5">
          <Input label={t("common:fields.username")} value={username()} onChange={setUsername} />
          <Input
            label={t("common:fields.email")}
            type="email"
            value={email()}
            onChange={setEmail}
          />
          <Input
            label={t("common:fields.avatar")}
            value={avatar()}
            onChange={setAvatar}
            required={false}
          />
          {error() && <p class="text-sm text-destructive">{error()}</p>}
        </div>
        <div class="mt-6 flex items-center gap-3 border-t pt-5">
          <button class="button-primary" disabled={pending()}>
            {pending() ? t("common:actions.saving") : t("common:actions.save")}
          </button>
          {saved() && (
            <span class="text-sm text-muted-foreground">{t("common:actions.saved")}</span>
          )}
        </div>
      </form>
    </SettingsPage>
  );
}
