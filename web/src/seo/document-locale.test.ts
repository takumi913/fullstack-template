import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useTranslation } from "react-i18next";
import { SiteI18nProvider } from "../i18n/SiteI18nProvider";
import { describe, expect, it } from "vitest";
import { resolveDocumentLocale } from "./document-locale";
import { localizedPath, unlocalizedPath } from "../i18n/locales";

describe("resolveDocumentLocale", () => {
  it("uses the tool page locale for tool routes", () => {
    expect(resolveDocumentLocale("/tools/json-formatter")).toBe("en");
  });

  it("uses the configured site locale for ordinary routes", () => {
    expect(resolveDocumentLocale("/")).toBe("en");
  });
  it("uses the same locale for Chinese content, legal, and private routes", () => {
    for (const path of [
      "/zh-cn",
      "/zh-cn/tools",
      "/zh-cn/legal/terms",
      "/zh-cn/login",
      "/zh-cn/dashboard",
    ]) {
      expect(resolveDocumentLocale(path), path).toBe("zh-CN");
    }
    expect(resolveDocumentLocale("/zh-cnish/tools")).toBe("en");
    expect(resolveDocumentLocale("/ja/tools/example")).toBe("en");
  });
  it("switches URL languages without stacking prefixes", () => {
    expect(localizedPath("/", "zh-CN")).toBe("/zh-cn");
    expect(localizedPath("/zh-cn/legal/terms", "en")).toBe("/legal/terms");
    expect(localizedPath("/zh-cn/login", "zh-CN")).toBe("/zh-cn/login");
    expect(unlocalizedPath("/zh-cn")).toBe("/");
  });
  it("isolates language state across prerendered documents", () => {
    function Navigation() {
      const { t } = useTranslation();
      return createElement("span", null, t("navigation.privacy"));
    }
    const render = (locale: "en" | "zh-CN") =>
      renderToStaticMarkup(
        createElement(SiteI18nProvider, { locale, children: createElement(Navigation) }),
      );
    expect(render("zh-CN")).toBe("<span>隐私政策</span>");
    expect(render("en")).toBe("<span>Privacy Policy</span>");
    expect(render("zh-CN")).toBe("<span>隐私政策</span>");
  });
});
