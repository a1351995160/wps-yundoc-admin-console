import { describe, expect, it, vi } from 'vitest'
import { clearAdminSession, getAdminSession, isSessionValid, saveAdminSession } from './authSession'

describe('authSession', () => {
  it('saves and restores a valid admin session', () => {
    saveAdminSession({ expiresInSeconds: 1800 })

    expect(getAdminSession()).toMatchObject({ expiresAt: expect.any(Number) })
    expect(isSessionValid()).toBe(true)
  })

  it('removes expired or malformed sessions', () => {
    sessionStorage.setItem(
      'admin.session',
      JSON.stringify({ expiresAt: Date.now() - 1000 })
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
    saveAdminSession({ expiresInSeconds: 1800 })

    clearAdminSession()

    expect(getAdminSession()).toBeNull()
  })
})
