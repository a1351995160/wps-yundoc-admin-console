import { httpClient } from '../../shared/api/httpClient'
import { buildListSearch, normalizeListParams } from '../../shared/api/listQuery'
import type {
  AdminUser,
  AdminUserCreateRequest,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserUpdateRequest
} from './types'

export const adminUserQueryKeys = {
  all: ['admin-users'] as const,
  list: (params: AdminUserListParams) => [...adminUserQueryKeys.all, normalizeListParams(params)] as const
}

export function listAdminUsers(params: AdminUserListParams): Promise<AdminUserListResponse> {
  return httpClient.get<AdminUserListResponse>(`/api/v1/admin/users?${buildListSearch(params)}`)
}

export function createAdminUser(request: AdminUserCreateRequest): Promise<AdminUser> {
  return httpClient.post<AdminUser>('/api/v1/admin/users', request)
}

export function updateAdminUser(
  username: string,
  request: AdminUserUpdateRequest
): Promise<AdminUser> {
  return httpClient.patch<AdminUser>(`/api/v1/admin/users/${encodeURIComponent(username)}`, request)
}
