import { useQuery } from '@tanstack/react-query'
import { Alert } from 'antd'
import { BadgeCheck, FileKey2, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { PaginationControls } from '../../shared/ui/PaginationControls'
import { StatusTag } from '../../shared/ui/StatusTag'
import { SummaryItem } from '../../shared/ui/SummaryItem'
import { canManagePermissions, canViewPermissions } from '../auth/permissions'
import { useCurrentAdmin } from '../auth/useAuth'
import {
  businessSystemPathSegment,
  businessSystemQueryKeys,
  listBusinessSystems
} from '../business-systems/api'
import { formatPermissionNames } from './permissionLabels'

const PAGE_SIZE = 20

export function PermissionsOverviewPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentAdminQuery = useCurrentAdmin()
  const canView = canViewPermissions(currentAdminQuery.data)
  const canManage = canManagePermissions(currentAdminQuery.data)
  const page = toPage(searchParams.get('page'))
  const listParams = { page, pageSize: PAGE_SIZE }
  const query = useQuery({
    queryKey: businessSystemQueryKeys.list(listParams),
    queryFn: () => listBusinessSystems(listParams),
    enabled: canView
  })
  const systems = query.data?.items ?? []
  const enabledCount = systems.filter((item) => item.status === 'ENABLED').length
  const configuredCount = systems.filter((item) => (item.apiPermissions ?? []).length > 0).length
  const returnTo = `${location.pathname}${location.search}`

  if (currentAdminQuery.isLoading) {
    return null
  }

  if (!canView) {
    return (
      <section className="page-section">
        <Alert
          type="warning"
          showIcon
          message="无权访问权限管理"
          description="当前角色不能查看或配置接口授权。"
        />
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>权限管理</h1>
          <p>选择业务系统后配置应用身份和用户身份可调用的能力。</p>
        </div>
      </div>

      <div className="access-control-panel" aria-label="接口授权概览">
        <div>
          <span className="section-kicker">授权边界</span>
          <h2>按业务系统配置可调用能力</h2>
          <p>应用身份和用户身份分开授权；保存前需要二次确认，避免误开高风险接口。</p>
        </div>
        <div className="summary-strip summary-strip--compact">
          <SummaryItem icon={<ShieldCheck size={18} />} label="可授权系统" value={`${systems.length}`} />
          <SummaryItem icon={<BadgeCheck size={18} />} label="启用中" value={`${enabledCount}`} />
          <SummaryItem icon={<FileKey2 size={18} />} label="已有授权" value={`${configuredCount}`} />
        </div>
      </div>

      <div className="data-table-wrap" aria-busy={query.isLoading}>
        <table className="data-table">
          <thead>
            <tr>
              <th>系统标识</th>
              <th>系统名称</th>
              <th>状态</th>
              <th>授权版本</th>
              <th>当前接口授权</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((item) => {
              const routeId = businessSystemPathSegment(item.businessSystemId)
              return (
              <tr key={item.businessSystemId}>
                <td data-label="系统标识">
                  <div className="entity-cell">
                    <span>{item.businessSystemId}</span>
                    <small>{item.businessSystemName}</small>
                  </div>
                </td>
                <td data-label="系统名称">
                  <strong className="table-primary-text">{item.businessSystemName}</strong>
                </td>
                <td data-label="状态">
                  <StatusTag status={item.status} />
                </td>
                <td data-label="授权版本">
                  <span className="metric-badge">{item.permissionVersion}</span>
                </td>
                <td data-label="当前接口授权">
                  <span className="permission-summary-text">{formatPermissionNames(item.apiPermissions)}</span>
                </td>
                <td data-label="操作">
                  <Link
                    to={`/business-systems/${routeId}/permissions`}
                    state={{ returnTo, returnLabel: '返回权限管理' }}
                  >
                    {canManage ? '配置接口授权' : '查看接口授权'}
                  </Link>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
        <PaginationControls
          page={page}
          hasMore={query.data?.hasMore ?? false}
          loading={query.isLoading}
          onPageChange={(nextPage) => {
            const next = new URLSearchParams(searchParams)
            next.set('page', String(nextPage))
            setSearchParams(next)
          }}
        />
      </div>
    </section>
  )
}

function toPage(value: string | null): number {
  const page = Number(value ?? '1')
  return Number.isInteger(page) && page > 0 ? page : 1
}
