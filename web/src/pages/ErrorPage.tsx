import { Link, useRouteError } from "react-router-dom";

// 路由级错误边界。没有它时，任何渲染期抛错都会让页面变成一片空白。
export default function ErrorPage() {
  const error = useRouteError();
  const detail = error instanceof Error ? error.message : String(error ?? "");

  return (
    <div className="grid min-h-[calc(100vh-113px)] place-items-center px-5 py-16">
      <div className="w-full max-w-[440px] text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-950">页面出错了</h1>
        <p className="mt-2 text-sm text-zinc-500">抱歉，这个页面无法正常显示。</p>
        {detail && (
          <p className="mt-4 break-words rounded border bg-zinc-50 p-3 text-left text-xs text-zinc-600">
            {detail}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <button className="button-primary" onClick={() => window.location.reload()}>
            重新加载
          </button>
          <Link className="self-center text-zinc-500 hover:text-zinc-950" to="/">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
