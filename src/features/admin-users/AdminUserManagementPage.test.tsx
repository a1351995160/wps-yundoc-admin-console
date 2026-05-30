import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiResponse, auditor, saveTestAdminSession, superAdmin } from '../../test/adminFixtures'
import { renderWithClient } from '../../test/renderWithClient'
import { AdminUserManagementPage } from './AdminUserManagementPage'

const adminUsersResponse = {
  items: [
    {
      username: 'support01',
      displayName: '接入支持一组',
      role: 'SUPPORT',
      status: 'ENABLED',
      lastLoginAt: '2026-05-28T10:00:00',
      updatedAt: '2026-05-28T11:00:00',
      loginDigest: 'must-not-render',
      loginSalt: 'must-not-render',
      loginAlgorithm: 'must-not-render'
    }
  ],
  hasMore: false
}

function mockAdminUsersFetch() {
  saveTestAdminSession()
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input)
    if (url.endsWith('/api/v1/admin/me')) {
      return apiResponse(superAdmin)
    }
    if (url.includes('/api/v1/admin/users') && init?.method === 'PATCH') {
      return apiResponse({
        username: 'support01',
        displayName: '接入支持一组',
        role: 'AUDITOR',
        status: 'DISABLED',
        updatedAt: '2026-05-28T12:00:00'
      })
    }
    if (url.includes('/api/v1/admin/users') && init?.method === 'POST') {
      return apiResponse({
        username: 'audit02',
        displayName: '审计二组',
        role: 'AUDITOR',
        status: 'ENABLED'
      })
    }
    if (url.includes('/api/v1/admin/users')) {
      return apiResponse(adminUsersResponse)
    }
    throw new Error(`Unexpected request: ${url}`)
  })
}

describe('AdminUserManagementPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('lists admin users with Chinese labels and never renders password material', async () => {
    mockAdminUsersFetch()

    renderWithClient(<AdminUserManagementPage />, '/admin-users')

    expect(await screen.findByRole('heading', { name: '用户管理' })).toBeInTheDocument()
    expect(await screen.findByText('support01')).toBeInTheDocument()
    expect(screen.getByText('接入支持一组')).toBeInTheDocument()
    expect(screen.getAllByText('接入支持人员').length).toBeGreaterThan(0)
    expect(screen.queryByText('must-not-render')).not.toBeInTheDocument()
  })

  it('submits create requests without keeping the initial password on the page', async () => {
    const fetchMock = mockAdminUsersFetch()
    const user = userEvent.setup()
    renderWithClient(<AdminUserManagementPage />, '/admin-users')

    await user.click(await screen.findByRole('button', { name: '新增用户' }))
    await user.type(screen.getByLabelText('登录账号'), 'audit02')
    await user.type(screen.getByLabelText('用户姓名'), '审计二组')
    await user.selectOptions(screen.getByLabelText('角色'), 'AUDITOR')
    await user.type(screen.getByLabelText('初始密码'), 'temporary-password')
    await user.click(screen.getByRole('button', { name: '创建用户' }))

    await waitFor(() => {
      const createCall = fetchMock.mock.calls.find(
        ([input, init]) => String(input).endsWith('/api/v1/admin/users') && init?.method === 'POST'
      )
      expect(createCall?.[1]?.body).toBe(
        JSON.stringify({
          username: 'audit02',
          displayName: '审计二组',
          role: 'AUDITOR',
          initialPassword: 'temporary-password'
        })
      )
    })
    expect(screen.queryByText('temporary-password')).not.toBeInTheDocument()
  })

  it('requires confirmation for role and disable changes', async () => {
    const fetchMock = mockAdminUsersFetch()
    const user = userEvent.setup()
    renderWithClient(<AdminUserManagementPage />, '/admin-users')

    await user.click(await screen.findByRole('button', { name: '编辑' }))
    await user.selectOptions(screen.getByLabelText('角色'), 'AUDITOR')
    await user.selectOptions(screen.getByLabelText('状态'), 'DISABLED')
    await user.click(screen.getByRole('button', { name: '保存用户' }))

    expect(await screen.findByText('请确认本次变更')).toBeInTheDocument()
    expect(screen.getByText(/已登录会话会在下次后端校验时失效/)).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: '确认保存' }))
    })

    await waitFor(() => {
      const updateCall = fetchMock.mock.calls.find(
        ([input, init]) => String(input).includes('/api/v1/admin/users/support01') && init?.method === 'PATCH'
      )
      expect(updateCall?.[1]?.body).toBe(
        JSON.stringify({
          displayName: '接入支持一组',
          role: 'AUDITOR',
          status: 'DISABLED'
        })
      )
    })
  })

  it('blocks non-super administrators from loading user data', async () => {
    saveTestAdminSession()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(apiResponse(auditor))

    renderWithClient(<AdminUserManagementPage />, '/admin-users')

    expect(await screen.findByText('无权访问用户管理')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
