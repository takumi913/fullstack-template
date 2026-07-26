import client from "@/lib/client";
import type { ApiResponse } from "@/lib/client";
import type { Tenant, User } from "./user";
export type TenantRole = "owner" | "admin" | "member";
export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  created_at: string;
  updated_at: string;
}
// 成员列表接口额外返回用户信息，对应 Go 侧的 TenantMemberDetail。
export interface TenantMemberDetail extends TenantMember {
  username: string;
  email: string;
  avatar_url: string;
}
export const tenantApi = {
  list: async () => (await client.get<ApiResponse<Tenant[]>>("/api/v1/tenants")).data,
  create: async (data: { name: string; slug: string }) =>
    (await client.post<ApiResponse<Tenant>>("/api/v1/tenants", data)).data,
  update: async (id: string, data: { name: string; slug: string }) =>
    (await client.patch<ApiResponse<Tenant>>(`/api/v1/tenants/${id}`, data)).data,
  remove: async (id: string) =>
    (await client.delete<ApiResponse<null>>(`/api/v1/tenants/${id}`)).data,
  select: async (id: string) =>
    (await client.post<ApiResponse<null>>(`/api/v1/tenants/${id}/select`)).data,
  members: async (id: string) =>
    (await client.get<ApiResponse<TenantMemberDetail[]>>(`/api/v1/tenants/${id}/members`)).data,
  addMember: async (id: string, data: { email: string; role: TenantRole }) =>
    (await client.post<ApiResponse<TenantMember>>(`/api/v1/tenants/${id}/members`, data)).data,
  updateMember: async (id: string, userID: string, role: TenantRole) =>
    (await client.patch<ApiResponse<null>>(`/api/v1/tenants/${id}/members/${userID}`, { role }))
      .data,
  removeMember: async (id: string, userID: string) =>
    (await client.delete<ApiResponse<null>>(`/api/v1/tenants/${id}/members/${userID}`)).data,
};
export type { Tenant, User };
