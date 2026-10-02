import type { SiteLocale } from "../i18n/locales";

export interface LegalSection {
  heading: string;
  body: string;
}
export interface LegalPageContent {
  title: string;
  description: string;
  primaryKeyword: string;
  status: "draft" | "published";
  updatedAt?: string;
  notice: string;
  sections: LegalSection[];
}
export type LegalPageKind = "privacy" | "terms";

export const legalPages: Record<SiteLocale, Record<LegalPageKind, LegalPageContent>> = {
  en: {
    privacy: {
      title: "Privacy Policy",
      primaryKeyword: "privacy policy",
      description:
        "How account, workspace, and session data are handled, including storage, retention, service providers, and privacy requests.",
      status: "draft",
      notice:
        "Draft policy template. Before launch, identify the service operator and contact details, review the actual data flows, and replace this draft with your published policy.",
      sections: [
        {
          heading: "Service operator and contact",
          body: "The operator of this deployment is responsible for personal data. Add the operator’s legal name, address, and privacy contact here so users know who to contact.",
        },
        {
          heading: "Information collected",
          body: "Account features store a username, email address, optional avatar URL, password hash, workspace memberships, and session records. Passwords are hashed. The server stores a hash of each session token rather than the raw token.",
        },
        {
          heading: "Use of information and cookies",
          body: "Account and workspace data support sign-in, team collaboration, and access control. Authentication uses an HttpOnly session cookie. Browser tools in this template process their input locally; any added analytics, payment, email, or AI integrations need to be documented separately.",
        },
        {
          heading: "Storage, service providers, and transfers",
          body: "The deployment operator chooses the database, hosting location, backups, and any external providers. Replace this section with the providers and locations actually used, the data shared with them, and any applicable transfer arrangements.",
        },
        {
          heading: "Retention and deletion",
          body: "Session expiry is configured by the deployment operator. Account records and workspace data are stored in the database. Define actual retention periods, backup handling, and a deletion process before publishing this policy; the template does not provide a self-service account deletion feature.",
        },
        {
          heading: "Privacy requests and policy changes",
          body: "Add a working privacy contact and describe the request process available to users in your operating regions. Publish an effective date and explain how material policy changes will be communicated.",
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      primaryKeyword: "terms of service",
      description:
        "Terms covering accounts, workspace access, acceptable use, service availability, and the operator’s contact information.",
      status: "draft",
      notice:
        "Draft terms template. Before launch, identify the service operator, review your product and pricing, and replace this draft with the terms applicable to your service.",
      sections: [
        {
          heading: "Operator and scope",
          body: "Identify the operator, contact details, and the service covered by these terms. This repository supplies software foundations; the operator must describe the final product and the terms under which it is offered.",
        },
        {
          heading: "Accounts and workspaces",
          body: "Users are responsible for protecting their account credentials and using only workspaces they are authorized to access. Workspace owners and administrators manage member access within the permissions provided by the service.",
        },
        {
          heading: "Acceptable use and user content",
          body: "Describe the permitted uses of your service, prohibited conduct, and responsibilities for uploaded or entered content. Define any content license needed by your actual product rather than assuming one from the template.",
        },
        {
          heading: "Pricing and subscriptions",
          body: "The template does not implement paid subscriptions. If you add payment features, explain prices, billing cycles, cancellation, refunds, and any usage limits here before accepting payments.",
        },
        {
          heading: "Availability, changes, and termination",
          body: "Define the availability commitments, maintenance policy, and account suspension or termination process applicable to the actual service. Explain how users will be notified of material changes.",
        },
        {
          heading: "Liability, governing law, and contact",
          body: "Add terms on liability, dispute resolution, and governing law that are appropriate to your service and operating regions. Include a working support contact and an effective date before publishing.",
        },
      ],
    },
  },
  "zh-CN": {
    privacy: {
      title: "隐私政策",
      primaryKeyword: "隐私政策",
      description:
        "说明账号、工作区与会话数据的处理方式，以及数据存储、保留、服务提供方和隐私请求流程。",
      status: "draft",
      notice:
        "隐私政策模板草稿。上线前请填写运营主体及联系方式，核对真实数据流，并替换为适用于实际产品的正式政策。",
      sections: [
        {
          heading: "运营主体与联系方式",
          body: "本部署的运营者负责处理个人信息。请填写运营主体名称、地址和隐私联系方式，让用户明确应联系谁。",
        },
        {
          heading: "收集的信息",
          body: "账号功能存储用户名、邮箱、可选头像地址、密码哈希、工作区成员关系和会话记录。密码经过哈希处理；服务端保存会话 token 的哈希，不保存原始 token。",
        },
        {
          heading: "数据用途与 Cookie",
          body: "账号与工作区数据用于登录、团队协作和权限控制。身份认证使用 HttpOnly 会话 Cookie。模板中的浏览器工具在本地处理输入；新增分析、支付、邮件或 AI 服务时，需另行说明相应数据用途。",
        },
        {
          heading: "存储、服务提供方与数据传输",
          body: "运营者选择数据库、托管地区、备份和外部服务。请按实际部署填写服务提供方、存储地区、共享数据及适用的数据传输安排。",
        },
        {
          heading: "保留与删除",
          body: "会话有效期由运营者配置。账号和工作区数据保存在数据库中。发布政策前应明确实际保留期限、备份处理和删除流程；模板暂未提供用户自助删除账号的功能。",
        },
        {
          heading: "隐私请求与政策变更",
          body: "请填写可用的隐私联系方式，说明面向实际运营地区用户的请求流程，提供生效日期，并说明重要政策变更的通知方式。",
        },
      ],
    },
    terms: {
      title: "服务条款",
      primaryKeyword: "服务条款",
      description: "说明账号、工作区权限、合理使用、服务可用性与运营主体的联系方式。",
      status: "draft",
      notice:
        "服务条款模板草稿。上线前请填写运营主体，核对产品功能与收费方式，并替换为适用于实际服务的正式条款。",
      sections: [
        {
          heading: "运营主体与适用范围",
          body: "请填写运营主体、联系方式和本条款适用的服务。本仓库提供基础工程结构，运营者需说明最终产品及其提供条件。",
        },
        {
          heading: "账号与工作区",
          body: "用户应保护账号凭据，仅访问获得授权的工作区。工作区所有者与管理员在服务规定的权限范围内管理成员访问。",
        },
        {
          heading: "合理使用与用户内容",
          body: "请说明允许的用途、禁止的行为，以及用户对输入或上传内容承担的责任。内容许可应依据实际产品需要制定，不能直接从模板推定。",
        },
        {
          heading: "费用与订阅",
          body: "模板未实现付费订阅。接入支付后，请在收款前说明价格、计费周期、取消、退款及使用限额。",
        },
        {
          heading: "可用性、变更与终止",
          body: "请依据实际服务明确可用性承诺、维护规则及账号暂停或终止流程，并说明重要变更的通知方式。",
        },
        {
          heading: "责任、适用法律与联系",
          body: "请按实际服务及运营地区补充责任、争议处理和适用法律条款，并在发布前填写可用的支持联系方式和生效日期。",
        },
      ],
    },
  },
};
