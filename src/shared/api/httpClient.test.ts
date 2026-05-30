import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, httpClient } from './httpClient'

describe('httpClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
    document.cookie = 'yundoc_admin_csrf=; Max-Age=0; Path=/'
  })

  it('unwraps successful ApiResponse data', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200 })
    )

    await expect(httpClient.get<{ ok: boolean }>('/api/example')).resolves.toEqual({ ok: true })
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/example',
      expect.objectContaining({ credentials: 'include' })
    )
  })

  it('maps backend errors into typed ApiError values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Invalid input' }
        }),
        { status: 400 }
      )
    )

    await expect(httpClient.get('/api/example')).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      message: 'Invalid input'
    } satisfies Partial<ApiError>)
  })

  it('sends csrf token from cookie with admin requests', async () => {
    document.cookie = 'yundoc_admin_csrf=test-csrf-token; Path=/'
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: null }), { status: 200 })
    )

    await httpClient.post('/api/v1/admin/example', { ok: true })

    const headers = fetchSpy.mock.calls[0]?.[1]?.headers as Headers
    expect(headers.get('X-CSRF-Token')).toBe('test-csrf-token')
  })

  it('clears session and emits auth-expired when backend returns 401', async () => {
    const listener = vi.fn()
    globalThis.addEventListener('admin-auth-expired', listener)
    sessionStorage.setItem('admin.session', `{"expiresAt":${Date.now() + 1800_000}}`)
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'TOKEN_INVALID', message: 'Token invalid' }
        }),
        { status: 401 }
      )
    )

    await expect(httpClient.get('/api/protected')).rejects.toBeInstanceOf(ApiError)

    expect(sessionStorage.getItem('admin.session')).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)
    globalThis.removeEventListener('admin-auth-expired', listener)
  })
})
