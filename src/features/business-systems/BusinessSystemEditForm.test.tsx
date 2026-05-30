import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BusinessSystemEditForm } from './BusinessSystemEditForm'
import type { BusinessSystem } from './types'

const businessSystem: BusinessSystem = {
  businessSystemId: 'demo-system',
  businessSystemName: 'Demo System',
  clientId: 'demo-client',
  status: 'ENABLED',
  tokenVersion: 1,
  permissionVersion: 1,
  jwtTtlSeconds: 1800,
  description: 'Old description',
  apiPermissions: []
}

describe('BusinessSystemEditForm', () => {
  it('submits edited business-system profile fields', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BusinessSystemEditForm businessSystem={businessSystem} onSubmit={onSubmit} />)

    await user.clear(screen.getByLabelText('系统名称'))
    await user.type(screen.getByLabelText('系统名称'), 'Updated System')
    await user.clear(screen.getByLabelText('令牌有效期'))
    await user.type(screen.getByLabelText('令牌有效期'), '3600')
    await user.clear(screen.getByLabelText('描述'))
    await user.type(screen.getByLabelText('描述'), 'Updated description')
    await user.click(screen.getByRole('button', { name: '保存基础信息' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        businessSystemName: 'Updated System',
        status: 'ENABLED',
        jwtTtlSeconds: 3600,
        description: 'Updated description'
      })
    })
  })

  it('asks for confirmation before disabling a business system', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BusinessSystemEditForm businessSystem={businessSystem} onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByLabelText('状态'), 'DISABLED')
    await user.click(screen.getByRole('button', { name: '保存基础信息' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '确认保存' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DISABLED'
        })
      )
    })
  })
})
