import { httpClient } from '../../shared/api/httpClient'
import { buildListSearch, normalizeListParams } from '../../shared/api/listQuery'
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

export const businessSystemQueryKeys = {
  all: ['business-systems'] as const,
  list: (params: ListParams) => [...businessSystemQueryKeys.all, normalizeListParams(params)] as const
}

export function listBusinessSystems(params: ListParams): Promise<BusinessSystemListResponse> {
  return httpClient.get<BusinessSystemListResponse>(
    `/api/v1/admin/business-systems?${buildListSearch(params)}`
  )
}

export function createBusinessSystem(
  request: BusinessSystemCreateRequest
): Promise<BusinessSystemCreateResponse> {
  return httpClient.post<BusinessSystemCreateResponse>('/api/v1/admin/business-systems', request)
}

export function getBusinessSystem(businessSystemId: string): Promise<BusinessSystem> {
  return httpClient.get<BusinessSystem>(
    `/api/v1/admin/business-systems/${businessSystemPathSegment(businessSystemId)}`
  )
}

export function updateBusinessSystem(
  businessSystemId: string,
  request: BusinessSystemUpdateRequest
): Promise<BusinessSystem> {
  return httpClient.patch<BusinessSystem>(
    `/api/v1/admin/business-systems/${businessSystemPathSegment(businessSystemId)}`,
    request
  )
}

export function resetClientSecret(businessSystemId: string): Promise<BusinessSystemSecretResponse> {
  return httpClient.post<BusinessSystemSecretResponse>(
    `/api/v1/admin/business-systems/${businessSystemPathSegment(businessSystemId)}/client-secret:reset`
  )
}

export function businessSystemPathSegment(businessSystemId: string): string {
  return encodeURIComponent(businessSystemId)
}
