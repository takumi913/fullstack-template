// AI 任务状态管理
import { create } from "zustand";
import {
  aiApi,
  type AITask,
  type AITaskType,
  type AITaskStatus,
  type TranslateImageRequest,
  type RemoveWatermarkRequest,
} from "@/api/ai";

interface AITaskState {
  // 当前任务
  currentTask: AITask | null;
  // 任务列表
  tasks: AITask[];
  total: number;
  // 加载状态
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;

  // 操作
  translateImage: (req: TranslateImageRequest) => Promise<AITask | null>;
  removeWatermark: (req: RemoveWatermarkRequest) => Promise<AITask | null>;
  pollTaskStatus: (taskId: string) => Promise<AITask | null>;
  startPolling: (taskId: string, onComplete?: (task: AITask) => void) => void;
  stopPolling: () => void;
  fetchTasks: (
    page?: number,
    pageSize?: number,
    type?: AITaskType,
    status?: AITaskStatus
  ) => Promise<void>;
  clearCurrentTask: () => void;
  clearError: () => void;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export const useAITaskStore = create<AITaskState>((set, get) => ({
  currentTask: null,
  tasks: [],
  total: 0,
  isLoading: false,
  isPolling: false,
  error: null,

  // 提交图片翻译任务
  translateImage: async (req) => {
    set({ isLoading: true, error: null });
    try {
      const response = await aiApi.translateImage(req);
      if (response.code === 0 && response.data) {
        set({ currentTask: response.data, isLoading: false });
        return response.data;
      } else {
        set({ error: response.message || "翻译任务创建失败", isLoading: false });
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "网络错误";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // 提交水印去除任务
  removeWatermark: async (req) => {
    set({ isLoading: true, error: null });
    try {
      const response = await aiApi.removeWatermark(req);
      if (response.code === 0 && response.data) {
        set({ currentTask: response.data, isLoading: false });
        return response.data;
      } else {
        set({ error: response.message || "水印去除任务创建失败", isLoading: false });
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "网络错误";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  // 轮询任务状态
  pollTaskStatus: async (taskId) => {
    try {
      const response = await aiApi.getTask(taskId);
      if (response.code === 0 && response.data) {
        set({ currentTask: response.data });
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  // 开始轮询
  startPolling: (taskId, onComplete) => {
    const { stopPolling, pollTaskStatus } = get();
    stopPolling();

    set({ isPolling: true });

    pollingInterval = setInterval(async () => {
      const task = await pollTaskStatus(taskId);
      if (task && (task.status === "completed" || task.status === "failed")) {
        get().stopPolling();
        onComplete?.(task);
      }
    }, 2000); // 每 2 秒轮询一次
  },

  // 停止轮询
  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ isPolling: false });
  },

  // 获取任务列表
  fetchTasks: async (page = 1, pageSize = 20, type, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await aiApi.getTasks({ page, page_size: pageSize, type, status });
      if (response.code === 0 && response.data) {
        set({
          tasks: response.data.tasks || [],
          total: response.data.total,
          isLoading: false,
        });
      } else {
        set({ error: response.message || "获取任务列表失败", isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "网络错误";
      set({ error: message, isLoading: false });
    }
  },

  // 清除当前任务
  clearCurrentTask: () => {
    get().stopPolling();
    set({ currentTask: null });
  },

  // 清除错误
  clearError: () => set({ error: null }),
}));
