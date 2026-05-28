import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Descriptions, Spin } from 'antd'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusTag } from '../../shared/ui/StatusTag'
import { formatTtl } from '../../shared/utils/ttl'
import { getBusinessSystem, resetClientSecret, updateBusinessSystem } from './api'
import { BusinessSystemEditForm } from './BusinessSystemEditForm'
import { ResetSecretAction } from './ResetSecretAction'
import { SecretResultModal } from './SecretResultModal'
import type { BusinessSystemSecretResponse, BusinessSystemUpdateRequest } from './types'

export function BusinessSystemDetailPage() {
  const { businessSystemId = '' } = useParams()
  const queryClient = useQueryClient()
  const [secretResult, setSecretResult] = useState<BusinessSystemSecretResponse | null>(null)
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
    return <Spin />
  }
  if (!query.data) {
    return <Alert type="error" message="业务系统不存在" />
  }

  const businessSystem = query.data

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>{businessSystem.businessSystemName}</h1>
          <p>{businessSystem.businessSystemId}</p>
        </div>
        <Link to="/business-systems">返回列表</Link>
      </div>
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="clientId">{businessSystem.clientId}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <StatusTag status={businessSystem.status} />
        </Descriptions.Item>
        <Descriptions.Item label="tokenVersion">{businessSystem.tokenVersion}</Descriptions.Item>
        <Descriptions.Item label="permissionVersion">
          {businessSystem.permissionVersion}
        </Descriptions.Item>
        <Descriptions.Item label="JWT TTL">{formatTtl(businessSystem.jwtTtlSeconds)}</Descriptions.Item>
        <Descriptions.Item label="能力权限">
          {(businessSystem.apiPermissions ?? []).join(', ') || '-'}
        </Descriptions.Item>
      </Descriptions>
      <div className="detail-actions">
        <ResetSecretAction onConfirm={() => resetMutation.mutateAsync().then(() => undefined)} />
        <Link to={`/business-systems/${businessSystem.businessSystemId}/permissions`}>
          配置权限
        </Link>
      </div>
      <h2>基础信息</h2>
      <BusinessSystemEditForm
        businessSystem={businessSystem}
        onSubmit={(request) => updateMutation.mutateAsync(request).then(() => undefined)}
      />
      {secretResult ? (
        <SecretResultModal
          title="密钥已重置"
          clientId={secretResult.clientId}
          clientSecret={secretResult.clientSecret}
          versionText={`tokenVersion: ${secretResult.tokenVersion}`}
          onClose={() => setSecretResult(null)}
        />
      ) : null}
    </section>
  )
}
