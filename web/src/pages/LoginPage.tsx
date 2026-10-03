import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";

export default function LoginPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale(),
    copy = toolsmithPrivateCopy(locale);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const { error, pending, run } = useAsyncAction();
  const login = useAuthStore((state) => state.login),
    hydrate = useTenantStore((state) => state.hydrate);
  const navigate = useNavigate();
  function submit(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      hydrate(await login({ email, password }));
      navigate(localizedPath("/tenant/members", locale));
    });
  }
  return (
    <AuthCard title={copy.authTitleLogin} description={copy.authSubLogin}>
      <form onSubmit={submit} className="design-auth-form">
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
          label={
            <span>
              {copy.password}
              <a href="#" onClick={(event) => event.preventDefault()}>
                {copy.forgot}
              </a>
            </span>
          }
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <button className="design-auth-submit" disabled={pending}>
          {pending ? t("auth.loggingIn") : copy.submitLogin}
        </button>
        <AuthAgreement />
      </form>
    </AuthCard>
  );
}
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const locale = useLocale(),
    copy = toolsmithPrivateCopy(locale);
  return (
    <div className="design-auth-card">
      <nav className="design-auth-tabs">
        <NavLink className="design-auth-tab" to={localizedPath("/login", locale)}>
          {copy.loginTab}
        </NavLink>
        <NavLink className="design-auth-tab" to={localizedPath("/register", locale)}>
          {copy.registerTab}
        </NavLink>
      </nav>
      <h1>{title}</h1>
      {description && <p className="design-auth-subtitle">{description}</p>}
      {children}
    </div>
  );
}
export function AuthAgreement() {
  const locale = useLocale(),
    copy = toolsmithPrivateCopy(locale);
  const terms = locale === "en" ? "Terms of Service" : "服务条款",
    privacy = locale === "en" ? "Privacy Policy" : "隐私政策";
  const [beforeTerms, afterTerms] = copy.agree.split(terms),
    [between, afterPrivacy] = afterTerms.split(privacy);
  return (
    <p className="design-auth-agreement">
      {beforeTerms}
      <Link to={localizedPath("/legal/terms", locale)}>{terms}</Link>
      {between}
      <Link to={localizedPath("/legal/privacy-policy", locale)}>{privacy}</Link>
      {afterPrivacy}
    </p>
  );
}
export function Input({
  label,
  type = "text",
  value,
  onChange,
  required = true,
  autoComplete,
  placeholder,
  design = false,
}: {
  label: ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  design?: boolean;
}) {
  return (
    <label className={design ? "design-auth-label" : "block text-sm font-medium text-foreground"}>
      {label}
      <input
        className={design ? "design-auth-input" : "field mt-2"}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
    </label>
  );
}
