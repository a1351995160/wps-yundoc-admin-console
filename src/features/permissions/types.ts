import type { BusinessSystem } from '../business-systems/types'

export type PermissionIdentityType = 'APP' | 'USER'

export interface ApiPermissionDefinition {
  apiCode: string
  identityType: PermissionIdentityType
  displayName: string
  description: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface PermissionUpdateRequest {
  apiPermissions: string[]
}

export type BusinessSystemPermissions = BusinessSystem
