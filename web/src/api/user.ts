import client from "@/lib/client";
import type { ApiResponse } from "@/lib/client";
export interface User { id:string; username:string; email:string; avatar_url:string; status:"active"|"disabled" }
export interface Tenant { id:string; name:string; slug:string; created_by:string; created_at:string; updated_at:string }
export interface AuthResponse { user:User; tenants:Tenant[]; active_tenant_id:string|null }
export interface RegisterRequest { username:string; email:string; password:string }
export interface LoginRequest { email:string; password:string }
export const userApi={
 register:async(data:RegisterRequest)=>(await client.post<ApiResponse<AuthResponse>>("/api/v1/auth/register",data)).data,
 login:async(data:LoginRequest)=>(await client.post<ApiResponse<AuthResponse>>("/api/v1/auth/login",data)).data,
 logout:async()=>(await client.post<ApiResponse<null>>("/api/v1/auth/logout")).data,
 session:async()=>(await client.get<ApiResponse<AuthResponse>>("/api/v1/auth/session")).data,
 profile:async()=>(await client.get<ApiResponse<User>>("/api/v1/user/profile")).data,
 updateProfile:async(data:Partial<Pick<User,"username"|"email"|"avatar_url">>)=>(await client.patch<ApiResponse<User>>("/api/v1/user/profile",data)).data,
 changePassword:async(data:{old_password:string;new_password:string})=>(await client.post<ApiResponse<null>>("/api/v1/user/change-password",data)).data,
};
