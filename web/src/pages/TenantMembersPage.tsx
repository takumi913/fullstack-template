import { useEffect, useState } from "react";
import { tenantApi, type TenantRole } from "@/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useTenantStore } from "@/store/tenantStore";
import { SettingsPage } from "./ProfileSettingsPage";

export default function TenantMembersPage() {
  const { activeTenant, members, membership, loadMembers } = useTenantStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TenantRole>("member");
  const [loadError, setLoadError] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const { error, pending, run } = useAsyncAction();
  const activeTenantID = activeTenant?.id ?? null;
  // 依赖 id 而非对象：loadTenants 每次都会产出新对象，依赖对象会让本效果重复触发。
  useEffect(() => {
    let cancelled = false;
    loadMembers()
      .then(() => !cancelled && setLoadError(""))
      .catch((caught: Error) => !cancelled && setLoadError(caught.message))
      .finally(() => !cancelled && setLoadedFor(activeTenantID));
    // 切换工作区时丢弃上一次请求的结果，避免先发后到覆盖新数据。
    return () => {
      cancelled = true;
    };
  }, [activeTenantID, loadMembers]);
  // 由「已为当前工作区加载完成」推导，避免在效果里同步 setState。
  const loaded = loadedFor === activeTenantID;
  // 成员列表未加载完时不能认为有管理权限，否则会短暂显示越权的管理表单。
  const canManage = loaded && (membership?.role === "owner" || membership?.role === "admin");

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!activeTenant) return;
    void run(async () => {
      await tenantApi.addMember(activeTenant.id, { email, role });
      setEmail("");
      setRole("member");
      await loadMembers();
    });
  }

  function remove(userID: string) {
    if (!activeTenant) return;
    void run(async () => {
      await tenantApi.removeMember(activeTenant.id, userID);
      await loadMembers();
    });
  }

  return (
    <SettingsPage title="成员" description="查看工作区成员并管理他们的访问级别。">
      {canManage && (
        <form onSubmit={add} className="panel mb-6 flex flex-col gap-3 p-4 sm:flex-row">
          <input
            className="field flex-1"
            type="email"
            placeholder="已注册用户的邮箱"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <select
            className="field sm:w-36"
            value={role}
            onChange={(event) => setRole(event.target.value as TenantRole)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            {membership?.role === "owner" && <option value="owner">Owner</option>}
          </select>
          <button className="button-primary" disabled={pending}>
            {pending ? "处理中…" : "添加成员"}
          </button>
        </form>
      )}
      {(error || loadError) && <p className="mb-6 text-sm text-red-700">{error || loadError}</p>}
      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] border-b bg-zinc-50 px-5 py-3 text-xs font-medium text-zinc-500">
          <span>用户</span>
          <span>角色</span>
        </div>
        <div className="rule-list">
          {/* 加载中和「确实没有成员」必须区分开，否则两者看起来完全一样 */}
          {!loaded && <p className="px-5 py-4 text-sm text-zinc-500">加载中…</p>}
          {loaded && !loadError && members.length === 0 && (
            <p className="px-5 py-4 text-sm text-zinc-500">暂无成员</p>
          )}
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">{member.username}</p>
                <p className="mt-0.5 truncate text-sm text-zinc-500">{member.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium capitalize text-zinc-600">{member.role}</span>
                {canManage && member.user_id !== membership?.user_id && (
                  <button
                    className="text-xs text-zinc-400 hover:text-red-700 disabled:opacity-50"
                    disabled={pending}
                    onClick={() => remove(member.user_id)}
                  >
                    移除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsPage>
  );
}
