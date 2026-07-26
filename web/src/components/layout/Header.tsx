import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white">
      <div className="shell flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
          <span className="grid size-5 place-items-center rounded-[4px] bg-zinc-900 text-[10px] text-white">
            F
          </span>
          Fullstack
        </Link>
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                to="/dashboard"
              >
                Dashboard
              </Link>
              <button
                className="rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                // 登出请求失败也要离开当前页：本地会话状态已清空，
                // 停留在原地会让用户看到一个自己已无权访问的页面。
                onClick={() => {
                  logout()
                    .catch(() => {})
                    .finally(() => navigate("/"));
                }}
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                to="/login"
              >
                登录
              </Link>
              <Link className="button-primary min-h-9 px-3" to="/register">
                创建账号
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
