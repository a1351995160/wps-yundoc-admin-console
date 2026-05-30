import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiResponse, saveTestAdminSession, systemAdmin } from '../../test/adminFixtures'
import { renderWithClient } from '../../test/renderWithClient'
import { BusinessSystemDetailPage } from './BusinessSystemDetailPage'

describe('BusinessSystemDetailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('resets client secret with confirmation and shows new token version', async () => {
    const user = userEvent.setup()
    saveTestAdminSession()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input)
      if (url.endsWith('/api/v1/admin/me')) {
        return apiResponse(systemAdmin)
      }
      if (url.endsWith('/api/v1/admin/business-systems/biz-reset/client-secret:reset')) {
        return apiResponse({
          businessSystemId: 'biz-reset',
          clientId: 'client-reset',
          clientSecret: 'new-secret',
          tokenVersion: 2
        })
      }
      if (url.endsWith('/api/v1/admin/business-systems/biz-reset') && init?.method !== 'POST') {
        return apiResponse({
              businessSystemId: 'biz-reset',
              businessSystemName: '重置系统',
              clientId: 'client-reset',
              status: 'ENABLED',
              tokenVersion: 1,
              permissionVersion: 1,
              jwtTtlSeconds: 1800,
              apiPermissions: ['app-preview:create', 'user-files:list']
            })
      }
      throw new Error(`Unexpected request: ${url}`)
    })

    renderWithClient(
      <Routes>
        <Route path="/business-systems/:businessSystemId" element={<BusinessSystemDetailPage />} />
      </Routes>,
      '/business-systems/biz-reset'
    )

    expect(await screen.findByText('重置系统')).toBeInTheDocument()
    expect(screen.getByText('创建文件预览')).toBeInTheDocument()
    expect(screen.getByText('查看用户文件列表')).toBeInTheDocument()
    expect(screen.queryByText('app-preview:create')).not.toBeInTheDocument()
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '重置密钥' }))
    })
    await act(async () => {
      await user.click(await screen.findByRole('button', { name: '确认重置' }))
    })

    expect(await screen.findByText('new-secret')).toBeInTheDocument()
    expect(screen.getByText(/凭证版本：2/)).toBeInTheDocument()
  })
})
