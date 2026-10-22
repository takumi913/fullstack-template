/** @vitest-environment jsdom */

import { createRoot, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAsyncAction } from "./createAsyncAction";

let action: ReturnType<typeof createAsyncAction>;
let dispose: () => void;
beforeEach(() => {
  action = createRoot((cleanup) => {
    dispose = cleanup;
    return createAsyncAction();
  });
});
afterEach(() => dispose());

describe("createAsyncAction", () => {
  it("失败时暴露错误信息并复位 pending", async () => {
    await action.run(async () => {
      throw new Error("原密码错误");
    });
    flush();
    expect(action.error()).toBe("原密码错误");
    expect(action.pending()).toBe(false);
  });

  it("上一次尚未结束时忽略同一轮事件里的重复提交", async () => {
    let calls = 0;
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => (release = resolve));
    const first = action.run(async () => {
      calls++;
      await blocked;
    });
    // 在 flush 前再次提交，验证防重不依赖视图何时看到 pending。
    expect(
      await action.run(async () => {
        calls++;
      }),
    ).toBe(false);
    flush();
    expect(action.pending()).toBe(true);
    expect(calls).toBe(1);
    release();
    expect(await first).toBe(true);
    flush();
    expect(action.pending()).toBe(false);
  });

  it("重新提交时清空上一次的错误", async () => {
    await action.run(async () => {
      throw new Error("失败了");
    });
    flush();
    expect(action.error()).toBe("失败了");
    await action.run(async () => {});
    flush();
    expect(action.error()).toBe("");
  });
});
