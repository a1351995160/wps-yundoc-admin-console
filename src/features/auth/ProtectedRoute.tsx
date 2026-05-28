import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isSessionValid } from './authSession'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (!isSessionValid()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
