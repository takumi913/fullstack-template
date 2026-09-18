import { scaffoldSentinels } from "./scaffold-sentinels";

export const templateSiteConfig = {
  brand: {
    name: scaffoldSentinels.name,
    shortName: "Fullstack",
    mark: "F",
    favicon: "/favicon.svg",
  },
  seo: {
    locale: "zh-CN",
    primaryKeyword: "go react saas template",
    defaultTitle: scaffoldSentinels.title,
    defaultDescription: scaffoldSentinels.description,
    defaultImage: "/og-image.svg",
  },
  appearance: {
    themeColor: "#ffffff",
    backgroundColor: "#ffffff",
    iconBackground: "#18181b",
    iconForeground: "#ffffff",
  },
  navigation: {
    tools: "Tools",
    resources: "Resources",
    dashboard: "Dashboard",
    login: "登录",
    register: "创建账号",
    logout: "退出",
    privacy: "隐私政策",
    terms: "服务条款",
  },
  home: {
    description:
      "认证、工作区、多租户 RBAC、SQLite/PostgreSQL 与生产部署骨架已经就位，公开页面可静态预渲染，登录后的应用继续保持 SPA。",
    primaryCta: "开始构建",
    secondaryCta: "登录",
    capabilitiesTitle: "构建 SaaS 所需的基础能力",
    capabilities: [
      ["Authentication", "邮箱密码认证、数据库 Session 与安全 Cookie。"],
      ["Multi-tenancy", "用户可加入多个工作区，数据边界清晰。"],
      ["Authorization", "Owner、Admin、Member 固定角色与路由权限。"],
      ["Database", "SQLite 用于本地开发，PostgreSQL 用于生产环境。"],
    ],
    examplesEyebrow: "Tool page examples",
    examplesTitle: "一份配置生成工具页 SEO 与 SSG。",
    examplesDescription:
      "示例页默认 noindex，用于演示 Tool Page Schema、面包屑、相关工具和路由级代码拆分。",
    examplesLink: "View tool directory",
    exampleCardCta: "Open example",
    closingTitle: "公开页面做 SEO，产品后台保持简单。",
    closingCta: "创建第一个工作区",
  },
  hubs: {
    tools: {
      eyebrow: "Tools",
      primaryKeyword: "online tools",
      title: "Online Tools",
      description:
        "Browse the public tool pages included with the template. Example tools stay noindex until you replace them with real product functionality and publish them.",
    },
    resources: {
      eyebrow: "Resources",
      primaryKeyword: "tool guides",
      title: "Resources",
      description:
        "Use cases, comparisons, and guides live here so informational pages remain connected to the tools they support.",
    },
  },
  legal: {
    privacy: {
      primaryKeyword: "privacy policy",
      title: "隐私政策",
      description: "隐私政策与数据处理说明。",
    },
    terms: {
      primaryKeyword: "terms of service",
      title: "服务条款",
      description: "服务条款与模板使用说明。",
    },
  },
} as const;
