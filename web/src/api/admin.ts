// 管理员相关API接口
import client from "../lib/client";
import type { ApiResponse } from "../lib/client";

// Provider 类型
export type ProviderType = "llm" | "image";

// AI Provider 接口
export interface AIProvider {
  id: string;
  name: string;
  display_name: string;
  type: ProviderType;
  base_url: string;
  has_api_key: boolean;
  is_enabled: boolean;
  priority: number;
  config: string;
  created_at: string;
  updated_at: string;
}

// AI Model 接口
export interface AIModel {
  id: string;
  provider_id: string;
  name: string;
  display_name: string;
  credits_per_use: number;
  is_enabled: boolean;
  is_default: boolean;
  config: string;
  created_at: string;
  updated_at: string;
  provider?: AIProvider;
}

// 公开的 AI Model 接口
export interface PublicAIModel {
  id: string;
  name: string;
  display_name: string;
  credits_per_use: number;
  provider_name: string;
}

// 仪表板统计数据
export interface DashboardStats {
  total_users: number;
  registered_paying_users: number;
  guest_paying_users: number;
  total_orders: number;
  total_order_amount: string;
  today_new_users: number;
  today_revenue: string;
}

// 每日统计数据
export interface DailyStats {
  date: string;
  count: number;
  value?: string;
}

// 创建 Provider 请求
export interface CreateProviderRequest {
  name: string;
  display_name: string;
  type: ProviderType;
  base_url?: string;
  api_key?: string;
  is_enabled: boolean;
  priority: number;
  config?: string;
}

// 更新 Provider 请求
export interface UpdateProviderRequest {
  display_name?: string;
  type?: ProviderType;
  base_url?: string;
  api_key?: string;
  is_enabled?: boolean;
  priority?: number;
  config?: string;
}

// 创建 Model 请求
export interface CreateModelRequest {
  provider_id: string;
  name: string;
  display_name: string;
  credits_per_use: number;
  is_enabled: boolean;
  is_default: boolean;
  config?: string;
}

// 更新 Model 请求
export interface UpdateModelRequest {
  provider_id?: string;
  name?: string;
  display_name?: string;
  credits_per_use?: number;
  is_enabled?: boolean;
  is_default?: boolean;
  config?: string;
}

// 管理员 API
export const adminApi = {
  // 获取仪表板统计
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await client.get<ApiResponse<DashboardStats>>(
      "/api/v1/admin/stats"
    );
    return response.data;
  },

  // 获取用户增长趋势
  getUserGrowth: async (days = 30): Promise<ApiResponse<DailyStats[]>> => {
    const response = await client.get<ApiResponse<DailyStats[]>>(
      `/api/v1/admin/stats/users?days=${days}`
    );
    return response.data;
  },

  // 获取收入增长趋势
  getRevenueGrowth: async (days = 30): Promise<ApiResponse<DailyStats[]>> => {
    const response = await client.get<ApiResponse<DailyStats[]>>(
      `/api/v1/admin/stats/revenue?days=${days}`
    );
    return response.data;
  },

  // Provider CRUD
  createProvider: async (
    data: CreateProviderRequest
  ): Promise<ApiResponse<AIProvider>> => {
    const response = await client.post<ApiResponse<AIProvider>>(
      "/api/v1/admin/providers",
      data
    );
    return response.data;
  },

  listProviders: async (): Promise<ApiResponse<AIProvider[]>> => {
    const response = await client.get<ApiResponse<AIProvider[]>>(
      "/api/v1/admin/providers"
    );
    return response.data;
  },

  getProvider: async (id: string): Promise<ApiResponse<AIProvider>> => {
    const response = await client.get<ApiResponse<AIProvider>>(
      `/api/v1/admin/providers/${id}`
    );
    return response.data;
  },

  updateProvider: async (
    id: string,
    data: UpdateProviderRequest
  ): Promise<ApiResponse<AIProvider>> => {
    const response = await client.put<ApiResponse<AIProvider>>(
      `/api/v1/admin/providers/${id}`,
      data
    );
    return response.data;
  },

  deleteProvider: async (id: string): Promise<ApiResponse<null>> => {
    const response = await client.delete<ApiResponse<null>>(
      `/api/v1/admin/providers/${id}`
    );
    return response.data;
  },

  toggleProvider: async (id: string): Promise<ApiResponse<AIProvider>> => {
    const response = await client.patch<ApiResponse<AIProvider>>(
      `/api/v1/admin/providers/${id}/toggle`
    );
    return response.data;
  },

  // Model CRUD
  createModel: async (
    data: CreateModelRequest
  ): Promise<ApiResponse<AIModel>> => {
    const response = await client.post<ApiResponse<AIModel>>(
      "/api/v1/admin/models",
      data
    );
    return response.data;
  },

  listModels: async (): Promise<ApiResponse<AIModel[]>> => {
    const response = await client.get<ApiResponse<AIModel[]>>(
      "/api/v1/admin/models"
    );
    return response.data;
  },

  getModel: async (id: string): Promise<ApiResponse<AIModel>> => {
    const response = await client.get<ApiResponse<AIModel>>(
      `/api/v1/admin/models/${id}`
    );
    return response.data;
  },

  updateModel: async (
    id: string,
    data: UpdateModelRequest
  ): Promise<ApiResponse<AIModel>> => {
    const response = await client.put<ApiResponse<AIModel>>(
      `/api/v1/admin/models/${id}`,
      data
    );
    return response.data;
  },

  deleteModel: async (id: string): Promise<ApiResponse<null>> => {
    const response = await client.delete<ApiResponse<null>>(
      `/api/v1/admin/models/${id}`
    );
    return response.data;
  },

  toggleModel: async (id: string): Promise<ApiResponse<AIModel>> => {
    const response = await client.patch<ApiResponse<AIModel>>(
      `/api/v1/admin/models/${id}/toggle`
    );
    return response.data;
  },

  // 公开 API - 获取启用的模型列表
  getPublicModels: async (
    type: ProviderType = "image"
  ): Promise<ApiResponse<PublicAIModel[]>> => {
    const response = await client.get<ApiResponse<PublicAIModel[]>>(
      `/api/v1/ai/models?type=${type}`
    );
    return response.data;
  },
};
