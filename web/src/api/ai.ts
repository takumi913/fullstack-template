// AI 任务相关 API 接口
import client from "../lib/client";
import type { ApiResponse } from "../lib/client";

// AI 任务类型
export type AITaskType = "translate" | "watermark";

// AI 任务状态
export type AITaskStatus = "pending" | "processing" | "completed" | "failed";

// AI 任务接口
export interface AITask {
  id: string;
  type: AITaskType;
  status: AITaskStatus;
  input_url: string;
  output_url?: string;
  source_lang?: string;
  target_lang?: string;
  credits_cost: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// 图片翻译请求
export interface TranslateImageRequest {
  image_url: string;
  source_lang: string;
  target_lang: string;
  model_id?: string; // 可选，指定使用的模型
}

// 水印去除请求
export interface RemoveWatermarkRequest {
  image_url: string;
  model_id?: string; // 可选，指定使用的模型
}

// AI 任务列表响应
export interface AITaskListResponse {
  tasks: AITask[];
  total: number;
  page: number;
  page_size: number;
}

// AI 任务列表请求参数
export interface AITaskListRequest {
  page?: number;
  page_size?: number;
  type?: AITaskType;
  status?: AITaskStatus;
}

// 支持的语言
export const SUPPORTED_LANGUAGES = [
  { code: "auto", name: "Auto Detect" },
  { code: "en", name: "English" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
] as const;

// AI API
export const aiApi = {
  // 提交图片翻译任务
  translateImage: async (
    data: TranslateImageRequest
  ): Promise<ApiResponse<AITask>> => {
    const response = await client.post<ApiResponse<AITask>>(
      "/api/v1/ai/translate-image",
      data
    );
    return response.data;
  },

  // 提交水印去除任务
  removeWatermark: async (
    data: RemoveWatermarkRequest
  ): Promise<ApiResponse<AITask>> => {
    const response = await client.post<ApiResponse<AITask>>(
      "/api/v1/ai/remove-watermark",
      data
    );
    return response.data;
  },

  // 获取任务详情（带轮询状态更新）
  getTask: async (taskId: string): Promise<ApiResponse<AITask>> => {
    const response = await client.get<ApiResponse<AITask>>(
      `/api/v1/ai/task/${taskId}`
    );
    return response.data;
  },

  // 获取任务列表
  getTasks: async (
    params?: AITaskListRequest
  ): Promise<ApiResponse<AITaskListResponse>> => {
    const response = await client.get<ApiResponse<AITaskListResponse>>(
      "/api/v1/ai/tasks",
      { params }
    );
    return response.data;
  },
};
