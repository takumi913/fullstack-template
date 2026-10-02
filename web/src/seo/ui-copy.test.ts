import { describe, expect, it } from "vitest";
import { publicPageCopy } from "./ui-copy";

describe("publicPageCopy", () => {
  it("uses English as the default language", () => {
    expect(publicPageCopy().faq).toBe("Frequently asked questions");
    expect(publicPageCopy("en").home).toBe("Home");
  });
  it("uses Simplified Chinese labels for supported Chinese language tags", () => {
    expect(publicPageCopy("zh-CN").home).toBe("首页");
    expect(publicPageCopy("zh-cn").resources).toBe("资源");
  });
  it("does not present unsupported languages as translated versions", () => {
    expect(publicPageCopy("ja").home).toBe("Home");
    expect(publicPageCopy("zh-TW").home).toBe("Home");
  });
});
