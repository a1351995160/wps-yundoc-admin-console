export type BusinessSystemStatus = 'ENABLED' | 'DISABLED'

export interface BusinessSystem {
  businessSystemId: string
  businessSystemName: string
  clientId: string
  status: BusinessSystemStatus
  tokenVersion: number
  permissionVersion: number
  jwtTtlSeconds: number
  description?: string | null
  apiPermissions?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface BusinessSystemListResponse {
  items: BusinessSystem[]
  hasMore: boolean
}

export interface BusinessSystemCreateRequest {
  businessSystemId?: string
  businessSystemName: string
  jwtTtlSeconds: number
  description?: string
}

export interface BusinessSystemCreateResponse {
  businessSystem: BusinessSystem
  clientSecret: string
}

export interface BusinessSystemUpdateRequest {
  businessSystemName: string
  status: BusinessSystemStatus
  jwtTtlSeconds: number
  description?: string
}

export interface BusinessSystemSecretResponse {
  businessSystemId: string
  clientId: string
  clientSecret: string
  tokenVersion: number
}
