import { createStore } from "solid-js";
import {
  userApi,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
  type User,
} from "@/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export function createAuthState(onClear: () => void) {
  const [state, setState] = createStore<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  function setUser(user: User) {
    setState((draft) => {
      draft.user = user;
      draft.isAuthenticated = true;
      draft.loading = false;
    });
  }

  function clearAuth() {
    setState((draft) => {
      draft.user = null;
      draft.isAuthenticated = false;
      draft.loading = false;
    });
    // 成员名单和角色属于当前会话，登出及 401 必须同时清空租户状态。
    onClear();
  }

  async function loadSession(): Promise<AuthResponse | null> {
    try {
      const response = await userApi.session();
      setUser(response.data.user);
      return response.data;
    } catch {
      clearAuth();
      return null;
    }
  }

  async function login(data: LoginRequest) {
    const response = await userApi.login(data);
    setUser(response.data.user);
    return response.data;
  }

  async function register(data: RegisterRequest) {
    const response = await userApi.register(data);
    setUser(response.data.user);
    return response.data;
  }

  async function logout() {
    try {
      await userApi.logout();
    } finally {
      clearAuth();
    }
  }

  return { state, loadSession, login, register, logout, setUser, clearAuth };
}
