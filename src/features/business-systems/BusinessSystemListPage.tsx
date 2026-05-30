import { useQuery } from '@tanstack/react-query'
import { Button, Input } from 'antd'
import { BadgeCheck, FileKey2, Plus, Search, ServerCog } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { PaginationControls } from '../../shared/ui/PaginationControls'
import { StatusTag } from '../../shared/ui/StatusTag'
import { SummaryItem } from '../../shared/ui/SummaryItem'
import { formatTtl } from '../../shared/utils/ttl'
import { canManageBusinessSystems, canViewPermissions } from '../auth/permissions'
import { useCurrentAdmin } from '../auth/useAuth'
import { businessSystemPathSegment, businessSystemQueryKeys, listBusinessSystems } from './api'
import type { BusinessSystemStatus } from './types'

const PAGE_SIZE = 20

export function BusinessSystemListPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') ?? ''
  const status = toBusinessSystemStatus(searchParams.get('status'))
  const page = toPage(searchParams.get('page'))
  const currentAdminQuery = useCurrentAdmin()
  const canManage = canManageBusinessSystems(currentAdminQuery.data)
  const canViewPermissionLinks = canViewPermissions(currentAdminQuery.data)
  const listParams = { keyword, status, page, pageSize: PAGE_SIZE }
  const query = useQuery({
    queryKey: businessSystemQueryKeys.list(listParams),
    queryFn: () => listBusinessSystems(listParams)
  })
  const systems = query.data?.items ?? []
  const enabledCount = systems.filter((item) => item.status === 'ENABLED').length
  const authorizedCount = systems.filter((item) => (item.apiPermissions ?? []).length > 0).length
  const returnTo = `${location.pathname}${location.search}`

  function updateListParams(nextParams: {
    keyword?: string
    status?: BusinessSystemStatus | ''
    page?: number
  }) {
    const next = new URLSearchParams(searchParams)
    if (nextParams.keyword !== undefined) {
      setOptionalParam(next, 'keyword', nextParams.keyword)
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
          <h1>业务系统</h1>
          <p>管理接入系统、状态和业务凭证版本。</p>
        </div>
        {canManage ? (
          <Link to="/business-systems/new">
            <Button type="primary" icon={<Plus size={16} />}>
              创建业务系统
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="summary-strip" aria-label="业务系统概览">
        <SummaryItem icon={<ServerCog size={18} />} label="已接入系统" value={`${systems.length}`} />
        <SummaryItem icon={<BadgeCheck size={18} />} label="启用中" value={`${enabledCount}`} />
        <SummaryItem icon={<FileKey2 size={18} />} label="已配置授权" value={`${authorizedCount}`} />
      </div>

      <div className="toolbar">
        <Input
          aria-label="搜索业务系统"
          prefix={<Search size={16} aria-hidden="true" />}
          placeholder="搜索系统标识、名称或接入标识"
          value={keyword}
          onChange={(event) => updateListParams({ keyword: event.target.value })}
        />
        <select
          aria-label="状态筛选"
          value={status}
          onChange={(event) =>
            updateListParams({ status: event.target.value as BusinessSystemStatus | '' })
          }
        >
          <option value="">全部状态</option>
          <option value="ENABLED">启用</option>
          <option value="DISABLED">停用</option>
        </select>
      </div>
      <div className="data-table-wrap" aria-busy={query.isLoading}>
        <table className="data-table">
          <thead>
            <tr>
              <th>业务系统标识</th>
              <th>系统名称</th>
              <th>接入标识</th>
              <th>状态</th>
              <th>凭证版本</th>
              <th>授权版本</th>
              <th>令牌有效期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((item) => {
              const routeId = businessSystemPathSegment(item.businessSystemId)
              return (
              <tr key={item.businessSystemId}>
                <td data-label="业务系统标识">
                  <div className="entity-cell">
                    <Link to={`/business-systems/${routeId}`}>
                      {item.businessSystemId}
                    </Link>
                    <span>{item.description || '未填写系统说明'}</span>
                  </div>
                </td>
                <td data-label="系统名称">
                  <strong className="table-primary-text">{item.businessSystemName}</strong>
                </td>
                <td data-label="接入标识">
                  <code>{item.clientId}</code>
                </td>
                <td data-label="状态">
                  <StatusTag status={item.status} />
                </td>
                <td data-label="凭证版本">
                  <span className="metric-badge">{item.tokenVersion}</span>
                </td>
                <td data-label="授权版本">
                  <span className="metric-badge">{item.permissionVersion}</span>
                </td>
                <td data-label="令牌有效期">
                  <span className="ttl-badge">{formatTtl(item.jwtTtlSeconds)}</span>
                </td>
                <td data-label="操作">
                  <div className="table-actions">
                    <Link to={`/business-systems/${routeId}`}>查看详情</Link>
                    {canViewPermissionLinks ? (
                      <Link
                        to={`/business-systems/${routeId}/permissions`}
                        state={{ returnTo, returnLabel: '返回业务系统' }}
                      >
                        {canManage ? '配置授权' : '查看授权'}
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
        {!query.isLoading && systems.length === 0 ? (
          <div className="empty-state">
            <strong>暂无业务系统</strong>
            <span>创建业务系统后，这里会展示接入标识、状态、凭证版本和授权入口。</span>
          </div>
        ) : null}
        <PaginationControls
          page={page}
          hasMore={query.data?.hasMore ?? false}
          loading={query.isLoading}
          onPageChange={(nextPage) => updateListParams({ page: nextPage })}
        />
      </div>
    </section>
  )
}

function toPage(value: string | null): number {
  const page = Number(value ?? '1')
  return Number.isInteger(page) && page > 0 ? page : 1
}

function toBusinessSystemStatus(value: string | null): BusinessSystemStatus | '' {
  return value === 'ENABLED' || value === 'DISABLED' ? value : ''
}

function setOptionalParam(searchParams: URLSearchParams, key: string, value: string) {
  if (value) {
    searchParams.set(key, value)
    return
  }
  searchParams.delete(key)
}
