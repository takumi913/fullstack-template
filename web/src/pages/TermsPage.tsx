import { SettingsPage } from "./ProfileSettingsPage";
export default function TermsPage() {
  return (
    <SettingsPage title="服务条款" description="最后更新：2026 年 7 月 22 日">
      <article className="max-w-2xl space-y-8 text-sm leading-7 text-zinc-600">
        <section>
          <h2 className="font-medium text-zinc-950">模板用途</h2>
          <p className="mt-2">
            本项目提供基础工程结构。部署者需要为最终产品补充适用的服务条款、隐私声明和运营规则。
          </p>
        </section>
        <section>
          <h2 className="font-medium text-zinc-950">账户责任</h2>
          <p className="mt-2">用户应妥善保管账户凭据，并对其工作区中的操作负责。</p>
        </section>
        <section>
          <h2 className="font-medium text-zinc-950">变更</h2>
          <p className="mt-2">实际产品的功能、费用或政策发生变化时，应同步更新本页面。</p>
        </section>
      </article>
    </SettingsPage>
  );
}
