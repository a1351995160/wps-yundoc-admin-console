import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiResponse, saveTestAdminSession, superAdmin, systemAdmin } from '../../test/adminFixtures'
import { renderWithClient } from '../../test/renderWithClient'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('shows super-admin-only user management navigation', async () => {
    saveTestAdminSession()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(apiResponse(superAdmin))

    renderWithClient(<AppLayout />)

    expect(await screen.findByRole('link', { name: /权限管理/ })).toHaveAttribute(
      'href',
      '/permissions'
    )
    expect(screen.getByRole('link', { name: /用户管理/ })).toHaveAttribute('href', '/admin-users')
    expect(screen.getAllByText('超级管理员').length).toBeGreaterThan(0)
  })

  it('hides user management from system administrators', async () => {
    saveTestAdminSession()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(apiResponse(systemAdmin))

    renderWithClient(<AppLayout />)

    expect(await screen.findByRole('link', { name: /权限管理/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /用户管理/ })).not.toBeInTheDocument()
  })
})
