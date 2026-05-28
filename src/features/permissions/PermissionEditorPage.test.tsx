import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input)
    if (url.endsWith('/api/v1/admin/api-permission-definitions')) {
      return new Response(JSON.stringify({ success: true, data: definitions }), { status: 200 })
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
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              businessSystemId: 'biz-permission',
              businessSystemName: 'Permission System',
              clientId: 'client-id',
              status: 'ENABLED',
              tokenVersion: 1,
              permissionVersion: 2,
              jwtTtlSeconds: 1800,
              apiPermissions: ['app-preview:create']
            }
          }),
          { status: 200 }
        )
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            businessSystemId: 'biz-permission',
            businessSystemName: 'Permission System',
            clientId: 'client-id',
            status: 'ENABLED',
            tokenVersion: 1,
            permissionVersion: 1,
            jwtTtlSeconds: 1800,
            apiPermissions: ['user-files:list']
          }
        }),
        { status: 200 }
      )
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

describe('PermissionEditorPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('groups definitions by APP and USER identity type', async () => {
    mockPermissionFetch()
    renderEditor()

    const appGroup = await screen.findByRole('group', { name: 'APP' })
    const userGroup = screen.getByRole('group', { name: 'USER' })

    expect(within(appGroup).getByText('app-preview:create')).toBeInTheDocument()
    expect(within(userGroup).getByText('user-files:list')).toBeInTheDocument()
  })

  it('summarizes changes and saves the selected permission payload', async () => {
    const fetchMock = mockPermissionFetch()
    const user = userEvent.setup()
    renderEditor()

    const appPermission = await screen.findByRole('checkbox', { name: /app-preview:create/ })
    const userPermission = screen.getByRole('checkbox', { name: /user-files:list/ })

    await act(async () => {
      await user.click(appPermission)
      await user.click(userPermission)
    })

    expect(screen.getByText(/新增 1 项/)).toBeInTheDocument()
    expect(screen.getByText(/移除 1 项/)).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: '保存权限' }))
    })

    await waitFor(() => {
      const saveCall = fetchMock.mock.calls.find(
        ([input, init]) => String(input).includes('/api-permissions') && init?.method === 'PUT'
      )
      expect(saveCall?.[1]?.body).toBe(JSON.stringify({ apiPermissions: ['app-preview:create'] }))
    })
  })

  it('keeps edited selections when save fails', async () => {
    mockPermissionFetch(true)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()
    renderEditor()

    const appPermission = await screen.findByRole('checkbox', { name: /app-preview:create/ })

    await act(async () => {
      await user.click(appPermission)
      await user.click(screen.getByRole('button', { name: '保存权限' }))
    })

    expect(await screen.findByText('Save failed')).toBeInTheDocument()
    expect(appPermission).toBeChecked()
  })
})
