import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import { saveAdminSession } from './authSession'

describe('ProtectedRoute', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('redirects missing sessions to login', () => {
    render(
      <MemoryRouter initialEntries={['/business-systems']}>
        <Routes>
          <Route
            path="/business-systems"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>登录页</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('登录页')).toBeInTheDocument()
  })

  it('renders protected content for a valid session', () => {
    saveAdminSession({ adminJwt: 'jwt', expiresInSeconds: 1800 })

    render(
      <MemoryRouter initialEntries={['/business-systems']}>
        <Routes>
          <Route
            path="/business-systems"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>登录页</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
