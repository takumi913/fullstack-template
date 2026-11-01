import { createRoot, flush } from "solid-js";
import { render } from "@solidjs/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminApi, type User } from "@/api";
import { SiteI18nProvider } from "@/i18n/context";
import { appTranslations } from "@/i18n/private";
import { createAuthState } from "@/store/authStore";
import AdminUsersPage from "./AdminUsersPage";

let auth: ReturnType<typeof createAuthState>;
vi.mock("@/store/AppState", () => ({ useAuth: () => auth }));

const admin: User = {
  id: "admin",
  username: "admin",
  email: "admin@example.com",
  avatar_url: "",
  status: "active",
  is_admin: true,
};
const alice: User = {
  ...admin,
  id: "alice",
  username: "alice",
  email: "alice@example.com",
  is_admin: false,
};
const response = (items: User[], page = 1, total = items.length) => ({
  code: 0,
  message: "",
  data: { items, pagination: { page, page_size: 20, total } },
});
const resources = Object.fromEntries(
  Object.entries(appTranslations).map(([locale, app]) => [locale, { app }]),
);

let disposeAuth: () => void;
let unmount: (() => void) | undefined;
beforeEach(() => {
  auth = createRoot((cleanup) => {
    disposeAuth = cleanup;
    return createAuthState();
  });
  auth.setUser(admin);
  flush();
});
afterEach(() => {
  unmount?.();
  unmount = undefined;
  disposeAuth();
  vi.restoreAllMocks();
});

function mount() {
  const container = document.body.appendChild(document.createElement("div"));
  const dispose = render(
    () => (
      <SiteI18nProvider locale="zh-CN" resources={resources}>
        <AdminUsersPage />
      </SiteI18nProvider>
    ),
    container,
  );
  unmount = () => {
    dispose();
    container.remove();
  };
  flush();
  return container;
}

function button(label: string) {
  const result = [...document.querySelectorAll("button")].find(
    (element) => element.textContent?.trim() === label,
  );
  if (!result) throw new Error(`Button not found: ${label}`);
  return result;
}

describe("平台用户管理", () => {
  it("普通用户打开管理页面时显示无权限且不请求用户数据", () => {
    auth.setUser(alice);
    flush();
    const list = vi.spyOn(adminApi, "listUsers");
    const container = mount();
    expect(container.textContent).toContain("你没有管理用户的权限。");
    expect(container.querySelector("form")).toBeNull();
    expect(list).not.toHaveBeenCalled();
  });

  it("搜索回到第一页，翻页保留已提交的搜索条件", async () => {
    const list = vi
      .spyOn(adminApi, "listUsers")
      .mockResolvedValueOnce(response([alice], 1, 21))
      .mockResolvedValueOnce(response([alice], 1, 21))
      .mockResolvedValueOnce(response([alice], 2, 21));
    const container = mount();
    await vi.waitFor(() => {
      flush();
      expect(container.querySelector("li")?.textContent).toContain(alice.email);
    });
    const input = container.querySelector("input")!;
    input.value = " alice ";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flush();
    container
      .querySelector("form")!
      .dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() => {
      flush();
      expect(list).toHaveBeenNthCalledWith(2, { query: "alice", page: 1, page_size: 20 });
      expect(button("下一页").disabled).toBe(false);
    });
    input.value = "unsubmitted";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flush();
    button("下一页").click();
    await vi.waitFor(() => {
      flush();
      expect(list).toHaveBeenNthCalledWith(3, { query: "alice", page: 2, page_size: 20 });
      expect(container.textContent).toContain("第 2 / 2 页");
    });
  });

  it("管理员没有启停按钮，普通用户启停后更新列表并保留错误提示", async () => {
    vi.spyOn(adminApi, "listUsers").mockResolvedValue(response([admin, alice]));
    const update = vi
      .spyOn(adminApi, "updateUser")
      .mockResolvedValueOnce({ code: 0, message: "", data: { ...alice, status: "disabled" } })
      .mockRejectedValueOnce(new Error("更新失败，请重试"));
    const container = mount();
    await vi.waitFor(() => {
      flush();
      expect(container.querySelectorAll("li")).toHaveLength(2);
    });
    expect(container.querySelector("li")!.textContent).toContain("管理员账号通过本地命令管理。");
    expect(container.querySelector("li")!.querySelector("button")).toBeNull();
    button("禁用").click();
    await vi.waitFor(() => {
      flush();
      expect(update).toHaveBeenCalledWith(alice.id, { status: "disabled" });
      expect(button("启用").disabled).toBe(false);
    });
    button("启用").click();
    await vi.waitFor(() => {
      flush();
      expect(container.querySelector('[role="alert"]')?.textContent).toBe("更新失败，请重试");
    });
    expect(container.querySelectorAll("dd")[1].textContent).toBe("已禁用");
  });

  it("同一轮重复搜索只发起一次请求，权限失效后不展示迟到的响应", async () => {
    let resolve!: (value: ReturnType<typeof response>) => void;
    const list = vi.spyOn(adminApi, "listUsers").mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const container = mount();
    const form = container.querySelector("form")!;
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    expect(list).toHaveBeenCalledTimes(1);
    auth.setUser(alice);
    flush();
    resolve(response([admin]));
    await vi.waitFor(() => {
      flush();
      expect(container.textContent).toContain("你没有管理用户的权限。");
      expect(container.textContent).not.toContain(admin.email);
    });
  });
});
