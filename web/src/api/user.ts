// 用户相关API接口
import client from "../lib/client";
import type { ApiResponse } from "../lib/client";

// 登录类型枚举
export type LoginType = "local" | "google";

// 用户角色枚举
export type UserRole = "user" | "admin";

// 用户信息接口
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  login_type: LoginType;
  role: UserRole;
  bio: string;
  created_at?: string;
  updated_at?: string;
}

// 注册请求参数
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 登录请求参数
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应数据
export interface LoginResponse {
  user: User;
}

// Google登录请求参数
export interface GoogleLoginRequest {
  id_token: string;
}

// 更新个人资料请求参数
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  bio?: string;
}

// 修改密码请求参数
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// 用户API
export const userApi = {
  // 用户注册
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await client.post<ApiResponse<User>>(
      "/api/v1/auth/register",
      data
    );
    return response.data;
  },

  // 用户登录
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await client.post<ApiResponse<LoginResponse>>(
      "/api/v1/auth/login",
      data
    );
    return response.data;
  },

  // Google登录
  googleLogin: async (
    data: GoogleLoginRequest
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await client.post<ApiResponse<LoginResponse>>(
      "/api/v1/auth/google",
      data
    );
    return response.data;
  },

  // 用户注销
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await client.post<ApiResponse<null>>(
      "/api/v1/auth/logout"
    );
    return response.data;
  },

  // 获取用户信息
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await client.get<ApiResponse<User>>(
      "/api/v1/user/profile"
    );
    return response.data;
  },

  // 更新个人资料
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ApiResponse<User>> => {
    const response = await client.put<ApiResponse<User>>(
      "/api/v1/user/profile",
      data
    );
    return response.data;
  },

  // 修改密码
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<null>> => {
    const response = await client.post<ApiResponse<null>>(
      "/api/v1/user/change-password",
      data
    );
    return response.data;
  },
};
