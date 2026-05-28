import { clearAdminSession, getAdminSession } from '../../features/auth/authSession'
import type { ApiResponse } from './apiResponse'
import { ApiError } from './errors'

export { ApiError }

const AUTH_EXPIRED_EVENT = 'admin-auth-expired'

type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: buildHeaders(options.headers),
    body: serializeBody(options.body)
  })
  const envelope = (await response.json()) as ApiResponse<T>

  if (!response.ok || !envelope.success) {
    if (response.status === 401) {
      clearAdminSession()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiError(
      envelope.error?.message ?? 'Request failed',
      envelope.error?.code ?? 'REQUEST_FAILED',
      response.status,
      envelope.requestId
    )
  }

  return envelope.data as T
}

function buildHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers)
  const session = getAdminSession()
  nextHeaders.set('Content-Type', 'application/json')
  if (session?.adminJwt) {
    nextHeaders.set('Authorization', `Bearer ${session.adminJwt}`)
  }
  return nextHeaders
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined
  }
  return JSON.stringify(body)
}

export const httpClient = {
  get<T>(path: string) {
    return request<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, { method: 'POST', body })
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>(path, { method: 'PATCH', body })
  },
  put<T>(path: string, body?: unknown) {
    return request<T>(path, { method: 'PUT', body })
  }
}
