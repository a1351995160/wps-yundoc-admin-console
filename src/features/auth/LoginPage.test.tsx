import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/business-systems" element={<div>业务系统列表</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('logs in and navigates to business systems', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: { adminJwt: 'admin-jwt', expiresInSeconds: 1800 }
        }),
        { status: 200 }
      )
    )

    renderLogin()

    await act(async () => {
      await user.type(screen.getByLabelText('账号'), 'admin')
      await user.type(screen.getByLabelText('密码'), 'admin-password')
      await user.click(screen.getByRole('button', { name: '登录' }))
    })

    expect(await screen.findByText('业务系统列表')).toBeInTheDocument()
    expect(sessionStorage.getItem('admin.session')).toContain('admin-jwt')
  })

  it('shows stable backend error messages without leaking tokens', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'TOKEN_INVALID',
            message: 'Login failed for Bearer secret-token stacktrace'
          }
        }),
        { status: 401 }
      )
    )

    renderLogin()

    await act(async () => {
      await user.type(screen.getByLabelText('账号'), 'admin')
      await user.type(screen.getByLabelText('密码'), 'bad-password')
      await user.click(screen.getByRole('button', { name: '登录' }))
    })

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('登录失败'))
    expect(screen.queryByText(/secret-token/)).not.toBeInTheDocument()
  })
})
