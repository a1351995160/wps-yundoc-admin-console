export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error?: ApiErrorBody | null
  requestId?: string
  pagination?: ApiPagination | null
}

export interface ApiErrorBody {
  code: string
  message: string
}

export interface ApiPagination {
  nextCursor?: string
  pageSize?: number
  hasMore?: boolean
}
