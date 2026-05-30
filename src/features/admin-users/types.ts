import type { AdminRole, AdminStatus } from '../auth/permissions'

export type ManagedAdminRole = Exclude<AdminRole, 'SUPER_ADMIN'>

export interface AdminUser {
  username: string
  displayName: string
  role: ManagedAdminRole
  status: AdminStatus
  lastLoginAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AdminUserListResponse {
  items: AdminUser[]
  hasMore: boolean
}

export interface AdminUserListParams {
  keyword?: string
  role?: ManagedAdminRole | ''
  status?: AdminStatus | ''
  page?: number
  pageSize?: number
}

export interface AdminUserCreateRequest {
  username: string
  displayName: string
  role: ManagedAdminRole
  initialPassword: string
}

export interface AdminUserUpdateRequest {
  displayName: string
  role: ManagedAdminRole
  status: AdminStatus
}
