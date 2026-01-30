// API统一导出文件
export * from "./user";
export * from "./system";
export * from "./wallet";
export * from "./admin";

// 重新导出类型和客户端
export type { ApiResponse } from "../lib/client";
export { default as client } from "../lib/client";
