// 系统相关API接口
import client from "../lib/client";
import type { ApiResponse } from "../lib/client";

// 系统API
export const systemApi = {
  // 健康检查
  health: async (): Promise<ApiResponse<null>> => {
    const response = await client.get<ApiResponse<null>>("/api/v1/health");
    return response.data;
  },
};
