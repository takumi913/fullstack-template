import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useTranslation, useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useAuth } from "@/store/AppState";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";
import { AuthAgreement, AuthCard, Input } from "./LoginPage";

export default function RegisterPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  const copy = () => toolsmithPrivateCopy(locale());
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const { error, pending, run } = createAsyncAction();
  const auth = useAuth();
  const navigate = useNavigate();
  function submit(event: SubmitEvent) {
    event.preventDefault();
    const data = { email: email(), password: password() };
    const destination = localizedPath("/dashboard", locale());
    void run(async () => {
      await auth.register(data);
      navigate(destination);
    });
  }
  return (
    <AuthCard title={copy().authTitleReg} description={copy().authSubReg}>
      <form class="design-auth-form" onSubmit={submit}>
        <Input
          design
          label={copy().email}
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          value={email()}
          onChange={setEmail}
        />
        <Input
          design
          label={copy().password}
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          value={password()}
          onChange={setPassword}
        />
        {error() && (
          <p class="text-sm text-destructive" role="alert">
            {error()}
          </p>
        )}
        <button class="design-auth-submit" disabled={pending()}>
          {pending() ? t("common:actions.creating") : copy().submitReg}
        </button>
        <AuthAgreement />
      </form>
    </AuthCard>
  );
}
