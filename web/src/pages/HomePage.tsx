import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

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
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-zinc-950 sm:text-7xl">基础设施</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-600">一个克制的多租户全栈起点。认证、权限和数据库结构已经就位，剩下的空间留给你的产品。</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="button-primary">开始构建 <ArrowRight size={15} /></Link>
            <Link to="/login" className="button-secondary">登录</Link>
          </div>
        </div>
      </section>

      <section className="shell border-x border-t">
        <div className="grid md:grid-cols-2">
          {capabilities.map(([title, description], index) => (
            <div key={title} className={`min-h-44 p-7 sm:p-9 ${index % 2 === 0 ? "md:border-r" : ""} ${index > 1 ? "border-t" : index === 1 ? "border-t md:border-t-0" : ""}`}>
              <div className="mb-5 grid size-7 place-items-center rounded-md border bg-zinc-50 text-zinc-600"><Check size={14} /></div>
              <h3 className="text-base font-medium text-zinc-950">{title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell border-x border-t px-6 py-20 sm:px-12">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-md text-3xl font-semibold tracking-[-0.035em]">保持简单，保持可扩展。</h2>
          <Link to="/register" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">创建第一个工作区 →</Link>
        </div>
      </section>
    </div>
  );
}
