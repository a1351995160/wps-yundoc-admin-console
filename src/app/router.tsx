import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../shared/ui/AppLayout'
import { PlaceholderPage } from './PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/business-systems" replace /> },
      { path: 'business-systems', element: <PlaceholderPage /> }
    ]
  }
])
