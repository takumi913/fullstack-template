import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { AuthCard, Input } from "./LoginPage";

export default function RegisterPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, pending, run } = useAsyncAction();
  const register = useAuthStore((state) => state.register);
  const hydrate = useTenantStore((state) => state.hydrate);
  const navigate = useNavigate();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      hydrate(await register({ username, email, password }));
      navigate(localizedPath("/dashboard", locale));
    });
  }

  return (
    <AuthCard title={t("auth.registerTitle")} description={t("auth.registerDescription")}>
      <form onSubmit={submit} className="space-y-4">
        <Input label={t("common:fields.username")} value={username} onChange={setUsername} />
        <Input label={t("common:fields.email")} type="email" value={email} onChange={setEmail} />
        <Input
          label={t("common:fields.password")}
          type="password"
          value={password}
          onChange={setPassword}
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="button-primary mt-1 w-full" disabled={pending}>
          {pending ? t("common:actions.creating") : t("auth.registerTitle")}
        </button>
        <p className="pt-2 text-center text-sm text-zinc-500">
          {t("auth.hasAccount")}
          <Link
            className="font-medium text-zinc-900 hover:underline"
            to={localizedPath("/login", locale)}
          >
            {t("common:navigation.login")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
