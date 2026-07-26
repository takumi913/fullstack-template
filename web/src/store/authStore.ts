import { create } from "zustand";
import { onUnauthorized } from "@/lib/auth-events";
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
  loadSession: () => Promise<AuthResponse | null>;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  loadSession: async () => {
    try {
      const r = await userApi.session();
      set({ user: r.data.user, isAuthenticated: true, loading: false });
      return r.data;
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  },
  login: async (data) => {
    const r = await userApi.login(data);
    set({ user: r.data.user, isAuthenticated: true });
    return r.data;
  },
  register: async (data) => {
    const r = await userApi.register(data);
    set({ user: r.data.user, isAuthenticated: true });
    return r.data;
  },
  logout: async () => {
    try {
      await userApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false, loading: false }),
}));
onUnauthorized(() => useAuthStore.getState().clearAuth());
