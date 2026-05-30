import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Input, Spin } from 'antd'
import { Edit3, Plus, Search, ShieldAlert, UserCheck, UserRoundCog } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError } from '../../shared/api/httpClient'
import { PaginationControls } from '../../shared/ui/PaginationControls'
import { StatusTag } from '../../shared/ui/StatusTag'
import { SummaryItem } from '../../shared/ui/SummaryItem'
import { formatDateTime } from '../../shared/utils/formatDateTime'
import {
  canManageAdminUsers,
  getRoleLabel,
  ROLE_LABELS,
  type AdminStatus
} from '../auth/permissions'
import { useCurrentAdmin } from '../auth/useAuth'
import { adminUserQueryKeys, createAdminUser, listAdminUsers, updateAdminUser } from './api'
import { AdminUserFormModal } from './AdminUserFormModal'
import type { AdminUser, AdminUserUpdateRequest, ManagedAdminRole } from './types'

const PAGE_SIZE = 20

export function AdminUserManagementPage() {
  const queryClient = useQueryClient()
  const currentAdminQuery = useCurrentAdmin()
  const currentAdmin = currentAdminQuery.data
  const allowed = canManageAdminUsers(currentAdmin)
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') ?? ''
  const role = toManagedRole(searchParams.get('role'))
  const status = toAdminStatus(searchParams.get('status'))
  const page = toPage(searchParams.get('page'))
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const listParams = { keyword, role, status, page, pageSize: PAGE_SIZE }

  const usersQuery = useQuery({
    queryKey: adminUserQueryKeys.list(listParams),
    queryFn: () => listAdminUsers(listParams),
    enabled: allowed
  })

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      setCreating(false)
      setFormError('')
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all })
    },
    onError: (error) => setFormError(toErrorMessage(error))
  })

  const updateMutation = useMutation({
    mutationFn: ({ username, request }: { username: string; request: AdminUserUpdateRequest }) =>
      updateAdminUser(username, request),
    onSuccess: () => {
      setEditingUser(null)
      setFormError('')
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all })
    },
    onError: (error) => setFormError(toErrorMessage(error))
  })

  if (currentAdminQuery.isLoading) {
    return <Spin />
  }

  if (!allowed) {
    return (
      <section className="page-section">
        <Alert
          type="warning"
          showIcon
          message="无权访问用户管理"
          description="只有超级管理员可以配置谁能进入后台。请联系超级管理员处理账号、角色或停用操作。"
        />
      </section>
    )
  }

  const users = usersQuery.data?.items ?? []
  const enabledUsers = users.filter((item) => item.status === 'ENABLED').length
  const systemAdmins = users.filter((item) => item.role === 'SYSTEM_ADMIN').length

  function updateListParams(nextParams: {
    keyword?: string
    role?: ManagedAdminRole | ''
    status?: AdminStatus | ''
    page?: number
  }) {
    const next = new URLSearchParams(searchParams)
    if (nextParams.keyword !== undefined) {
      setOptionalParam(next, 'keyword', nextParams.keyword)
      next.set('page', '1')
    }
    if (nextParams.role !== undefined) {
      setOptionalParam(next, 'role', nextParams.role)
      next.set('page', '1')
    }
    if (nextParams.status !== undefined) {
      setOptionalParam(next, 'status', nextParams.status)
      next.set('page', '1')
    }
    if (nextParams.page !== undefined) {
      next.set('page', String(nextParams.page))
    }
    setSearchParams(next)
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>用户管理</h1>
          <p>配置谁可以进入后台，并控制他们能执行的操作范围。</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setCreating(true)
            setFormError('')
          }}
        >
          新增用户
        </Button>
      </div>

      <div className="access-control-panel" aria-label="后台准入规则">
        <div>
          <span className="section-kicker">后台准入</span>
          <h2>只有被授权的管理员可以进入控制台</h2>
          <p>角色决定入口和可执行操作；停用用户无法登录，敏感密码材料不会在页面中展示。</p>
        </div>
        <div className="summary-strip summary-strip--compact">
          <SummaryItem icon={<UserCheck size={18} />} label="启用用户" value={`${enabledUsers}`} />
          <SummaryItem icon={<UserRoundCog size={18} />} label="系统管理员" value={`${systemAdmins}`} />
          <SummaryItem icon={<ShieldAlert size={18} />} label="高危变更" value="二次确认" />
        </div>
      </div>

      <div className="toolbar toolbar--wide">
        <Input
          aria-label="搜索登录账号或用户姓名"
          prefix={<Search size={16} aria-hidden="true" />}
          placeholder="搜索登录账号或用户姓名"
          value={keyword}
          onChange={(event) => updateListParams({ keyword: event.target.value })}
        />
        <select
          aria-label="角色筛选"
          value={role}
          onChange={(event) => updateListParams({ role: event.target.value as ManagedAdminRole | '' })}
        >
          <option value="">全部角色</option>
          <option value="SYSTEM_ADMIN">{ROLE_LABELS.SYSTEM_ADMIN}</option>
          <option value="AUDITOR">{ROLE_LABELS.AUDITOR}</option>
          <option value="SUPPORT">{ROLE_LABELS.SUPPORT}</option>
        </select>
        <select
          aria-label="状态筛选"
          value={status}
          onChange={(event) => updateListParams({ status: event.target.value as AdminStatus | '' })}
        >
          <option value="">全部状态</option>
          <option value="ENABLED">启用</option>
          <option value="DISABLED">停用</option>
        </select>
      </div>

      <div className="data-table-wrap" aria-busy={usersQuery.isLoading}>
        <table className="data-table admin-user-table">
          <thead>
            <tr>
              <th>登录账号</th>
              <th>用户姓名</th>
              <th>角色</th>
              <th>状态</th>
              <th>最近登录时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.username}>
                <td data-label="登录账号">
                  <div className="entity-cell">
                    <code>{item.username}</code>
                    <span>{item.status === 'DISABLED' ? '已停用，不能登录' : '允许登录后台'}</span>
                  </div>
                </td>
                <td data-label="用户姓名">
                  <strong className="table-primary-text">{item.displayName}</strong>
                </td>
                <td data-label="角色">
                  <span className="role-badge">{getRoleLabel(item.role)}</span>
                </td>
                <td data-label="状态">
                  <StatusTag status={item.status} />
                </td>
                <td data-label="最近登录时间">
                  <span className="time-text">{formatDateTime(item.lastLoginAt)}</span>
                </td>
                <td data-label="更新时间">
                  <span className="time-text">{formatDateTime(item.updatedAt)}</span>
                </td>
                <td data-label="操作">
                  <Button
                    icon={<Edit3 size={15} />}
                    onClick={() => {
                      setEditingUser(item)
                      setFormError('')
                    }}
                  >
                    编辑
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!usersQuery.isLoading && users.length === 0 ? (
          <div className="empty-state">
            <strong>暂无后台用户</strong>
            <span>新增用户后，可在这里维护角色、状态和后台准入权限。</span>
          </div>
        ) : null}
        <PaginationControls
          page={page}
          hasMore={usersQuery.data?.hasMore ?? false}
          loading={usersQuery.isLoading}
          onPageChange={(nextPage) => updateListParams({ page: nextPage })}
        />
      </div>

      {creating ? (
        <AdminUserFormModal
          mode="create"
          submitting={createMutation.isLoading}
          errorMessage={formError}
          onClose={() => setCreating(false)}
          onSubmit={(request) => createMutation.mutateAsync(request).then(() => undefined)}
        />
      ) : null}

      {editingUser ? (
        <AdminUserFormModal
          mode="edit"
          user={editingUser}
          submitting={updateMutation.isLoading}
          errorMessage={formError}
          onClose={() => setEditingUser(null)}
          onSubmit={(request) =>
            updateMutation.mutateAsync({
              username: editingUser.username,
              request
            }).then(() => undefined)
          }
        />
      ) : null}
    </section>
  )
}

function toErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '保存失败'
}

function toPage(value: string | null): number {
  const page = Number(value ?? '1')
  return Number.isInteger(page) && page > 0 ? page : 1
}

function toManagedRole(value: string | null): ManagedAdminRole | '' {
  return value === 'SYSTEM_ADMIN' || value === 'AUDITOR' || value === 'SUPPORT' ? value : ''
}

function toAdminStatus(value: string | null): AdminStatus | '' {
  return value === 'ENABLED' || value === 'DISABLED' ? value : ''
}

function setOptionalParam(searchParams: URLSearchParams, key: string, value: string) {
  if (value) {
    searchParams.set(key, value)
    return
  }
  searchParams.delete(key)
}
