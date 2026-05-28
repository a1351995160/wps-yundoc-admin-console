import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { BusinessSystemCreatePage } from '../features/business-systems/BusinessSystemCreatePage'
import { BusinessSystemDetailPage } from '../features/business-systems/BusinessSystemDetailPage'
import { BusinessSystemListPage } from '../features/business-systems/BusinessSystemListPage'
import { IntegrationGuidePage } from '../features/integration-guide/IntegrationGuidePage'
import { PermissionEditorPage } from '../features/permissions/PermissionEditorPage'
import { AppLayout } from '../shared/ui/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/business-systems" replace /> },
      { path: 'business-systems', element: <BusinessSystemListPage /> },
      { path: 'business-systems/new', element: <BusinessSystemCreatePage /> },
      {
        path: 'business-systems/:businessSystemId/permissions',
        element: <PermissionEditorPage />
      },
      { path: 'business-systems/:businessSystemId', element: <BusinessSystemDetailPage /> },
      { path: 'integration-guide', element: <IntegrationGuidePage /> }
    ]
  }
])
