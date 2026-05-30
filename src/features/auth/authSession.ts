export const ADMIN_SESSION_KEY = 'admin.session'

export interface AdminLoginResult {
  expiresInSeconds: number
}

export interface AdminSession {
  expiresAt: number
}

export function saveAdminSession(result: AdminLoginResult): AdminSession {
  const session: AdminSession = {
    expiresAt: Date.now() + result.expiresInSeconds * 1000
  }
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
  return session
}

export function getAdminSession(): AdminSession | null {
  const raw = sessionStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(raw) as AdminSession
    if (!Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) {
      clearAdminSession()
      return null
    }
    return session
  } catch {
    console.warn('Failed to parse admin session')
    clearAdminSession()
    return null
  }
}

export function isSessionValid(): boolean {
  return getAdminSession() !== null
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
}
