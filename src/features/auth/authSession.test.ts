import { describe, expect, it, vi } from 'vitest'
import { clearAdminSession, getAdminSession, isSessionValid, saveAdminSession } from './authSession'

describe('authSession', () => {
  it('saves and restores a valid admin session', () => {
    saveAdminSession({ adminJwt: 'jwt', expiresInSeconds: 1800 })

    expect(getAdminSession()).toMatchObject({ adminJwt: 'jwt' })
    expect(isSessionValid()).toBe(true)
  })

  it('removes expired or malformed sessions', () => {
    sessionStorage.setItem(
      'admin.session',
      JSON.stringify({ adminJwt: 'jwt', expiresAt: Date.now() - 1000, tokenType: 'Bearer' })
    )

    expect(getAdminSession()).toBeNull()
    expect(sessionStorage.getItem('admin.session')).toBeNull()

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      sessionStorage.setItem('admin.session', 'not-json')
      expect(getAdminSession()).toBeNull()
      expect(warnSpy).toHaveBeenCalled()
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('clears session storage on logout', () => {
    saveAdminSession({ adminJwt: 'jwt', expiresInSeconds: 1800 })

    clearAdminSession()

    expect(getAdminSession()).toBeNull()
  })
})
