export type AdminRole = 'SUPER_ADMIN' | 'SYSTEM_ADMIN' | 'AUDITOR' | 'SUPPORT'
export type AdminStatus = 'ENABLED' | 'DISABLED'

export interface CurrentAdmin {
  username: string
  displayName: string
  role: AdminRole
  status: AdminStatus
  superAdmin: boolean
  lastLoginAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: '超级管理员',
  SYSTEM_ADMIN: '系统管理员',
  AUDITOR: '只读审计员',
  SUPPORT: '接入支持人员'
}

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: '可以管理后台用户、业务系统、接口授权和密钥。',
  SYSTEM_ADMIN: '可以管理业务系统和接口授权，不能管理后台用户。',
  AUDITOR: '只能查看后台数据，不能执行写操作。',
  SUPPORT: '用于接入排查，只能查看业务系统和接入指南。'
}

export const STATUS_LABELS: Record<AdminStatus, string> = {
  ENABLED: '启用',
  DISABLED: '停用'
}

export function getRoleLabel(role?: string | null): string {
  return isAdminRole(role) ? ROLE_LABELS[role] : '未知角色'
}

export function getStatusLabel(status?: string | null): string {
  return isAdminStatus(status) ? STATUS_LABELS[status] : '未知状态'
}

export function canManageAdminUsers(admin?: CurrentAdmin | null): boolean {
  return admin?.superAdmin === true || admin?.role === 'SUPER_ADMIN'
}

export function canManageBusinessSystems(admin?: CurrentAdmin | null): boolean {
  return admin?.role === 'SUPER_ADMIN' || admin?.role === 'SYSTEM_ADMIN'
}

export function canManagePermissions(admin?: CurrentAdmin | null): boolean {
  return admin?.role === 'SUPER_ADMIN' || admin?.role === 'SYSTEM_ADMIN'
}

export function canViewPermissions(admin?: CurrentAdmin | null): boolean {
  return admin?.role === 'SUPER_ADMIN' || admin?.role === 'SYSTEM_ADMIN' || admin?.role === 'AUDITOR'
}

function isAdminRole(role?: string | null): role is AdminRole {
  return role === 'SUPER_ADMIN' || role === 'SYSTEM_ADMIN' || role === 'AUDITOR' || role === 'SUPPORT'
}

function isAdminStatus(status?: string | null): status is AdminStatus {
  return status === 'ENABLED' || status === 'DISABLED'
}
