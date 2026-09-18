export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalPageContent {
  title: string;
  description: string;
  sections: LegalSection[];
}

export const legalPages = {
  privacy: {
    title: "隐私政策",
    description: "最后更新：请在上线前修改",
    sections: [
      {
        heading: "我们收集的信息",
        body: "模板仅存储运行账户与工作区所需的信息，包括用户名、邮箱、密码哈希、成员关系和会话记录。接入实际业务后，请按你的产品数据流更新本节。",
      },
      {
        heading: "数据用途",
        body: "这些数据用于身份认证、租户隔离和权限校验。接入分析、支付、邮件、AI 或第三方服务后，请补充对应的数据用途和处理依据。",
      },
      {
        heading: "数据控制",
        body: "部署者负责数据库安全、备份、数据保留、数据删除和用户请求处理。上线前应根据实际运营地区补充适用的隐私条款。",
      },
    ],
  },
  terms: {
    title: "服务条款",
    description: "最后更新：请在上线前修改",
    sections: [
      {
        heading: "产品用途",
        body: "本仓库提供基础工程结构。部署者需要根据最终产品的功能、收费方式和用户群体补充适用的服务条款与运营规则。",
      },
      {
        heading: "账户责任",
        body: "用户应妥善保管账户凭据，并对其账户和工作区中的操作负责。实际产品如允许团队协作，应明确成员权限与责任边界。",
      },
      {
        heading: "服务变更",
        body: "实际产品的功能、费用、限制或政策发生变化时，应同步更新本页面，并按适用规则通知用户。",
      },
    ],
  },
} satisfies Record<"privacy" | "terms", LegalPageContent>;
