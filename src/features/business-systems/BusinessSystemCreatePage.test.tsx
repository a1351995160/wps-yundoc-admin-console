import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiResponse, saveTestAdminSession, systemAdmin } from '../../test/adminFixtures'
import { renderWithClient } from '../../test/renderWithClient'
import { BusinessSystemCreatePage } from './BusinessSystemCreatePage'

describe('BusinessSystemCreatePage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('shows one-time client secret and removes it after closing the modal', async () => {
    const user = userEvent.setup()
    saveTestAdminSession()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/api/v1/admin/me')) {
        return apiResponse(systemAdmin)
      }
      if (url.endsWith('/api/v1/admin/business-systems')) {
        return apiResponse({
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
          })
      }
      throw new Error(`Unexpected request: ${url}`)
    })

    renderWithClient(<BusinessSystemCreatePage />)

    const systemIdInput = await screen.findByLabelText('系统标识')
    await act(async () => {
      await user.type(systemIdInput, 'biz-new')
      await user.type(screen.getByLabelText('系统名称'), '新系统')
      await user.clear(screen.getByLabelText('令牌有效期'))
      await user.type(screen.getByLabelText('令牌有效期'), '1800')
      await user.click(screen.getByRole('button', { name: '创建业务系统' }))
    })

    expect(await screen.findByText('one-time-secret')).toBeInTheDocument()
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '我已保存' }))
    })

    await waitFor(() => expect(screen.queryByText('one-time-secret')).not.toBeInTheDocument())
  })
})
