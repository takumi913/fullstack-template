// HTTP transport reports unauthorized sessions without importing application state.

type AuthEventCallback = () => void;

let onUnauthorizedCallback: AuthEventCallback | null = null;

export function onUnauthorized(callback: AuthEventCallback) {
  onUnauthorizedCallback = callback;
  return () => {
    if (onUnauthorizedCallback === callback) onUnauthorizedCallback = null;
  };
}

// 触发 401 未授权事件（由 client.ts 调用）
export function triggerUnauthorized() {
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback();
  }
}
