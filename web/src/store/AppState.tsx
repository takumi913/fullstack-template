import { createContext, onSettled, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import { onUnauthorized } from "@/lib/auth-events";
import { createAuthState } from "./authStore";

export function createAppState() {
  return { auth: createAuthState() };
}

const AppStateContext = createContext<ReturnType<typeof createAppState>>();

export function AppStateProvider(props: { children: JSX.Element }) {
  // 每次渲染独立创建，服务端预渲染不能共享用户状态。
  const state = createAppState();
  onSettled(() => onUnauthorized(state.auth.clearAuth));
  return <AppStateContext value={state}>{props.children}</AppStateContext>;
}

function useAppState() {
  return useContext(AppStateContext);
}

export function useAuth() {
  return useAppState().auth;
}
