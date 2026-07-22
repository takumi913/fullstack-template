import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { AuthCard, Input } from "./LoginPage";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const register = useAuthStore((state) => state.register);
  const loadTenants = useTenantStore((state) => state.loadTenants);
  const navigate = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try { await register({ username, email, password }); await loadTenants(); navigate("/dashboard"); }
    catch (caught) { setError((caught as Error).message); }
  }

  return <AuthCard title="创建账号" description="注册后会自动建立你的第一个工作区。"><form onSubmit={submit} className="space-y-4"><Input label="用户名" value={username} onChange={setUsername}/><Input label="邮箱" type="email" value={email} onChange={setEmail}/><Input label="密码" type="password" value={password} onChange={setPassword}/>{error && <p className="text-sm text-red-700">{error}</p>}<button className="button-primary mt-1 w-full">创建账号</button><p className="pt-2 text-center text-sm text-zinc-500">已有账号？ <Link className="font-medium text-zinc-900 hover:underline" to="/login">登录</Link></p></form></AuthCard>;
}
