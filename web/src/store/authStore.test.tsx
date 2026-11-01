import { createRoot, flush } from "solid-js";
import { render } from "@solidjs/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userApi, type User } from "@/api";
import { triggerUnauthorized } from "@/lib/auth-events";
import { AppStateProvider, createAppState, useAuth } from "./AppState";

const user: User = {
  id: "alice",
  username: "alice",
  email: "alice@example.com",
  avatar_url: "",
  status: "active",
  is_admin: false,
};
const session = { code: 0, data: { user }, message: "" };

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

describe("个人账号会话", () => {
  it("通过服务端 Session 恢复当前用户", async () => {
    vi.spyOn(userApi, "session").mockResolvedValue(session);
    expect(app.auth.state.loading).toBe(true);
    await app.auth.loadSession();
    flush();
    expect(app.auth.state.user?.id).toBe(user.id);
    expect(app.auth.state.isAuthenticated).toBe(true);
    expect(app.auth.state.loading).toBe(false);
  });

  it("失效的 Session 清空当前用户并结束恢复", async () => {
    app.auth.setUser(user);
    vi.spyOn(userApi, "session").mockRejectedValue(new Error("Session expired"));
    await app.auth.loadSession();
    flush();
    expect(app.auth.state.user).toBeNull();
    expect(app.auth.state.isAuthenticated).toBe(false);
    expect(app.auth.state.loading).toBe(false);
  });

  it.each(["login", "register"] as const)("%s 成功后直接进入个人账号会话", async (action) => {
    const credentials = { email: user.email, password: "password123" };
    const request = vi.spyOn(userApi, action).mockResolvedValue(session);
    await app.auth[action](credentials);
    flush();
    expect(request).toHaveBeenCalledWith(credentials);
    expect(app.auth.state.user?.id).toBe(user.id);
    expect(app.auth.state.isAuthenticated).toBe(true);
    expect(app.auth.state.loading).toBe(false);
  });

  it("退出失败时仍清空本地用户并向调用方报告错误", async () => {
    app.auth.setUser(user);
    vi.spyOn(userApi, "logout").mockRejectedValue(new Error("Network error"));
    await expect(app.auth.logout()).rejects.toThrow("Network error");
    flush();
    expect(app.auth.state.user).toBeNull();
    expect(app.auth.state.isAuthenticated).toBe(false);
  });

  it("Provider 收到 401 后清空用户，卸载后注销监听", () => {
    let provided!: ReturnType<typeof useAuth>;
    function CaptureAuth() {
      provided = useAuth();
      return null;
    }
    const container = document.createElement("div");
    document.body.append(container);
    const unmount = render(
      () => (
        <AppStateProvider>
          <CaptureAuth />
        </AppStateProvider>
      ),
      container,
    );
    try {
      flush();
      provided.setUser(user);
      triggerUnauthorized();
      flush();
      expect(provided.state.user).toBeNull();
      expect(provided.state.isAuthenticated).toBe(false);
    } finally {
      unmount();
      container.remove();
    }
    provided.setUser(user);
    triggerUnauthorized();
    flush();
    expect(provided.state.user?.id).toBe(user.id);
  });

  it("每个应用实例的用户状态互相独立", () => {
    app.auth.setUser(user);
    flush();
    let disposeOther!: () => void;
    const other = createRoot((cleanup) => {
      disposeOther = cleanup;
      return createAppState();
    });
    try {
      expect(app.auth.state.isAuthenticated).toBe(true);
      expect(other.auth.state.user).toBeNull();
      other.auth.clearAuth();
      flush();
      expect(app.auth.state.user?.id).toBe(user.id);
    } finally {
      disposeOther();
    }
  });
});
