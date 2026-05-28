import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, httpClient } from './httpClient'

describe('httpClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('unwraps successful ApiResponse data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200 })
    )

    await expect(httpClient.get<{ ok: boolean }>('/api/example')).resolves.toEqual({ ok: true })
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

  it('clears session and emits auth-expired when backend returns 401', async () => {
    const listener = vi.fn()
    window.addEventListener('admin-auth-expired', listener)
    sessionStorage.setItem('admin.session', '{"adminJwt":"token"}')
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
    window.removeEventListener('admin-auth-expired', listener)
  })
})
