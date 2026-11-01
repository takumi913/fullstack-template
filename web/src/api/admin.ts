import client from "@/lib/client";
import type { ApiResponse } from "@/lib/client";
import type { User } from "./user";

export interface UserPage {
  items: User[];
  pagination: { page: number; page_size: number; total: number };
}

export const adminApi = {
  listUsers: async (params: { query: string; page: number; page_size: number }) =>
    (await client.get<ApiResponse<UserPage>>("/api/v1/admin/users", { params })).data,
  updateUser: async (id: string, data: Pick<User, "status">) =>
    (await client.patch<ApiResponse<User>>(`/api/v1/admin/users/${id}`, data)).data,
};
