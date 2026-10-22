import { createEffect, createSignal, For } from "solid-js";
import { useTranslation, useLocale } from "@/i18n/context";
import { tenantApi, type TenantRole } from "@/api";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useAuth, useTenant } from "@/store/AppState";
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
  const locale = useLocale();
  const copy = () => toolsmithPrivateCopy(locale());
  const tenant = useTenant();
  const auth = useAuth();
  const [email, setEmail] = createSignal("");
  const [role, setRole] = createSignal<TenantRole>("member");
  const [loadError, setLoadError] = createSignal("");
  const [loadedFor, setLoadedFor] = createSignal<string | null>(null);
  const [notice, setNotice] = createSignal<{ message: string } | null>(null);
  const { error, pending, run } = createAsyncAction();
  createEffect(
    () => notice(),
    (value) => {
      if (!value) return;
      const timer = setTimeout(() => setNotice(null), 2200);
      return () => clearTimeout(timer);
    },
  );
  const tenantID = () => tenant.state.activeTenant?.id ?? null;
  createEffect(tenantID, (id) => {
    let cancelled = false;
    void tenant
      .loadMembers(id)
      .then(() => !cancelled && setLoadError(""))
      .catch((caught: Error) => !cancelled && setLoadError(caught.message))
      .finally(() => !cancelled && setLoadedFor(id));
    return () => {
      cancelled = true;
    };
  });
  const loaded = () => loadedFor() === tenantID();
  const canManage = () =>
    loaded() &&
    (tenant.state.membership?.role === "owner" || tenant.state.membership?.role === "admin");
  function add(event: SubmitEvent) {
    event.preventDefault();
    const id = tenantID();
    if (!id) return;
    const data = { email: email(), role: role() };
    void run(async () => {
      await tenantApi.addMember(id, data);
      setEmail("");
      setRole("member");
      await tenant.loadMembers();
    }).then((ok) => {
      if (ok) setNotice({ message: t("members.added") });
    });
  }
  function remove(userID: string) {
    const id = tenantID();
    if (!id) return;
    void run(async () => {
      await tenantApi.removeMember(id, userID);
      await tenant.loadMembers();
    }).then((ok) => {
      if (ok) setNotice({ message: copy().removed });
    });
  }
  function updateRole(userID: string, next: TenantRole) {
    const id = tenantID();
    if (!id) return;
    void run(async () => {
      await tenantApi.updateMember(id, userID, next);
      await tenant.loadMembers();
    }).then((ok) => {
      if (ok) setNotice({ message: copy().roleChanged });
    });
  }
  return (
    <>
      <div class="design-members-heading">
        <div>
          <div class="design-members-crumb">
            {tenant.state.activeTenant?.name} / {copy().wsMembers}
          </div>
          <h1>{copy().wsMembers}</h1>
          <p>{copy().wsMembersSub}</p>
        </div>
      </div>
      {canManage() && (
        <form class="design-invite-form" onSubmit={add}>
          <input
            class="design-invite-input"
            type="email"
            aria-label={copy().email}
            placeholder={copy().invitePh}
            value={email()}
            onInput={(event) => setEmail(event.currentTarget.value)}
            required
          />
          <select
            class="design-invite-role"
            value={role()}
            aria-label={copy().colRole}
            onChange={(event) => setRole(event.currentTarget.value as TenantRole)}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <button class="design-invite-submit" disabled={pending()}>
            {pending() ? t("common:actions.processing") : copy().invite}
          </button>
        </form>
      )}
      {(error() || loadError()) && (
        <p class="mt-4 text-sm text-destructive" role="alert">
          {error() || loadError()}
        </p>
      )}
      <div class="design-members-table">
        <div class="design-members-table-inner">
          <div class="design-members-columns header">
            <span>{copy().colMember}</span>
            <span>{copy().colRole}</span>
            <span>{copy().colJoined}</span>
            <span />
          </div>
          {!loaded() && (
            <p class="px-5 py-4 text-sm text-muted-foreground">{t("common:actions.loading")}</p>
          )}
          {loaded() && !loadError() && !tenant.state.members.length && (
            <p class="px-5 py-4 text-sm text-muted-foreground">{t("members.empty")}</p>
          )}
          <For each={tenant.state.members} keyed={(member) => member.id}>
            {(member, index) => (
              <div class="design-members-columns design-member-row">
                <div class="design-member-identity">
                  <span
                    class="design-member-avatar"
                    style={{ "--avatar-color": `var(--color-avatar-${(index() % 5) + 1})` }}
                  >
                    {member().username.slice(0, 1).toUpperCase()}
                  </span>
                  <div class="min-w-0">
                    <div class="design-member-name">
                      {member().username}
                      {member().user_id === auth.state.user?.id && (
                        <span class="design-member-tag">{copy().you}</span>
                      )}
                    </div>
                    <div class="design-member-email">{member().email}</div>
                  </div>
                </div>
                <div>
                  {member().role === "owner" ? (
                    <span class="design-owner-badge">Owner</span>
                  ) : canManage() ? (
                    <select
                      class="design-member-role"
                      value={member().role}
                      aria-label={`${member().username} ${copy().colRole}`}
                      disabled={pending()}
                      onChange={(event) =>
                        updateRole(member().user_id, event.currentTarget.value as TenantRole)
                      }
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <span class="capitalize text-sm">{member().role}</span>
                  )}
                </div>
                <span class="design-member-joined">{member().created_at.slice(0, 10)}</span>
                <div class="text-right">
                  {canManage() &&
                    member().role !== "owner" &&
                    member().user_id !== tenant.state.membership?.user_id && (
                      <button
                        type="button"
                        class="design-member-remove"
                        disabled={pending()}
                        onClick={() => remove(member().user_id)}
                      >
                        {copy().remove}
                      </button>
                    )}
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      {notice() && (
        <div class="design-success-notice" role="status">
          <div>{notice()?.message}</div>
        </div>
      )}
      <div class="design-role-matrix">
        <h2>{copy().matrixTitle}</h2>
        <p>{copy().matrixSub}</p>
        <div class="design-role-table">
          <div class="design-role-grid">
            <For each={["", "Owner", "Admin", "Member"]}>
              {(label, index) => (
                <div class={["design-role-cell heading", { "text-center": !!index() }]}>
                  {label}
                </div>
              )}
            </For>
            <For each={copy().perms}>
              {(permission, index) => (
                <RoleRow permission={permission} roles={roleMatrix[index()]} />
              )}
            </For>
          </div>
        </div>
      </div>
    </>
  );
}
function RoleRow(props: { permission: string; roles: number[] }) {
  return (
    <>
      <div class="design-role-cell">{props.permission}</div>
      <For each={props.roles} keyed={false}>
        {(allowed) => (
          <div class={["design-role-cell permission", { denied: !allowed() }]}>
            {allowed() ? "●" : "—"}
          </div>
        )}
      </For>
    </>
  );
}
