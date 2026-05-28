import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithClient } from '../../test/renderWithClient'
import { BusinessSystemDetailPage } from './BusinessSystemDetailPage'

describe('BusinessSystemDetailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('resets client secret with confirmation and shows new token version', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              businessSystemId: 'biz-reset',
              businessSystemName: '重置系统',
              clientId: 'client-reset',
              status: 'ENABLED',
              tokenVersion: 1,
              permissionVersion: 1,
              jwtTtlSeconds: 1800,
              apiPermissions: []
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              businessSystemId: 'biz-reset',
              clientId: 'client-reset',
              clientSecret: 'new-secret',
              tokenVersion: 2
            }
          }),
          { status: 200 }
        )
      )

    renderWithClient(
      <Routes>
        <Route path="/business-systems/:businessSystemId" element={<BusinessSystemDetailPage />} />
      </Routes>,
      '/business-systems/biz-reset'
    )

    expect(await screen.findByText('重置系统')).toBeInTheDocument()
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '重置密钥' }))
    })
    await act(async () => {
      await user.click(await screen.findByRole('button', { name: '确认重置' }))
    })

    expect(await screen.findByText('new-secret')).toBeInTheDocument()
    expect(screen.getByText(/tokenVersion: 2/)).toBeInTheDocument()
  })
})
