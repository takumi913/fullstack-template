// 钱包状态管理
import { create } from "zustand";
import { walletApi } from "@/api";
import type { Wallet, Transaction, PricingTier, TransactionType } from "@/api";

// 钱包状态接口
interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  transactionsTotal: number;
  pricingTiers: PricingTier[];
  isLoading: boolean;
  error: string | null;

  // 操作方法
  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number, pageSize?: number, type?: TransactionType) => Promise<void>;
  fetchPricing: () => Promise<void>;
  topup: (amount: number, provider: "stripe" | "creem") => Promise<string | null>;
  clearWallet: () => void;
}

// 创建钱包状态store
export const useWalletStore = create<WalletState>()((set) => ({
  wallet: null,
  transactions: [],
  transactionsTotal: 0,
  pricingTiers: [],
  isLoading: false,
  error: null,

  // 获取钱包余额
  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletApi.getBalance();
      if (response.code === 0 && response.data) {
        set({ wallet: response.data });
      } else {
        set({ error: response.message || "获取余额失败" });
      }
    } catch (error) {
      set({ error: "网络错误，请稍后重试" });
    } finally {
      set({ isLoading: false });
    }
  },

  // 获取交易记录
  fetchTransactions: async (page = 1, pageSize = 20, type?: TransactionType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletApi.getTransactions({ page, page_size: pageSize, type });
      if (response.code === 0 && response.data) {
        set({
          transactions: response.data.transactions || [],
          transactionsTotal: response.data.total,
        });
      } else {
        set({ error: response.message || "获取交易记录失败" });
      }
    } catch (error) {
      set({ error: "网络错误，请稍后重试" });
    } finally {
      set({ isLoading: false });
    }
  },

  // 获取定价列表
  fetchPricing: async () => {
    try {
      const response = await walletApi.getPricing();
      if (response.code === 0 && response.data) {
        set({ pricingTiers: response.data });
      }
    } catch (error) {
      console.error("获取定价失败:", error);
    }
  },

  // 发起充值
  topup: async (amount: number, provider: "stripe" | "creem") => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletApi.topup({ amount, provider });
      if (response.code === 0 && response.data) {
        return response.data.checkout_url;
      } else {
        set({ error: response.message || "创建支付订单失败" });
        return null;
      }
    } catch (error) {
      set({ error: "网络错误，请稍后重试" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // 清除钱包状态
  clearWallet: () => {
    set({
      wallet: null,
      transactions: [],
      transactionsTotal: 0,
      error: null,
    });
  },
}));
