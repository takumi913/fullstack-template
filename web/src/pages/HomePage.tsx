import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { routableToolPages, toolPath } from "@/content/tool-pages";
import { publicSeoPages } from "@/seo/pages";

const capabilities = [
  ["Authentication", "邮箱密码认证、数据库 Session 与安全 Cookie。"],
  ["Multi-tenancy", "用户可加入多个工作区，数据边界清晰。"],
  ["Authorization", "Owner、Admin、Member 固定角色与路由权限。"],
  ["Database", "SQLite 用于本地开发，PostgreSQL 用于生产环境。"],
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="shell border-x px-6 py-24 sm:px-12 sm:py-32">
        <div className="max-w-3xl">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-zinc-950 sm:text-7xl">
            {publicSeoPages.home.h1}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-600">
            认证、工作区、多租户 RBAC、SQLite/PostgreSQL 与生产部署骨架已经就位，
            公开页面可静态预渲染，登录后的应用继续保持 SPA。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="button-primary">
              开始构建 <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="button-secondary">
              登录
            </Link>
          </div>
        </div>
      </section>

      <section className="shell border-x border-t px-6 py-10 sm:px-12">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
          构建 SaaS 所需的基础能力
        </h2>
      </section>

      <section className="shell border-x border-t">
        <div className="grid md:grid-cols-2">
          {capabilities.map(([title, description], index) => (
            <div
              key={title}
              className={`min-h-44 p-7 sm:p-9 ${index % 2 === 0 ? "md:border-r" : ""} ${index > 1 ? "border-t" : index === 1 ? "border-t md:border-t-0" : ""}`}
            >
              <div className="mb-5 grid size-7 place-items-center rounded-md border bg-zinc-50 text-zinc-600">
                <Check size={14} />
              </div>
              <h3 className="text-base font-medium text-zinc-950">{title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell border-x border-t px-6 py-16 sm:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Tool page examples
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-950">
            一份配置生成工具页 SEO 与 SSG。
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            示例页默认 noindex，用于演示 Tool Page Schema、面包屑、相关工具和路由级代码拆分。
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-medium text-zinc-700 hover:text-zinc-950"
            to="/tools"
          >
            View tool directory →
          </Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {routableToolPages.map((tool) => (
            <Link
              className="group rounded-xl border p-5 transition hover:border-zinc-400"
              key={tool.slug}
              to={toolPath(tool.slug)}
            >
              <p className="text-xs text-zinc-500">{tool.category}</p>
              <h3 className="mt-2 font-medium text-zinc-950">{tool.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-700">
                Open example <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell border-x border-t px-6 py-20 sm:px-12">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-md text-3xl font-semibold tracking-[-0.035em]">
            公开页面做 SEO，产品后台保持简单。
          </h2>
          <Link to="/register" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
            创建第一个工作区 →
          </Link>
        </div>
      </section>
    </div>
  );
}
