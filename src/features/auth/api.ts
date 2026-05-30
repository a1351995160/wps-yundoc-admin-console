import { httpClient } from '../../shared/api/httpClient'
import type { AdminLoginResult } from './authSession'
import type { CurrentAdmin } from './permissions'

export interface AdminLoginRequest {
  username: string
  password: string
}

export function loginAdmin(request: AdminLoginRequest): Promise<AdminLoginResult> {
  return httpClient.post<AdminLoginResult>('/api/v1/admin/auth/login', request)
}

export function logoutAdmin(): Promise<void> {
  return httpClient.post<void>('/api/v1/admin/auth/logout')
}

export function getCurrentAdmin(): Promise<CurrentAdmin> {
  return httpClient.get<CurrentAdmin>('/api/v1/admin/me')
}
