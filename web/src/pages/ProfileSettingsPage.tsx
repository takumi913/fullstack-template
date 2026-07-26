import { useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Input } from "./LoginPage";

export default function ProfileSettingsPage() {
  const user = useAuthStore((state) => state.user)!;
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar_url);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    try { const response = await userApi.updateProfile({ username, email, avatar_url: avatar }); setUser(response.data); setSaved(true); }
    catch (caught) { setError((caught as Error).message); }
  }

  return <SettingsPage title="个人资料" description="这些信息会显示在你加入的工作区中。"><form onSubmit={submit} className="panel max-w-2xl p-6"><div className="space-y-5"><Input label="用户名" value={username} onChange={setUsername}/><Input label="邮箱" type="email" value={email} onChange={setEmail}/><Input label="头像 URL" value={avatar} onChange={setAvatar} required={false}/>{error && <p className="text-sm text-red-700">{error}</p>}</div><div className="mt-6 flex items-center gap-3 border-t pt-5"><button className="button-primary">保存更改</button>{saved && <span className="text-sm text-zinc-500">已保存</span>}</div></form></SettingsPage>;
}

export function SettingsPage({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <div className="shell py-12 sm:py-16"><div className="mb-9 flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-[-0.025em]">{title}</h1>{description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}</div><div className="flex gap-4 text-sm"><Link className="text-zinc-500 hover:text-zinc-950" to="/dashboard">Dashboard</Link><Link className="text-zinc-500 hover:text-zinc-950" to="/settings/security">安全</Link></div></div>{children}</div>;
}
