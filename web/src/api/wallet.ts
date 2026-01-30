// 钱包相关API接口
import client from "../lib/client";
import type { ApiResponse } from "../lib/client";

// 钱包信息接口
export interface Wallet {
  id: string;
  balance: string;
  currency: string;
}

// 交易类型
export type TransactionType = "topup" | "consume" | "refund" | "gift" | "transfer";

// 交易状态
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

// 交易记录接口
export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  reference: string;
  created_at: string;
}

// 交易列表响应
export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

// 交易列表请求参数
export interface TransactionListRequest {
  page?: number;
  page_size?: number;
  type?: TransactionType;
}

// 支付提供商
export type PaymentProvider = "stripe" | "creem";

// 充值请求参数
export interface TopupRequest {
  amount: number;
  provider: PaymentProvider;
}

// 充值响应
export interface TopupResponse {
  payment_id: string;
  checkout_url: string;
}

// 定价层级
export interface PricingTier {
  amount: string;
  credits: string;
  bonus_rate: number;
  description: string;
  popular: boolean;
}

// 钱包API
export const walletApi = {
  // 获取钱包余额
  getBalance: async (): Promise<ApiResponse<Wallet>> => {
    const response = await client.get<ApiResponse<Wallet>>("/api/v1/wallet");
    return response.data;
  },

  // 获取交易记录
  getTransactions: async (
    params?: TransactionListRequest
  ): Promise<ApiResponse<TransactionListResponse>> => {
    const response = await client.get<ApiResponse<TransactionListResponse>>(
      "/api/v1/wallet/transactions",
      { params }
    );
    return response.data;
  },

  // 发起充值
  topup: async (data: TopupRequest): Promise<ApiResponse<TopupResponse>> => {
    const response = await client.post<ApiResponse<TopupResponse>>(
      "/api/v1/wallet/topup",
      data
    );
    return response.data;
  },

  // 获取定价列表
  getPricing: async (): Promise<ApiResponse<PricingTier[]>> => {
    const response = await client.get<ApiResponse<PricingTier[]>>(
      "/api/v1/pricing"
    );
    return response.data;
  },
};
