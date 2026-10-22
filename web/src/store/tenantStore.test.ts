/** @vitest-environment jsdom */

import { createRoot, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tenantApi, type AuthResponse, type TenantMemberDetail } from "@/api";
import { createTenantState } from "./tenantStore";

const user = {
  id: "u1",
  username: "alice",
  email: "a@example.com",
  avatar_url: "",
  status: "active" as const,
};
function tenant(id: string) {
  return { id, name: id, slug: id, created_by: "u1", created_at: "", updated_at: "" };
}
function auth(tenants: ReturnType<typeof tenant>[], active: string | null): AuthResponse {
  return { user, tenants, active_tenant_id: active };
}
function member(tenantID: string, name: string): TenantMemberDetail {
  return {
    id: name,
    tenant_id: tenantID,
    user_id: user.id,
    username: name,
    email: user.email,
    avatar_url: "",
    role: "owner",
    created_at: "",
    updated_at: "",
  };
}
function response<T>(data: T) {
  return { code: 0, data, message: "" };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

let state: ReturnType<typeof createTenantState>;
let dispose: () => void;
beforeEach(() => {
  state = createRoot((cleanup) => {
    dispose = cleanup;
    return createTenantState(() => user);
  });
});
afterEach(() => {
  dispose();
  vi.restoreAllMocks();
});

describe("tenant state", () => {
  it("选中 active_tenant_id 指向的租户", () => {
    state.hydrate(auth([tenant("a"), tenant("b")], "b"));
    flush();
    expect(state.state.activeTenant?.id).toBe("b");
    expect(state.state.tenants).toHaveLength(2);
  });
  it("active_tenant_id 不在列表中时回退到第一个租户", () => {
    state.hydrate(auth([tenant("a")], "已删除的租户"));
    flush();
    expect(state.state.activeTenant?.id).toBe("a");
  });
  it("没有任何租户时为 null，而不是 undefined", () => {
    state.hydrate(auth([], "已删除的租户"));
    flush();
    expect(state.state.activeTenant).toBeNull();
  });
  it("切换后请求新工作区的成员，不读取尚未提交的旧状态", async () => {
    state.hydrate(auth([tenant("a"), tenant("b")], "a"));
    flush();
    vi.spyOn(tenantApi, "select").mockResolvedValue({ code: 0, data: null, message: "" } as Awaited<
      ReturnType<typeof tenantApi.select>
    >);
    const members = vi
      .spyOn(tenantApi, "members")
      .mockResolvedValue({ code: 0, data: [], message: "" } as Awaited<
        ReturnType<typeof tenantApi.members>
      >);
    await state.selectTenant(tenant("b"));
    flush();
    expect(members).toHaveBeenCalledWith("b");
    expect(state.state.activeTenant?.id).toBe("b");
  });

  it("切换工作区后，旧工作区的迟到成员响应不会覆盖新名单", async () => {
    state.hydrate(auth([tenant("a"), tenant("b")], "a"));
    flush();
    const old = deferred<Awaited<ReturnType<typeof tenantApi.members>>>();
    vi.spyOn(tenantApi, "members")
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(response([member("b", "new-member")]));
    vi.spyOn(tenantApi, "select").mockResolvedValue(response(null));
    const oldLoad = state.loadMembers();
    await state.selectTenant(tenant("b"));
    old.resolve(response([member("a", "old-member")]));
    await oldLoad;
    flush();
    expect(state.state.activeTenant?.id).toBe("b");
    expect(state.state.members.map((value) => value.id)).toEqual(["new-member"]);
    expect(state.state.membership?.tenant_id).toBe("b");
  });

  it("同一工作区的成员刷新以最后一次请求为准", async () => {
    state.hydrate(auth([tenant("a")], "a"));
    flush();
    const old = deferred<Awaited<ReturnType<typeof tenantApi.members>>>();
    vi.spyOn(tenantApi, "members")
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(response([member("a", "updated-member")]));
    const oldLoad = state.loadMembers();
    await state.loadMembers();
    old.resolve(response([member("a", "removed-member")]));
    await oldLoad;
    flush();
    expect(state.state.members.map((value) => value.id)).toEqual(["updated-member"]);
  });

  it("连续切换工作区时，先前选择的迟到响应不能撤销最后一次选择", async () => {
    state.hydrate(auth([tenant("a"), tenant("b"), tenant("c")], "a"));
    flush();
    const old = deferred<Awaited<ReturnType<typeof tenantApi.select>>>();
    vi.spyOn(tenantApi, "select")
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(response(null));
    const members = vi.spyOn(tenantApi, "members").mockResolvedValue(response([]));
    const oldSelect = state.selectTenant(tenant("b"));
    await state.selectTenant(tenant("c"));
    old.resolve(response(null));
    await oldSelect;
    flush();
    expect(state.state.activeTenant?.id).toBe("c");
    expect(members).toHaveBeenCalledTimes(1);
    expect(members).toHaveBeenCalledWith("c");
  });

  it.each(["reset", "hydrate"] as const)("%s 后不接收上个会话的租户列表", async (action) => {
    state.hydrate(auth([tenant("a")], "a"));
    flush();
    const old = deferred<Awaited<ReturnType<typeof tenantApi.list>>>();
    vi.spyOn(tenantApi, "list").mockReturnValue(old.promise);
    const oldLoad = state.loadTenants();
    if (action === "reset") state.reset();
    else state.hydrate(auth([tenant("b")], "b"));
    old.resolve(response([tenant("a")]));
    await oldLoad;
    flush();
    expect(state.state.tenants.map((value) => value.id)).toEqual(action === "reset" ? [] : ["b"]);
    expect(state.state.activeTenant?.id ?? null).toBe(action === "reset" ? null : "b");
  });

  it("租户列表刷新以最后一次请求为准", async () => {
    state.hydrate(auth([tenant("a")], "a"));
    flush();
    const old = deferred<Awaited<ReturnType<typeof tenantApi.list>>>();
    vi.spyOn(tenantApi, "list")
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(response([{ ...tenant("a"), name: "new-name" }]));
    const oldLoad = state.loadTenants();
    await state.loadTenants();
    old.resolve(response([tenant("a")]));
    await oldLoad;
    flush();
    expect(state.state.activeTenant?.name).toBe("new-name");
  });

  it("当前工作区从列表消失时，回退工作区并清空旧成员和角色", async () => {
    state.hydrate(auth([tenant("a"), tenant("b")], "a"));
    flush();
    vi.spyOn(tenantApi, "members").mockResolvedValue(response([member("a", "old-member")]));
    await state.loadMembers();
    flush();
    expect(state.state.membership?.role).toBe("owner");
    vi.spyOn(tenantApi, "list").mockResolvedValue(response([tenant("b")]));
    await state.loadTenants();
    flush();
    expect(state.state.activeTenant?.id).toBe("b");
    expect(state.state.members).toEqual([]);
    expect(state.state.membership).toBeNull();
  });

  it("退出后，尚未完成的工作区选择不能恢复工作区或请求成员", async () => {
    state.hydrate(auth([tenant("a"), tenant("b")], "a"));
    flush();
    const pending = deferred<Awaited<ReturnType<typeof tenantApi.select>>>();
    vi.spyOn(tenantApi, "select").mockReturnValue(pending.promise);
    const members = vi.spyOn(tenantApi, "members").mockResolvedValue(response([]));
    const selecting = state.selectTenant(tenant("b"));
    state.reset();
    pending.resolve(response(null));
    await selecting;
    flush();
    expect(state.state.activeTenant).toBeNull();
    expect(members).not.toHaveBeenCalled();
  });
});
