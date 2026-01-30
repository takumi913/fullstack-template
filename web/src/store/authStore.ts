// 用户认证状态管理
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { onUnauthorized } from "@/lib/auth-events";
import { userApi } from "@/api";
import type { User } from "@/api";

// 认证状态接口
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// 创建认证状态store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // 登录
      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      // 登出
      logout: async () => {
        try {
          // 调用后端注销接口
          await userApi.logout();
        } catch (error) {
          console.error("注销请求失败:", error);
        } finally {
          // 无论后端请求是否成功，都清除本地状态
          // 不再需要清除token，因为使用了cookie
          set({ user: null, isAuthenticated: false });
        }
      },

      // 设置用户信息
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      // 清除认证状态（用于token过期等情况）
      clearAuth: () => {
        // 不再需要清除token，因为使用了cookie
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage", // 本地存储的key
    }
  )
);

// 注册 401 未授权回调
onUnauthorized(() => {
  useAuthStore.getState().clearAuth();
});
