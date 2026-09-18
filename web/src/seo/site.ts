const fallbackUrl = "https://example.com";

export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME || "Fullstack Template",
  url: (import.meta.env.VITE_SITE_URL || fallbackUrl).replace(/\/$/, ""),
  locale: import.meta.env.VITE_SITE_LOCALE || "zh-CN",
  defaultTitle: "Go + React 多租户 SaaS 全栈模板",
  defaultDescription:
    "基于 Go、React、sqlc、PostgreSQL/SQLite 与多租户 RBAC 的 SaaS 全栈母模板。",
  defaultImage: "/og-image.svg",
} as const;

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}
