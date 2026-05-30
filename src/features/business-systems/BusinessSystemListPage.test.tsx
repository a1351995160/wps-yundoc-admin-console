import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithClient } from '../../test/renderWithClient'
import { BusinessSystemListPage } from './BusinessSystemListPage'

describe('BusinessSystemListPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('renders business systems without secret fields', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            items: [
              {
                businessSystemId: 'biz-contract',
                businessSystemName: '合同系统',
                clientId: 'client-id',
                status: 'ENABLED',
                tokenVersion: 1,
                permissionVersion: 1,
                jwtTtlSeconds: 1800,
                clientSecret: 'must-not-render',
                clientSecretDigest: 'digest'
              }
            ],
            hasMore: false
          }
        }),
        { status: 200 }
      )
    )

    renderWithClient(<BusinessSystemListPage />)

    expect(await screen.findByText('合同系统')).toBeInTheDocument()
    expect(screen.getByText('biz-contract')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '查看详情' })).toHaveAttribute(
      'href',
      '/business-systems/biz-contract'
    )
    expect(screen.queryByText('must-not-render')).not.toBeInTheDocument()
    expect(screen.queryByText('digest')).not.toBeInTheDocument()
  })
})
