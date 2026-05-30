import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Spin } from 'antd'
import { Clock3, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CopyButton } from '../../shared/ui/CopyButton'
import { StatusTag } from '../../shared/ui/StatusTag'
import { formatTtl } from '../../shared/utils/ttl'
import { canManageBusinessSystems, canManagePermissions, canViewPermissions } from '../auth/permissions'
import { useCurrentAdmin } from '../auth/useAuth'
import { formatPermissionName } from '../permissions/permissionLabels'
import { businessSystemPathSegment, getBusinessSystem, resetClientSecret, updateBusinessSystem } from './api'
import { BusinessSystemEditForm } from './BusinessSystemEditForm'
import { ResetSecretAction } from './ResetSecretAction'
import { SecretResultModal } from './SecretResultModal'
import type { BusinessSystemSecretResponse, BusinessSystemUpdateRequest } from './types'

export function BusinessSystemDetailPage() {
  const { businessSystemId = '' } = useParams()
  const queryClient = useQueryClient()
  const [secretResult, setSecretResult] = useState<BusinessSystemSecretResponse | null>(null)
  const currentAdminQuery = useCurrentAdmin()
  const query = useQuery({
    queryKey: ['business-system', businessSystemId],
    queryFn: () => getBusinessSystem(businessSystemId),
    enabled: Boolean(businessSystemId)
  })
  const updateMutation = useMutation({
    mutationFn: (request: BusinessSystemUpdateRequest) =>
      updateBusinessSystem(businessSystemId, request),
    onSuccess: (updated) => queryClient.setQueryData(['business-system', businessSystemId], updated)
  })
  const resetMutation = useMutation({
    mutationFn: () => resetClientSecret(businessSystemId),
    onSuccess: (result) => setSecretResult(result)
  })

  if (query.isLoading) {
    return (
      <div className="content-loading">
        <Spin />
      </div>
    )
  }
  if (!query.data) {
    return <Alert type="error" message="业务系统不存在" />
  }

  const businessSystem = query.data
  const businessSystemRouteId = businessSystemPathSegment(businessSystem.businessSystemId)
  const canManageBusiness = canManageBusinessSystems(currentAdminQuery.data)
  const canEditPermissions = canManagePermissions(currentAdminQuery.data)
  const canOpenPermissions = canViewPermissions(currentAdminQuery.data)

  return (
    <section className="page-section">
      <div className="detail-hero">
        <div className="detail-title-block">
          <span className="section-kicker">业务系统详情</span>
          <h1>{businessSystem.businessSystemName}</h1>
          <p className="detail-subtitle">{businessSystem.businessSystemId}</p>
        </div>
        <div className="detail-hero-actions">
          <Link className="secondary-action" to="/business-systems">
            返回列表
          </Link>
          {canManageBusiness ? (
            <ResetSecretAction onConfirm={() => resetMutation.mutateAsync().then(() => undefined)} />
          ) : null}
          {canOpenPermissions ? (
            <Link
              className="primary-link-action"
              to={`/business-systems/${businessSystemRouteId}/permissions`}
              state={{
                returnTo: `/business-systems/${businessSystemRouteId}`,
                returnLabel: '返回系统详情'
              }}
            >
              {canEditPermissions ? '配置接口授权' : '查看接口授权'}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="detail-overview">
        <section className="detail-credential-panel" aria-label="接入凭证概览">
          <div className="panel-heading-row">
            <div>
              <span className="section-kicker">接入凭证</span>
              <h2>调用身份</h2>
            </div>
            <StatusTag status={businessSystem.status} />
          </div>
          <div className="credential-value">
            <span>接入标识</span>
            <code>{businessSystem.clientId}</code>
            <CopyButton value={businessSystem.clientId} />
          </div>
          <div className="permission-summary-block">
            <span>当前接口授权</span>
            <PermissionChips apiPermissions={businessSystem.apiPermissions ?? []} />
          </div>
        </section>

        <div className="detail-metric-grid" aria-label="业务系统运行参数">
          <MetricItem
            icon={<KeyRound size={18} />}
            label="凭证版本"
            value={<span className="metric-badge">{businessSystem.tokenVersion}</span>}
          />
          <MetricItem
            icon={<ShieldCheck size={18} />}
            label="授权版本"
            value={<span className="metric-badge">{businessSystem.permissionVersion}</span>}
          />
          <MetricItem
            icon={<Clock3 size={18} />}
            label="令牌有效期"
            value={<span className="ttl-badge">{formatTtl(businessSystem.jwtTtlSeconds)}</span>}
          />
          <MetricItem icon={<Fingerprint size={18} />} label="系统状态" value={<StatusTag status={businessSystem.status} />} />
        </div>
      </div>

      {canManageBusiness ? (
        <section className="settings-section">
          <div className="section-heading">
            <span className="section-kicker">可编辑配置</span>
            <h2>基础信息</h2>
            <p>修改系统名称、状态和令牌有效期。停用会影响接入方调用。</p>
          </div>
          <BusinessSystemEditForm
            businessSystem={businessSystem}
            onSubmit={(request) => updateMutation.mutateAsync(request).then(() => undefined)}
          />
        </section>
      ) : (
        <Alert
          type="info"
          showIcon
          message="当前角色只能查看业务系统"
          description="如需编辑基础信息或重置密钥，请联系超级管理员或系统管理员。"
        />
      )}
      {secretResult ? (
        <SecretResultModal
          title="密钥已重置"
          clientId={secretResult.clientId}
          clientSecret={secretResult.clientSecret}
          versionText={`凭证版本：${secretResult.tokenVersion}`}
          onClose={() => setSecretResult(null)}
        />
      ) : null}
    </section>
  )
}

type MetricItemProps = Readonly<{
  icon: ReactNode
  label: string
  value: ReactNode
}>

function MetricItem({ icon, label, value }: MetricItemProps) {
  return (
    <div className="metric-item">
      <span className="metric-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type PermissionChipsProps = Readonly<{
  apiPermissions: string[]
}>

function PermissionChips({ apiPermissions }: PermissionChipsProps) {
  if (apiPermissions.length === 0) {
    return <span>-</span>
  }

  return (
    <ul className="permission-chip-list" aria-label="当前接口授权">
      {apiPermissions.map((apiCode) => (
        <li key={apiCode} title={apiCode}>
          {formatPermissionName(apiCode)}
        </li>
      ))}
    </ul>
  )
}
