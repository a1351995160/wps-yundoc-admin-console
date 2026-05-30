import { httpClient } from '../../shared/api/httpClient'
import { businessSystemPathSegment } from '../business-systems/api'
import type {
  ApiPermissionDefinition,
  BusinessSystemPermissions,
  PermissionUpdateRequest
} from './types'

export function listApiPermissionDefinitions(): Promise<ApiPermissionDefinition[]> {
  return httpClient.get<ApiPermissionDefinition[]>('/api/v1/admin/api-permission-definitions')
}

export function getBusinessSystemPermissions(
  businessSystemId: string
): Promise<BusinessSystemPermissions> {
  return httpClient.get<BusinessSystemPermissions>(
    `/api/v1/admin/business-systems/${businessSystemPathSegment(businessSystemId)}/api-permissions`
  )
}

export function saveBusinessSystemPermissions(
  businessSystemId: string,
  request: PermissionUpdateRequest
): Promise<BusinessSystemPermissions> {
  return httpClient.put<BusinessSystemPermissions>(
    `/api/v1/admin/business-systems/${businessSystemPathSegment(businessSystemId)}/api-permissions`,
    request
  )
}
