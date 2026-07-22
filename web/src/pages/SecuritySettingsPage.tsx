import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Input } from "./LoginPage";
import { SettingsPage } from "./ProfileSettingsPage";

export default function SecuritySettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  async function submit(event: React.FormEvent) { event.preventDefault(); await userApi.changePassword({ old_password: oldPassword, new_password: newPassword }); clearAuth(); navigate("/login"); }
  return <SettingsPage title="账号安全" description="修改密码后，所有登录会话都会失效。"><form onSubmit={submit} className="panel max-w-2xl p-6"><div className="space-y-5"><Input label="当前密码" type="password" value={oldPassword} onChange={setOldPassword}/><Input label="新密码" type="password" value={newPassword} onChange={setNewPassword}/></div><div className="mt-6 border-t pt-5"><button className="button-primary">更新密码</button></div></form></SettingsPage>;
}
