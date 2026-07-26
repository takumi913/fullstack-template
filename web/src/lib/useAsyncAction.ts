import { useCallback, useState } from "react";

// useAsyncAction 统一处理表单提交的三件事：捕获错误、暴露 pending、防止重复提交。
// 没有 pending 的话按钮无法禁用，双击"创建"会真的发出两个请求。
export function useAsyncAction() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      if (pending) return;
      setError("");
      setPending(true);
      try {
        await action();
      } catch (caught) {
        setError((caught as Error).message);
      } finally {
        setPending(false);
      }
    },
    [pending],
  );

  return { error, pending, run, setError };
}
