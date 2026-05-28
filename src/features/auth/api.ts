import { httpClient } from '../../shared/api/httpClient'
import type { AdminLoginResult } from './authSession'

export interface AdminLoginRequest {
  username: string
  password: string
}

export function loginAdmin(request: AdminLoginRequest): Promise<AdminLoginResult> {
  return httpClient.post<AdminLoginResult>('/api/v1/admin/auth/login', request)
}
