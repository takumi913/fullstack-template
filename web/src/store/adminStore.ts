// 管理员状态管理
import { create } from "zustand";
import { adminApi } from "@/api/admin";
import type {
  DashboardStats,
  DailyStats,
  AIProvider,
  AIModel,
  CreateProviderRequest,
  UpdateProviderRequest,
  CreateModelRequest,
  UpdateModelRequest,
} from "@/api/admin";

interface AdminState {
  // 统计数据
  stats: DashboardStats | null;
  userGrowth: DailyStats[];
  revenueGrowth: DailyStats[];

  // Provider 和 Model
  providers: AIProvider[];
  models: AIModel[];

  // 加载状态
  loading: boolean;
  error: string | null;

  // 统计相关方法
  fetchDashboardStats: () => Promise<void>;
  fetchUserGrowth: (days?: number) => Promise<void>;
  fetchRevenueGrowth: (days?: number) => Promise<void>;

  // Provider 方法
  fetchProviders: () => Promise<void>;
  createProvider: (data: CreateProviderRequest) => Promise<AIProvider>;
  updateProvider: (
    id: string,
    data: UpdateProviderRequest
  ) => Promise<AIProvider>;
  deleteProvider: (id: string) => Promise<void>;
  toggleProvider: (id: string) => Promise<void>;

  // Model 方法
  fetchModels: () => Promise<void>;
  createModel: (data: CreateModelRequest) => Promise<AIModel>;
  updateModel: (id: string, data: UpdateModelRequest) => Promise<AIModel>;
  deleteModel: (id: string) => Promise<void>;
  toggleModel: (id: string) => Promise<void>;

  // 清除错误
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  userGrowth: [],
  revenueGrowth: [],
  providers: [],
  models: [],
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adminApi.getDashboardStats();
      if (response.code === 0) {
        set({ stats: response.data });
      } else {
        set({ error: response.message });
      }
    } catch (err) {
      set({ error: "获取统计数据失败" });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserGrowth: async (days = 30) => {
    try {
      const response = await adminApi.getUserGrowth(days);
      if (response.code === 0) {
        set({ userGrowth: response.data || [] });
      }
    } catch {
      console.error("获取用户增长数据失败");
    }
  },

  fetchRevenueGrowth: async (days = 30) => {
    try {
      const response = await adminApi.getRevenueGrowth(days);
      if (response.code === 0) {
        set({ revenueGrowth: response.data || [] });
      }
    } catch {
      console.error("获取收入增长数据失败");
    }
  },

  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adminApi.listProviders();
      if (response.code === 0) {
        set({ providers: response.data || [] });
      } else {
        set({ error: response.message });
      }
    } catch {
      set({ error: "获取 Provider 列表失败" });
    } finally {
      set({ loading: false });
    }
  },

  createProvider: async (data: CreateProviderRequest) => {
    const response = await adminApi.createProvider(data);
    if (response.code === 0 && response.data) {
      set({ providers: [...get().providers, response.data] });
      return response.data;
    }
    throw new Error(response.message);
  },

  updateProvider: async (id: string, data: UpdateProviderRequest) => {
    const response = await adminApi.updateProvider(id, data);
    if (response.code === 0 && response.data) {
      set({
        providers: get().providers.map((p) =>
          p.id === id ? response.data! : p
        ),
      });
      return response.data;
    }
    throw new Error(response.message);
  },

  deleteProvider: async (id: string) => {
    const response = await adminApi.deleteProvider(id);
    if (response.code === 0) {
      set({ providers: get().providers.filter((p) => p.id !== id) });
    } else {
      throw new Error(response.message);
    }
  },

  toggleProvider: async (id: string) => {
    const response = await adminApi.toggleProvider(id);
    if (response.code === 0 && response.data) {
      set({
        providers: get().providers.map((p) =>
          p.id === id ? response.data! : p
        ),
      });
    } else {
      throw new Error(response.message);
    }
  },

  fetchModels: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adminApi.listModels();
      if (response.code === 0) {
        set({ models: response.data || [] });
      } else {
        set({ error: response.message });
      }
    } catch {
      set({ error: "获取 Model 列表失败" });
    } finally {
      set({ loading: false });
    }
  },

  createModel: async (data: CreateModelRequest) => {
    const response = await adminApi.createModel(data);
    if (response.code === 0 && response.data) {
      set({ models: [...get().models, response.data] });
      return response.data;
    }
    throw new Error(response.message);
  },

  updateModel: async (id: string, data: UpdateModelRequest) => {
    const response = await adminApi.updateModel(id, data);
    if (response.code === 0 && response.data) {
      set({
        models: get().models.map((m) => (m.id === id ? response.data! : m)),
      });
      return response.data;
    }
    throw new Error(response.message);
  },

  deleteModel: async (id: string) => {
    const response = await adminApi.deleteModel(id);
    if (response.code === 0) {
      set({ models: get().models.filter((m) => m.id !== id) });
    } else {
      throw new Error(response.message);
    }
  },

  toggleModel: async (id: string) => {
    const response = await adminApi.toggleModel(id);
    if (response.code === 0 && response.data) {
      set({
        models: get().models.map((m) => (m.id === id ? response.data! : m)),
      });
    } else {
      throw new Error(response.message);
    }
  },

  clearError: () => set({ error: null }),
}));
