import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAdminSession, getAdminSession } from './authSession'

export function useLogout() {
  const navigate = useNavigate()

  return useCallback(() => {
    clearAdminSession()
    navigate('/login', { replace: true })
  }, [navigate])
}

export function useAuthExpiredRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleExpired() {
      navigate('/login', { replace: true })
    }

    window.addEventListener('admin-auth-expired', handleExpired)
    return () => window.removeEventListener('admin-auth-expired', handleExpired)
  }, [navigate])
}

export function useCurrentAdminSession() {
  return getAdminSession()
}
