import { useEffect, useState } from "react";
import { tenantApi, type TenantRole } from "@/api";
import { useTenantStore } from "@/store/tenantStore";
import { SettingsPage } from "./ProfileSettingsPage";

export default function TenantMembersPage() {
  const { activeTenant, members, membership, loadMembers } = useTenantStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TenantRole>("member");
  const [error, setError] = useState("");
  useEffect(() => { void loadMembers(); }, [activeTenant, loadMembers]);
  const canManage = membership?.role === "owner" || membership?.role === "admin";

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!activeTenant) return;
    setError("");
    try { await tenantApi.addMember(activeTenant.id, { email, role }); setEmail(""); await loadMembers(); }
    catch (caught) { setError((caught as Error).message); }
  }

  async function remove(userID: string) {
    if (!activeTenant) return;
    setError("");
    try { await tenantApi.removeMember(activeTenant.id, userID); await loadMembers(); }
    catch (caught) { setError((caught as Error).message); }
  }

  return <SettingsPage title="成员" description="查看工作区成员并管理他们的访问级别。">{canManage && <form onSubmit={add} className="panel mb-6 flex flex-col gap-3 p-4 sm:flex-row"><input className="field flex-1" type="email" placeholder="已注册用户的邮箱" value={email} onChange={(event) => setEmail(event.target.value)} required/><select className="field sm:w-36" value={role} onChange={(event) => setRole(event.target.value as TenantRole)}><option value="member">Member</option><option value="admin">Admin</option>{membership?.role === "owner" && <option value="owner">Owner</option>}</select><button className="button-primary">添加成员</button></form>}{error && <p className="mb-6 text-sm text-red-700">{error}</p>}<div className="panel overflow-hidden"><div className="grid grid-cols-[1fr_auto] border-b bg-zinc-50 px-5 py-3 text-xs font-medium text-zinc-500"><span>用户</span><span>角色</span></div><div className="rule-list">{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-900">{member.username}</p><p className="mt-0.5 truncate text-sm text-zinc-500">{member.email}</p></div><div className="flex items-center gap-4"><span className="text-xs font-medium capitalize text-zinc-600">{member.role}</span>{canManage && member.user_id !== membership?.user_id && <button className="text-xs text-zinc-400 hover:text-red-700" onClick={() => void remove(member.user_id)}>移除</button>}</div></div>)}</div></div></SettingsPage>;
}
