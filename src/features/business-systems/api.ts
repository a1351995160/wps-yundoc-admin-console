import { httpClient } from '../../shared/api/httpClient'
import type {
  BusinessSystem,
  BusinessSystemCreateRequest,
  BusinessSystemCreateResponse,
  BusinessSystemListResponse,
  BusinessSystemSecretResponse,
  BusinessSystemStatus,
  BusinessSystemUpdateRequest
} from './types'

interface ListParams {
  keyword?: string
  status?: BusinessSystemStatus | ''
  page?: number
  pageSize?: number
}

export function listBusinessSystems(params: ListParams): Promise<BusinessSystemListResponse> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('pageSize', String(params.pageSize ?? 20))
  if (params.keyword) {
    search.set('keyword', params.keyword)
  }
  if (params.status) {
    search.set('status', params.status)
  }
  return httpClient.get<BusinessSystemListResponse>(`/api/v1/admin/business-systems?${search}`)
}

export function createBusinessSystem(
  request: BusinessSystemCreateRequest
): Promise<BusinessSystemCreateResponse> {
  return httpClient.post<BusinessSystemCreateResponse>('/api/v1/admin/business-systems', request)
}

export function getBusinessSystem(businessSystemId: string): Promise<BusinessSystem> {
  return httpClient.get<BusinessSystem>(`/api/v1/admin/business-systems/${businessSystemId}`)
}

export function updateBusinessSystem(
  businessSystemId: string,
  request: BusinessSystemUpdateRequest
): Promise<BusinessSystem> {
  return httpClient.patch<BusinessSystem>(
    `/api/v1/admin/business-systems/${businessSystemId}`,
    request
  )
}

export function resetClientSecret(businessSystemId: string): Promise<BusinessSystemSecretResponse> {
  return httpClient.post<BusinessSystemSecretResponse>(
    `/api/v1/admin/business-systems/${businessSystemId}/client-secret:reset`
  )
}
