import { useTranslation } from "react-i18next";
import { useEffect, useState, type CSSProperties } from "react";
import { tenantApi, type TenantRole } from "@/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";

const roleMatrix = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
];

export default function TenantMembersPage() {
  const { t } = useTranslation(["app", "common"]);
  const copy = toolsmithPrivateCopy(useLocale());
  const activeTenant = useTenantStore((state) => state.activeTenant),
    members = useTenantStore((state) => state.members),
    membership = useTenantStore((state) => state.membership),
    loadMembers = useTenantStore((state) => state.loadMembers);
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState(""),
    [role, setRole] = useState<TenantRole>("member");
  const [loadError, setLoadError] = useState(""),
    [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string } | null>(null);
  const { error, pending, run } = useAsyncAction();
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2200);
    return () => clearTimeout(timer);
  }, [notice]);
  const tenantID = activeTenant?.id ?? null;
  useEffect(() => {
    let cancelled = false;
    loadMembers()
      .then(() => !cancelled && setLoadError(""))
      .catch((caught: Error) => !cancelled && setLoadError(caught.message))
      .finally(() => !cancelled && setLoadedFor(tenantID));
    return () => {
      cancelled = true;
    };
  }, [tenantID, loadMembers]);
  const loaded = loadedFor === tenantID;
  const canManage = loaded && (membership?.role === "owner" || membership?.role === "admin");
  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!activeTenant) return;
    void run(async () => {
      await tenantApi.addMember(activeTenant.id, { email, role });
      setEmail("");
      setRole("member");
      await loadMembers();
    }).then((ok) => {
      if (ok) setNotice({ message: t("members.added") });
    });
  }
  function remove(userID: string) {
    if (!activeTenant) return;
    void run(async () => {
      await tenantApi.removeMember(activeTenant.id, userID);
      await loadMembers();
    }).then((ok) => {
      if (ok) setNotice({ message: copy.removed });
    });
  }
  function updateRole(userID: string, next: TenantRole) {
    if (!activeTenant) return;
    void run(async () => {
      await tenantApi.updateMember(activeTenant.id, userID, next);
      await loadMembers();
    }).then((ok) => {
      if (ok) setNotice({ message: copy.roleChanged });
    });
  }
  return (
    <>
      <div className="design-members-heading">
        <div>
          <div className="design-members-crumb">
            {activeTenant?.name} / {copy.wsMembers}
          </div>
          <h1>{copy.wsMembers}</h1>
          <p>{copy.wsMembersSub}</p>
        </div>
      </div>
      {canManage && (
        <form className="design-invite-form" onSubmit={add}>
          <input
            className="design-invite-input"
            type="email"
            aria-label={copy.email}
            placeholder={copy.invitePh}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <select
            className="design-invite-role"
            value={role}
            aria-label={copy.colRole}
            onChange={(event) => setRole(event.target.value as TenantRole)}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <button className="design-invite-submit" disabled={pending}>
            {pending ? t("common:actions.processing") : copy.invite}
          </button>
        </form>
      )}
      {(error || loadError) && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error || loadError}
        </p>
      )}
      <div className="design-members-table">
        <div className="design-members-table-inner">
          <div className="design-members-columns header">
            <span>{copy.colMember}</span>
            <span>{copy.colRole}</span>
            <span>{copy.colJoined}</span>
            <span />
          </div>
          {!loaded && (
            <p className="px-5 py-4 text-sm text-muted-foreground">{t("common:actions.loading")}</p>
          )}
          {loaded && !loadError && !members.length && (
            <p className="px-5 py-4 text-sm text-muted-foreground">{t("members.empty")}</p>
          )}
          {members.map((member, index) => (
            <div className="design-members-columns design-member-row" key={member.id}>
              <div className="design-member-identity">
                <span
                  className="design-member-avatar"
                  style={
                    { "--avatar-color": `var(--color-avatar-${(index % 5) + 1})` } as CSSProperties
                  }
                >
                  {member.username.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="design-member-name">
                    {member.username}
                    {member.user_id === user?.id && (
                      <span className="design-member-tag">{copy.you}</span>
                    )}
                  </div>
                  <div className="design-member-email">{member.email}</div>
                </div>
              </div>
              <div>
                {member.role === "owner" ? (
                  <span className="design-owner-badge">Owner</span>
                ) : canManage ? (
                  <select
                    className="design-member-role"
                    value={member.role}
                    aria-label={`${member.username} ${copy.colRole}`}
                    disabled={pending}
                    onChange={(event) =>
                      updateRole(member.user_id, event.target.value as TenantRole)
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span className="capitalize text-sm">{member.role}</span>
                )}
              </div>
              <span className="design-member-joined">{member.created_at.slice(0, 10)}</span>
              <div className="text-right">
                {canManage && member.role !== "owner" && member.user_id !== membership?.user_id && (
                  <button
                    type="button"
                    className="design-member-remove"
                    disabled={pending}
                    onClick={() => remove(member.user_id)}
                  >
                    {copy.remove}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {notice && (
        <div className="design-success-notice" role="status">
          <div>{notice.message}</div>
        </div>
      )}
      <div className="design-role-matrix">
        <h2>{copy.matrixTitle}</h2>
        <p>{copy.matrixSub}</p>
        <div className="design-role-table">
          <div className="design-role-grid">
            {["", "Owner", "Admin", "Member"].map((label, index) => (
              <div className={`design-role-cell heading ${index ? "text-center" : ""}`} key={label}>
                {label}
              </div>
            ))}
            {copy.perms.map((permission, index) => (
              <RoleRow key={permission} permission={permission} roles={roleMatrix[index]} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
function RoleRow({ permission, roles }: { permission: string; roles: number[] }) {
  return (
    <>
      <div className="design-role-cell">{permission}</div>
      {roles.map((allowed, index) => (
        <div key={index} className={`design-role-cell permission ${allowed ? "" : "denied"}`}>
          {allowed ? "●" : "—"}
        </div>
      ))}
    </>
  );
}
