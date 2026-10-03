import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";
import { AuthAgreement, AuthCard, Input } from "./LoginPage";

export default function RegisterPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale(),
    copy = toolsmithPrivateCopy(locale);
  const [username, setUsername] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const { error, pending, run } = useAsyncAction();
  const register = useAuthStore((state) => state.register),
    hydrate = useTenantStore((state) => state.hydrate);
  const navigate = useNavigate();
  function submit(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      hydrate(await register({ username, email, password }));
      navigate(localizedPath("/tenant/members", locale));
    });
  }
  return (
    <AuthCard title={copy.authTitleReg} description={copy.authSubReg}>
      <form className="design-auth-form" onSubmit={submit}>
        <Input
          design
          label={copy.name}
          placeholder="Lin Zhixia"
          autoComplete="username"
          value={username}
          onChange={setUsername}
        />
        <Input
          design
          label={copy.email}
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <Input
          design
          label={copy.password}
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <button className="design-auth-submit" disabled={pending}>
          {pending ? t("common:actions.creating") : copy.submitReg}
        </button>
        <AuthAgreement />
      </form>
    </AuthCard>
  );
}
