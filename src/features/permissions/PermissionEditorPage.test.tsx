import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiResponse, saveTestAdminSession, systemAdmin } from '../../test/adminFixtures'
import { renderWithClient } from '../../test/renderWithClient'
import { PermissionEditorPage } from './PermissionEditorPage'

const definitions = [
  {
    apiCode: 'app-preview:create',
    identityType: 'APP',
    displayName: 'App preview create',
    description: 'Allows app identity to create preview resources.',
    riskLevel: 'LOW'
  },
  {
    apiCode: 'user-files:list',
    identityType: 'USER',
    displayName: 'User files list',
    description: 'Allows user identity to list files.',
    riskLevel: 'MEDIUM'
  }
]

function mockPermissionFetch(failSave = false) {
  saveTestAdminSession()
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input)
    if (url.endsWith('/api/v1/admin/me')) {
      return apiResponse(systemAdmin)
    }
    if (url.endsWith('/api/v1/admin/api-permission-definitions')) {
      return apiResponse(definitions)
    }
    if (url.endsWith('/api/v1/admin/business-systems/biz-permission/api-permissions')) {
      if (init?.method === 'PUT') {
        if (failSave) {
          return new Response(
            JSON.stringify({
              success: false,
              error: { code: 'SAVE_FAILED', message: 'Save failed' }
            }),
            { status: 500 }
          )
        }
        return apiResponse({
              businessSystemId: 'biz-permission',
              businessSystemName: 'Permission System',
              clientId: 'client-id',
              status: 'ENABLED',
              tokenVersion: 1,
              permissionVersion: 2,
              jwtTtlSeconds: 1800,
              apiPermissions: ['app-preview:create']
            })
      }
      return apiResponse({
            businessSystemId: 'biz-permission',
            businessSystemName: 'Permission System',
            clientId: 'client-id',
            status: 'ENABLED',
            tokenVersion: 1,
            permissionVersion: 1,
            jwtTtlSeconds: 1800,
            apiPermissions: ['user-files:list']
          })
    }
    throw new Error(`Unexpected request: ${url}`)
  })
}

function renderEditor() {
  renderWithClient(
    <Routes>
      <Route
        path="/business-systems/:businessSystemId/permissions"
        element={<PermissionEditorPage />}
      />
    </Routes>,
    '/business-systems/biz-permission/permissions'
  )
}

function mockSupportFetch() {
  saveTestAdminSession()
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    if (String(input).endsWith('/api/v1/admin/me')) {
      return apiResponse({
        username: 'support01',
        displayName: 'Support',
        role: 'SUPPORT',
        status: 'ENABLED',
        superAdmin: false,
        lastLoginAt: null,
        createdAt: null,
        updatedAt: null
      })
    }
    throw new Error(`Unexpected request: ${String(input)}`)
  })
}

describe('PermissionEditorPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('groups definitions by APP and USER identity type', async () => {
    mockPermissionFetch()
    renderEditor()

    const appGroup = await screen.findByRole('group', { name: '应用身份接口' })
    const userGroup = screen.getByRole('group', { name: '用户身份接口' })

    expect(within(appGroup).getByText('创建文件预览')).toBeInTheDocument()
    expect(within(userGroup).getByText('查看用户文件列表')).toBeInTheDocument()
  })

  it('does not prefetch permission data before confirming the role can view it', async () => {
    const fetchMock = mockSupportFetch()
    renderEditor()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual(['/api/v1/admin/me'])
  })

  it('summarizes changes and saves the selected permission payload', async () => {
    const fetchMock = mockPermissionFetch()
    const user = userEvent.setup()
    renderEditor()

    const appPermission = await screen.findByRole('checkbox', { name: '创建文件预览' })
    const userPermission = screen.getByRole('checkbox', { name: '查看用户文件列表' })

    await act(async () => {
      await user.click(appPermission)
      await user.click(userPermission)
    })

    expect(screen.getByText(/新增 1 项/)).toBeInTheDocument()
    expect(screen.getByText(/移除 1 项/)).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: '保存接口授权' }))
    })
    await user.click(await screen.findByRole('button', { name: '确认保存接口授权' }))

    await waitFor(() => {
      const saveCall = fetchMock.mock.calls.find(
        ([input, init]) => String(input).includes('/api-permissions') && init?.method === 'PUT'
      )
      expect(saveCall?.[1]?.body).toBe(JSON.stringify({ apiPermissions: ['app-preview:create'] }))
    })
  })

  it('toggles permissions by clicking the full permission option', async () => {
    mockPermissionFetch()
    const user = userEvent.setup()
    renderEditor()

    const appPermission = await screen.findByRole('checkbox', { name: '创建文件预览' })
    const userPermission = screen.getByRole('checkbox', { name: '查看用户文件列表' })

    expect(appPermission).toHaveAttribute('aria-checked', 'false')
    expect(userPermission).toHaveAttribute('aria-checked', 'true')

    await act(async () => {
      await user.click(screen.getByText('创建文件预览'))
      await user.click(screen.getByText('查看用户文件列表'))
    })

    expect(appPermission).toHaveAttribute('aria-checked', 'true')
    expect(appPermission).toHaveClass('permission-option--selected')
    expect(userPermission).toHaveAttribute('aria-checked', 'false')
    expect(userPermission).not.toHaveClass('permission-option--selected')
  })

  it('keeps edited selections when save fails', async () => {
    mockPermissionFetch(true)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()
    renderEditor()

    const appPermission = await screen.findByRole('checkbox', { name: '创建文件预览' })

    await act(async () => {
      await user.click(appPermission)
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '保存接口授权' })).not.toBeDisabled()
    )
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '保存接口授权' }))
    })
    await user.click(await screen.findByRole('button', { name: '确认保存接口授权' }))

    expect(await screen.findByText('Save failed')).toBeInTheDocument()
    expect(appPermission).toHaveAttribute('aria-checked', 'true')
  })
})
