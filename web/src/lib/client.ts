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
  }
);

// 响应拦截器
client.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 直接返回响应，让调用方处理业务逻辑
    return response;
  },
  (error: AxiosError) => {
    // 统一处理错误响应
    let message = "网络错误，请稍后重试";

    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;

      switch (status) {
        case 400:
          message = (data as { message?: string })?.message || "请求参数错误";
          break;
        case 401:
          message = "未授权，请重新登录";
          // 触发未授权事件，由 authStore 处理清除逻辑
          triggerUnauthorized();
          break;
        case 403:
          message = "权限不足";
          break;
        case 404:
          message = "请求的资源不存在";
          break;
        case 500:
          message = "服务器内部错误";
          break;
        default:
          message = (data as { message?: string })?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message = "网络连接超时，请检查网络";
    }

    console.error("API请求错误:", error);
    return Promise.reject(new Error(message));
  }
);

export default client;
