import type { CurrentAdmin } from '../features/auth/permissions'
import { ADMIN_SESSION_KEY } from '../features/auth/authSession'

export const superAdmin: CurrentAdmin = {
  username: 'admin',
  displayName: '超级管理员',
  role: 'SUPER_ADMIN',
  status: 'ENABLED',
  superAdmin: true,
  lastLoginAt: null,
  createdAt: null,
  updatedAt: null
}

export const systemAdmin: CurrentAdmin = {
  username: 'system01',
  displayName: '系统管理员',
  role: 'SYSTEM_ADMIN',
  status: 'ENABLED',
  superAdmin: false,
  lastLoginAt: null,
  createdAt: null,
  updatedAt: null
}

export const auditor: CurrentAdmin = {
  username: 'audit01',
  displayName: '只读审计员',
  role: 'AUDITOR',
  status: 'ENABLED',
  superAdmin: false,
  lastLoginAt: null,
  createdAt: null,
  updatedAt: null
}

export function saveTestAdminSession() {
  sessionStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      expiresAt: Date.now() + 1_800_000
    })
  )
}

export function apiResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ success: status < 400, data }), { status })
}

export function apiError(code: string, message: string, status = 400): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code, message }
    }),
    { status }
  )
}
