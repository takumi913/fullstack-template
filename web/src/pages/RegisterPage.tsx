import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { AuthCard, Input } from "./LoginPage";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, pending, run } = useAsyncAction();
  const register = useAuthStore((state) => state.register);
  const hydrate = useTenantStore((state) => state.hydrate);
  const navigate = useNavigate();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      hydrate(await register({ username, email, password }));
      navigate("/dashboard");
    });
  }

  return (
    <AuthCard title="创建账号" description="注册后会自动建立你的第一个工作区。">
      <form onSubmit={submit} className="space-y-4">
        <Input label="用户名" value={username} onChange={setUsername} />
        <Input label="邮箱" type="email" value={email} onChange={setEmail} />
        <Input label="密码" type="password" value={password} onChange={setPassword} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="button-primary mt-1 w-full" disabled={pending}>
          {pending ? "创建中…" : "创建账号"}
        </button>
        <p className="pt-2 text-center text-sm text-zinc-500">
          已有账号？{" "}
          <Link className="font-medium text-zinc-900 hover:underline" to="/login">
            登录
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
