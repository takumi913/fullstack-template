import { createSignal } from "solid-js";

// 表单与剪贴板统一处理内联错误、pending 和重复操作。
export function createAsyncAction() {
  const [error, setError] = createSignal("");
  const [pending, setPending] = createSignal(false);
  // 同一轮事件内也要同步上锁，不能等待视图完成更新后才阻止第二次提交。
  let running = false;

  async function run(action: () => Promise<void>): Promise<boolean> {
    if (running) return false;
    running = true;
    setError("");
    setPending(true);
    try {
      await action();
      return true;
    } catch (caught) {
      setError((caught as Error).message);
      return false;
    } finally {
      running = false;
      setPending(false);
    }
  }

  return { error, pending, run, setError };
}
