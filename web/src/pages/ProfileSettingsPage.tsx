import { SettingsPage } from "@/components/layout/SettingsPage";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { userApi } from "@/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useAuthStore } from "@/store/authStore";
import { Input } from "./LoginPage";

export default function ProfileSettingsPage() {
  const { t } = useTranslation(["app", "common"]);
  const user = useAuthStore((state) => state.user)!;
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar_url);
  const [saved, setSaved] = useState(false);
  const { error, pending, run } = useAsyncAction();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    void run(async () => {
      const response = await userApi.updateProfile({ username, email, avatar_url: avatar });
      setUser(response.data);
      setSaved(true);
    });
  }

  return (
    <SettingsPage title={t("profile.title")} description={t("profile.description")}>
      <form onSubmit={submit} className="panel max-w-2xl p-6">
        <div className="space-y-5">
          <Input label={t("common:fields.username")} value={username} onChange={setUsername} />
          <Input label={t("common:fields.email")} type="email" value={email} onChange={setEmail} />
          <Input
            label={t("common:fields.avatar")}
            value={avatar}
            onChange={setAvatar}
            required={false}
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
        <div className="mt-6 flex items-center gap-3 border-t pt-5">
          <button className="button-primary" disabled={pending}>
            {pending ? t("common:actions.saving") : t("common:actions.save")}
          </button>
          {saved && <span className="text-sm text-zinc-500">{t("common:actions.saved")}</span>}
        </div>
      </form>
    </SettingsPage>
  );
}
