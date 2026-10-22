import { createStore } from "solid-js";
import {
  tenantApi,
  type AuthResponse,
  type Tenant,
  type TenantMemberDetail,
  type User,
} from "@/api";

interface TenantState {
  tenants: Tenant[];
  activeTenant: Tenant | null;
  membership: TenantMemberDetail | null;
  members: TenantMemberDetail[];
}

export function createTenantState(currentUser: () => User | null) {
  const [state, setState] = createStore<TenantState>({
    tenants: [],
    activeTenant: null,
    membership: null,
    members: [],
  });
  // 异步响应只属于发起时的会话与工作区；版本号同步更新，不等待 store flush。
  let contextVersion = 0;
  let tenantsRequest = 0;
  let membersRequest = 0;

  function hydrate(auth: AuthResponse) {
    contextVersion++;
    setState((draft) => {
      draft.tenants = auth.tenants;
      draft.activeTenant =
        auth.tenants.find((tenant) => tenant.id === auth.active_tenant_id) ??
        auth.tenants[0] ??
        null;
      // 新会话不能继承上一个用户的角色和成员邮箱。
      draft.membership = null;
      draft.members = [];
    });
  }

  async function loadTenants() {
    const version = contextVersion;
    const request = ++tenantsRequest;
    const response = await tenantApi.list();
    if (version !== contextVersion || request !== tenantsRequest) return;
    const currentID = state.activeTenant?.id;
    const activeTenant =
      response.data.find((tenant) => tenant.id === currentID) ?? response.data[0] ?? null;
    const changedTenant = activeTenant?.id !== currentID;
    if (changedTenant) contextVersion++;
    setState((draft) => {
      draft.tenants = response.data;
      // 使用列表里的新对象，让改名后的工作区立即反映到界面。
      draft.activeTenant = activeTenant;
      if (changedTenant) {
        draft.members = [];
        draft.membership = null;
      }
    });
  }

  async function loadMembers(tenantID: string | null | undefined = state.activeTenant?.id) {
    if (!tenantID) return;
    const version = contextVersion;
    const request = ++membersRequest;
    const response = await tenantApi.members(tenantID);
    if (
      version !== contextVersion ||
      request !== membersRequest ||
      tenantID !== state.activeTenant?.id
    )
      return;
    setState((draft) => {
      draft.members = response.data;
      draft.membership =
        response.data.find((member) => member.user_id === currentUser()?.id) ?? null;
    });
  }

  async function selectTenant(tenant: Tenant) {
    const version = ++contextVersion;
    await tenantApi.select(tenant.id);
    if (version !== contextVersion) return;
    // 切换期间新发起的旧工作区请求也必须失效。
    contextVersion++;
    setState((draft) => {
      draft.activeTenant = tenant;
      draft.membership = null;
      draft.members = [];
    });
    // Solid 2 的写入在下一次 flush 才可读，直接把本次选择传给成员请求。
    await loadMembers(tenant.id);
  }

  function reset() {
    contextVersion++;
    setState((draft) => {
      draft.tenants = [];
      draft.activeTenant = null;
      draft.membership = null;
      draft.members = [];
    });
  }

  return { state, hydrate, loadTenants, selectTenant, loadMembers, reset };
}
