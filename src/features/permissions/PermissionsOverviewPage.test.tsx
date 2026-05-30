import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiResponse, saveTestAdminSession, systemAdmin } from '../../test/adminFixtures'
import { renderWithClient } from '../../test/renderWithClient'
import { PermissionsOverviewPage } from './PermissionsOverviewPage'

describe('PermissionsOverviewPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('lists systems and links each one to its permission editor', async () => {
    saveTestAdminSession()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/api/v1/admin/me')) {
        return apiResponse(systemAdmin)
      }
      if (url.includes('/api/v1/admin/business-systems')) {
        return apiResponse({
            items: [
              {
                businessSystemId: 'biz-contract',
                businessSystemName: '合同系统',
                clientId: 'client-id',
                status: 'ENABLED',
                tokenVersion: 1,
                permissionVersion: 3,
                jwtTtlSeconds: 1800,
                apiPermissions: ['app-preview:create', 'user-files:list']
              }
            ],
            hasMore: false
          })
      }
      throw new Error(`Unexpected request: ${url}`)
    })

    renderWithClient(<PermissionsOverviewPage />, '/permissions')

    expect(await screen.findByRole('heading', { name: '权限管理' })).toBeInTheDocument()
    expect(await screen.findByText('biz-contract')).toBeInTheDocument()
    expect(screen.getByText('创建文件预览，查看用户文件列表')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '配置接口授权' })).toHaveAttribute(
      'href',
      '/business-systems/biz-contract/permissions'
    )
  })
})
