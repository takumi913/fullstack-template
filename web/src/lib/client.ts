// HTTP客户端配置，基于axios
import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { triggerUnauthorized } from "./auth-events";

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// 统一的API响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 接口错误。保留 status 和业务 code，调用方才能按状态码分支处理
// （例如区分 409 冲突和 422 校验失败），而不是只拿到一句文案。
export class ApiError extends Error {
  readonly status: number;
  readonly code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// 创建axios实例
const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 启用cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    // 不再需要手动设置Authorization头，因为使用了cookie
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
client.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 直接返回响应，让调用方处理业务逻辑
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      // 请求已发出但没有收到响应
      const message = error.request ? "网络连接超时，请检查网络" : "网络错误，请稍后重试";
      return Promise.reject(new ApiError(message, 0));
    }

    const { status, data } = error.response;
    const body = data as { message?: string; code?: number } | undefined;

    if (status === 401) {
      // 触发未授权事件，由 authStore 处理清除逻辑
      triggerUnauthorized();
    }

    // 优先使用服务端返回的文案：后端已经对 5xx 做过脱敏，
    // 403 之类的拒绝原因也比前端硬编码的"权限不足"更具体。
    const fallback: Record<number, string> = {
      401: "未授权，请重新登录",
      404: "请求的资源不存在",
    };
    const message = body?.message || fallback[status] || `请求失败 (${status})`;

    return Promise.reject(new ApiError(message, status, body?.code));
  },
);

export default client;
