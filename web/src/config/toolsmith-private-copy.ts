import type { SiteLocale } from "../i18n/locales";

const en = {
  loginTab: "Log in",
  registerTab: "Sign up",
  authTitleLogin: "Welcome back",
  authTitleReg: "Create your account",
  authSubLogin: "Log in with your email and password.",
  authSubReg: "A username is created from your email. You can change it later in profile settings.",
  email: "Email",
  password: "Password",
  forgot: "Forgot password?",
  submitLogin: "Log in",
  submitReg: "Create account",
  agree: "By continuing you agree to our Terms of Service and Privacy Policy.",
  brandLine: "One account for one person.",
  brandPts: [
    "Email and password sign-in, secure sessions",
    "A username generated from your email",
    "Change your profile any time after signing up",
  ],
  nav: ["Overview", "Profile", "Security"],
  signOut: "Sign out",
};
const zh = {
  loginTab: "登录",
  registerTab: "注册",
  authTitleLogin: "欢迎回来",
  authTitleReg: "创建你的账号",
  authSubLogin: "使用邮箱和密码登录。",
  authSubReg: "注册时会根据邮箱生成用户名，之后可在个人资料中修改。",
  email: "邮箱",
  password: "密码",
  forgot: "忘记密码？",
  submitLogin: "登录",
  submitReg: "创建账号",
  agree: "继续即表示你同意我们的服务条款和隐私政策。",
  brandLine: "一个账号，只属于一个人。",
  brandPts: ["邮箱密码登录，会话安全存储", "用户名根据邮箱自动生成", "注册后可随时修改个人资料"],
  nav: ["概览", "个人资料", "账号安全"],
  signOut: "退出",
} satisfies typeof en;
export const toolsmithPrivateCopies = { en, "zh-CN": zh };
export function toolsmithPrivateCopy(locale: SiteLocale) {
  return toolsmithPrivateCopies[locale];
}
