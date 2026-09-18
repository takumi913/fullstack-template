import { describe, expect, it } from "vitest";
import { publicPageCopy } from "./ui-copy";

describe("publicPageCopy", () => {
  it("uses Japanese labels for Japanese locale variants", () => {
    expect(publicPageCopy("ja").faq).toBe("よくある質問");
    expect(publicPageCopy("ja-JP").relatedTools).toBe("関連ツール");
  });

  it("uses Chinese labels for Chinese locale variants", () => {
    expect(publicPageCopy("zh-CN").home).toBe("首页");
    expect(publicPageCopy("zh-TW").resources).toBe("资源");
  });

  it("falls back to English for unsupported or missing locales", () => {
    expect(publicPageCopy("de").tools).toBe("Tools");
    expect(publicPageCopy(undefined).language).toBe("Language");
  });
});
