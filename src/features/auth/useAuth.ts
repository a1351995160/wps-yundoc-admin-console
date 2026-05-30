import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentAdmin, logoutAdmin } from './api'
import { clearAdminSession, getAdminSession } from './authSession'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useCallback(async () => {
    await logoutAdmin().catch(() => undefined)
    clearAdminSession()
    queryClient.removeQueries({ queryKey: ['current-admin'] })
    navigate('/login', { replace: true })
  }, [navigate, queryClient])
}

export function useAuthExpiredRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleExpired() {
      navigate('/login', { replace: true })
    }

    globalThis.addEventListener('admin-auth-expired', handleExpired)
    return () => globalThis.removeEventListener('admin-auth-expired', handleExpired)
  }, [navigate])
}

export function useCurrentAdmin() {
  const session = getAdminSession()

  return useQuery({
    queryKey: ['current-admin', session?.expiresAt],
    queryFn: getCurrentAdmin,
    enabled: session !== null,
    staleTime: 60_000
  })
}
