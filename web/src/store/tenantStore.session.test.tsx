/** @vitest-environment jsdom */

import { createRoot, flush } from "solid-js";
import { render } from "@solidjs/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tenantApi, type TenantMemberDetail } from "@/api";
import { createAppState, AppStateProvider, useAuth, useTenant } from "./AppState";
import { triggerUnauthorized } from "@/lib/auth-events";

const tenant = (id: string) => ({
  id,
  name: id,
  slug: id,
  created_by: "x",
  created_at: "",
  updated_at: "",
});
const user = (id: string) => ({
  id,
  username: id,
  email: `${id}@example.com`,
  avatar_url: "",
  status: "active" as const,
});
const member = (userID: string, tenantID: string): TenantMemberDetail => ({
  id: `m-${userID}`,
  tenant_id: tenantID,
  user_id: userID,
  role: "owner",
  created_at: "",
  updated_at: "",
  username: userID,
  email: `${userID}@example.com`,
  avatar_url: "",
});

let app: ReturnType<typeof createAppState>;
let dispose: () => void;
beforeEach(() => {
  app = createRoot((cleanup) => {
    dispose = cleanup;
    return createAppState();
  });
});
afterEach(() => {
  dispose();
  vi.restoreAllMocks();
});

async function loadAlice(target = app) {
  target.auth.setUser(user("alice"));
  target.tenant.hydrate({
    user: user("alice"),
    tenants: [tenant("acme")],
    active_tenant_id: "acme",
  });
  flush();
  vi.spyOn(tenantApi, "members").mockResolvedValue({
    code: 0,
    data: [member("alice", "acme")],
    message: "",
  } as Awaited<ReturnType<typeof tenantApi.members>>);
  await target.tenant.loadMembers();
  flush();
}

describe("会话切换时的租户数据隔离", () => {
  it("认证失效后自动清空租户数据", async () => {
    await loadAlice();
    expect(app.tenant.state.membership?.role).toBe("owner");
    app.auth.clearAuth();
    flush();
    expect(app.tenant.state.members).toEqual([]);
    expect(app.tenant.state.membership).toBeNull();
    expect(app.tenant.state.activeTenant).toBeNull();
  });

  it("hydrate 不会保留上一个会话的成员信息", async () => {
    await loadAlice();
    app.tenant.hydrate({ user: user("bob"), tenants: [tenant("beta")], active_tenant_id: "beta" });
    flush();
    expect(app.tenant.state.activeTenant?.id).toBe("beta");
    expect(app.tenant.state.members).toEqual([]);
    expect(app.tenant.state.membership).toBeNull();
  });

  it.each(["退出", "新用户登录"])("%s 后不接收上个会话的迟到成员响应", async (action) => {
    await loadAlice();
    let resolve!: (value: Awaited<ReturnType<typeof tenantApi.members>>) => void;
    vi.spyOn(tenantApi, "members").mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const loading = app.tenant.loadMembers();
    if (action === "退出") app.auth.clearAuth();
    else {
      app.auth.setUser(user("bob"));
      app.tenant.hydrate({
        user: user("bob"),
        tenants: [tenant("beta")],
        active_tenant_id: "beta",
      });
    }
    resolve({ code: 0, data: [member("alice", "acme")], message: "" });
    await loading;
    flush();
    expect(app.tenant.state.activeTenant?.id ?? null).toBe(action === "退出" ? null : "beta");
    expect(app.tenant.state.members).toEqual([]);
    expect(app.tenant.state.membership).toBeNull();
  });

  it("Provider 收到 401 事件后清空会话，卸载后注销监听", async () => {
    let provided!: ReturnType<typeof createAppState>;
    function CaptureState() {
      provided = { auth: useAuth(), tenant: useTenant() };
      return null;
    }
    const container = document.createElement("div");
    document.body.append(container);
    const unmount = render(
      () => (
        <AppStateProvider>
          <CaptureState />
        </AppStateProvider>
      ),
      container,
    );
    try {
      flush();
      await loadAlice(provided);
      triggerUnauthorized();
      flush();
      expect(provided.auth.state.user).toBeNull();
      expect(provided.tenant.state.members).toEqual([]);
      expect(provided.tenant.state.membership).toBeNull();
    } finally {
      unmount();
      container.remove();
    }
    expect(triggerUnauthorized).not.toThrow();
  });

  it("每个应用实例拥有独立的用户与工作区状态", async () => {
    await loadAlice();
    let disposeOther!: () => void;
    const other = createRoot((cleanup) => {
      disposeOther = cleanup;
      return createAppState();
    });
    expect(other.auth.state.user).toBeNull();
    expect(other.tenant.state.members).toEqual([]);
    expect(other.tenant.state.activeTenant).toBeNull();
    disposeOther();
  });
});
