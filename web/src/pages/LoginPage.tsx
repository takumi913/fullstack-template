import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const loadTenants = useTenantStore((state) => state.loadTenants);
  const navigate = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try { await login({ email, password }); await loadTenants(); navigate("/dashboard"); }
    catch (caught) { setError((caught as Error).message); }
  }

  return <AuthCard title="欢迎回来" description="使用你的工作邮箱继续。"><form onSubmit={submit} className="space-y-4"><Input label="邮箱" type="email" value={email} onChange={setEmail}/><Input label="密码" type="password" value={password} onChange={setPassword}/>{error && <p className="text-sm text-red-700">{error}</p>}<button className="button-primary mt-1 w-full">登录</button><p className="pt-2 text-center text-sm text-zinc-500">还没有账号？ <Link className="font-medium text-zinc-900 hover:underline" to="/register">创建账号</Link></p></form></AuthCard>;
}

export function AuthCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <div className="grid min-h-[calc(100vh-113px)] place-items-center bg-zinc-50 px-5 py-16"><div className="w-full max-w-[400px]"><div className="mb-8 text-center"><h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-950">{title}</h1>{description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}</div><div className="panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">{children}</div></div></div>;
}

export function Input({ label, type = "text", value, onChange, required = true }: { label: string; type?: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="block text-sm font-medium text-zinc-700">{label}<input className="field mt-2" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required}/></label>;
}
