import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithClient } from '../../test/renderWithClient'
import { BusinessSystemCreatePage } from './BusinessSystemCreatePage'

describe('BusinessSystemCreatePage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('shows one-time client secret and removes it after closing the modal', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            businessSystem: {
              businessSystemId: 'biz-new',
              businessSystemName: '新系统',
              clientId: 'client-new',
              status: 'ENABLED',
              tokenVersion: 1,
              permissionVersion: 1,
              jwtTtlSeconds: 1800
            },
            clientSecret: 'one-time-secret'
          }
        }),
        { status: 200 }
      )
    )

    renderWithClient(<BusinessSystemCreatePage />)

    await act(async () => {
      await user.type(screen.getByLabelText('系统标识'), 'biz-new')
      await user.type(screen.getByLabelText('系统名称'), '新系统')
      await user.clear(screen.getByLabelText('JWT TTL'))
      await user.type(screen.getByLabelText('JWT TTL'), '1800')
      await user.click(screen.getByRole('button', { name: '创建' }))
    })

    expect(await screen.findByText('one-time-secret')).toBeInTheDocument()
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '我已保存' }))
    })

    await waitFor(() => expect(screen.queryByText('one-time-secret')).not.toBeInTheDocument())
  })
})
