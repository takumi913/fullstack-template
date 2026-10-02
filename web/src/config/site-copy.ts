const en = {
  home: {
    title: "Go + React SaaS Starter with Multi-Tenant Workspaces",
    primaryKeyword: "go react saas template",
    description:
      "Build a SaaS product with Go, React, secure sessions, multi-tenant workspaces, role-based access, and SQLite or PostgreSQL. Public pages are statically rendered for search.",
    primaryCta: "Start building",
    secondaryCta: "Log in",
    capabilitiesTitle: "The foundations for your SaaS product",
    capabilities: [
      ["Authentication", "Email and password authentication with secure session cookies."],
      ["Multi-tenancy", "Separate workspaces for teams, with clear data boundaries."],
      ["Authorization", "Owner, Admin, and Member roles with permissions enforced on API routes."],
      ["Database", "SQLite for local development and PostgreSQL for production."],
    ],
    examplesEyebrow: "Browser tools",
    examplesTitle: "Useful tools with pages built for search",
    examplesDescription:
      "Try the working examples and their guides. Demo pages stay out of search until you replace them with reviewed product content.",
    examplesLink: "Browse tools",
    exampleCardCta: "Open tool",
    closingTitle: "Launch public pages and a secure workspace from one codebase.",
    closingCta: "Create your first workspace",
  },
  hubs: {
    tools: {
      eyebrow: "Tools",
      primaryKeyword: "online browser tools",
      title: "Online Tools",
      description:
        "Format JSON, check syntax, and count words directly in your browser. Choose a tool below to complete your task without uploading your input.",
    },
    resources: {
      eyebrow: "Resources",
      primaryKeyword: "browser tool guides",
      title: "Tools and Workflow Guides",
      description:
        "Learn JSON syntax, debug API responses, and compare formatting with validation. Each guide explains a specific workflow and links to the tools that help you finish it.",
    },
  },
};
const zh = {
  home: {
    title: "Go + React 多租户 SaaS 开发模板",
    primaryKeyword: "Go React SaaS 开发模板",
    description:
      "用 Go、React、安全会话、多租户工作区、角色权限以及 SQLite 或 PostgreSQL 开发 SaaS 产品。公开页面静态预渲染，方便搜索引擎抓取。",
    primaryCta: "开始构建",
    secondaryCta: "登录",
    capabilitiesTitle: "构建 SaaS 产品的基础能力",
    capabilities: [
      ["身份认证", "邮箱密码认证与安全的会话 Cookie。"],
      ["多租户", "按团队划分独立工作区，明确数据边界。"],
      ["权限控制", "Owner、Admin、Member 角色，权限在 API 路由层执行。"],
      ["数据库", "本地开发使用 SQLite，生产环境使用 PostgreSQL。"],
    ],
    examplesEyebrow: "浏览器工具",
    examplesTitle: "实用工具与配套指南",
    examplesDescription:
      "体验可运行的示例工具及使用指南。示例默认不被索引，替换为经过审核的产品内容后再发布。",
    examplesLink: "浏览工具",
    exampleCardCta: "打开工具",
    closingTitle: "从同一份代码发布公开页面与安全的工作区。",
    closingCta: "创建第一个工作区",
  },
  hubs: {
    tools: {
      eyebrow: "工具",
      primaryKeyword: "在线浏览器工具",
      title: "在线工具",
      description:
        "在浏览器内格式化 JSON、检查语法、统计文本词数。选择工具即可开始，输入数据不会上传。",
    },
    resources: {
      eyebrow: "资源",
      primaryKeyword: "浏览器工具使用指南",
      title: "工具与工作流程指南",
      description:
        "学习 JSON 语法、排查 API 响应，并了解格式化与校验的区别。每篇指南聚焦一个具体任务，并链接到对应的工具。",
    },
  },
} satisfies typeof en;
export const siteCopies = { en, "zh-CN": zh };
