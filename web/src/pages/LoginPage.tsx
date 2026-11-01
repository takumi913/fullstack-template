import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useLocation, useNavigate } from "@solidjs/router";
import { useTranslation, useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useAuth } from "@/store/AppState";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";

export default function LoginPage() {
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
      await auth.login(data);
      navigate(destination);
    });
  }
  return (
    <AuthCard title={copy().authTitleLogin} description={copy().authSubLogin}>
      <form onSubmit={submit} class="design-auth-form">
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
          label={
            <span>
              {copy().password}
              <a href="#" onClick={(event) => event.preventDefault()}>
                {copy().forgot}
              </a>
            </span>
          }
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          value={password()}
          onChange={setPassword}
        />
        {error() && (
          <p class="text-sm text-destructive" role="alert">
            {error()}
          </p>
        )}
        <button class="design-auth-submit" disabled={pending()}>
          {pending() ? t("auth.loggingIn") : copy().submitLogin}
        </button>
        <AuthAgreement />
      </form>
    </AuthCard>
  );
}

export function AuthCard(props: { title: string; description?: string; children: JSX.Element }) {
  const locale = useLocale();
  const copy = () => toolsmithPrivateCopy(locale());
  const location = useLocation();
  return (
    <div class="design-auth-card">
      <nav class="design-auth-tabs">
        <a
          class={[
            "design-auth-tab",
            { active: location.pathname === localizedPath("/login", locale()) },
          ]}
          aria-current={
            location.pathname === localizedPath("/login", locale()) ? "page" : undefined
          }
          href={localizedPath("/login", locale())}
        >
          {copy().loginTab}
        </a>
        <a
          class={[
            "design-auth-tab",
            { active: location.pathname === localizedPath("/register", locale()) },
          ]}
          aria-current={
            location.pathname === localizedPath("/register", locale()) ? "page" : undefined
          }
          href={localizedPath("/register", locale())}
        >
          {copy().registerTab}
        </a>
      </nav>
      <h1>{props.title}</h1>
      {props.description && <p class="design-auth-subtitle">{props.description}</p>}
      {props.children}
    </div>
  );
}

export function AuthAgreement() {
  const locale = useLocale();
  const terms = () => (locale() === "en" ? "Terms of Service" : "服务条款");
  const privacy = () => (locale() === "en" ? "Privacy Policy" : "隐私政策");
  const agreement = () => {
    const [beforeTerms, afterTerms] = toolsmithPrivateCopy(locale()).agree.split(terms());
    const [between, afterPrivacy] = afterTerms.split(privacy());
    return { beforeTerms, between, afterPrivacy };
  };
  return (
    <p class="design-auth-agreement">
      {agreement().beforeTerms}
      <a href={localizedPath("/legal/terms", locale())}>{terms()}</a>
      {agreement().between}
      <a href={localizedPath("/legal/privacy-policy", locale())}>{privacy()}</a>
      {agreement().afterPrivacy}
    </p>
  );
}

export function Input(props: {
  label: JSX.Element;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  design?: boolean;
}) {
  return (
    <label class={props.design ? "design-auth-label" : "block text-sm font-medium text-foreground"}>
      {props.label}
      <input
        class={props.design ? "design-auth-input" : "field mt-2"}
        type={props.type ?? "text"}
        value={props.value}
        onInput={(event) => props.onChange(event.currentTarget.value)}
        required={props.required ?? true}
        autocomplete={props.autoComplete}
        placeholder={props.placeholder}
      />
    </label>
  );
}
