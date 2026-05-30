import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Spin } from 'antd'
import { FileKey2, GitCompareArrows, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError } from '../../shared/api/httpClient'
import { SummaryItem } from '../../shared/ui/SummaryItem'
import { canManagePermissions, canViewPermissions } from '../auth/permissions'
import { useCurrentAdmin } from '../auth/useAuth'
import { businessSystemPathSegment } from '../business-systems/api'
import {
  getBusinessSystemPermissions,
  listApiPermissionDefinitions,
  saveBusinessSystemPermissions
} from './api'
import { PermissionChangeSummary } from './PermissionChangeSummary'
import { PERMISSION_DESCRIPTION_BY_CODE, PERMISSION_NAME_BY_CODE } from './permissionLabels'
import type { ApiPermissionDefinition, PermissionIdentityType } from './types'

const IDENTITY_TYPES: PermissionIdentityType[] = ['APP', 'USER']
const IDENTITY_LABELS: Record<PermissionIdentityType, string> = {
  APP: '应用身份接口',
  USER: '用户身份接口'
}
const RISK_LABELS: Record<ApiPermissionDefinition['riskLevel'], string> = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险'
}

export function PermissionEditorPage() {
  const { businessSystemId = '' } = useParams()
  const location = useLocation()
  const returnState = location.state as { returnTo?: string; returnLabel?: string } | null
  const returnTo = returnState?.returnTo ?? `/business-systems/${businessSystemPathSegment(businessSystemId)}`
  const returnLabel = returnState?.returnLabel ?? '返回系统详情'
  const queryClient = useQueryClient()
  const [selectedPermissions, setSelectedPermissions] = useState<string[] | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [waitingConfirm, setWaitingConfirm] = useState(false)
  const currentAdminQuery = useCurrentAdmin()
  const canView = canViewPermissions(currentAdminQuery.data)
  const canManage = canManagePermissions(currentAdminQuery.data)

  const definitionsQuery = useQuery({
    queryKey: ['api-permission-definitions'],
    queryFn: listApiPermissionDefinitions,
    enabled: canView
  })
  const permissionsQuery = useQuery({
    queryKey: ['business-system-permissions', businessSystemId],
    queryFn: () => getBusinessSystemPermissions(businessSystemId),
    enabled: canView && Boolean(businessSystemId)
  })

  const originalPermissions = permissionsQuery.data?.apiPermissions ?? []
  useEffect(() => {
    if (permissionsQuery.data && selectedPermissions === null) {
      setSelectedPermissions(permissionsQuery.data.apiPermissions ?? [])
    }
  }, [permissionsQuery.data, selectedPermissions])

  const definitions = definitionsQuery.data ?? []
  const selected = selectedPermissions ?? originalPermissions
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const saveMutation = useMutation({
    mutationFn: () =>
      saveBusinessSystemPermissions(businessSystemId, {
        apiPermissions: orderSelectedPermissions(definitions, selected)
      }),
    onSuccess: (updated) => {
      const nextPermissions = updated.apiPermissions ?? []
      queryClient.setQueryData(['business-system-permissions', businessSystemId], updated)
      setSelectedPermissions(nextPermissions)
      setSaveError('')
      setWaitingConfirm(false)
      setSaveMessage(`已保存，授权版本：${updated.permissionVersion}`)
    },
    onError: (error) => {
      setSaveMessage('')
      setSaveError(error instanceof ApiError ? error.message : '保存失败')
    }
  })

  function togglePermission(apiCode: string) {
    if (!canManage) {
      return
    }
    setSaveMessage('')
    setSaveError('')
    setWaitingConfirm(false)
    setSelectedPermissions((current) => {
      const currentSet = new Set(current ?? originalPermissions)
      if (currentSet.has(apiCode)) {
        currentSet.delete(apiCode)
      } else {
        currentSet.add(apiCode)
      }
      return orderSelectedPermissions(definitions, Array.from(currentSet))
    })
  }

  if (currentAdminQuery.isLoading || definitionsQuery.isLoading || permissionsQuery.isLoading) {
    return (
      <div className="content-loading">
        <Spin />
      </div>
    )
  }

  if (!canView) {
    return (
      <section className="page-section">
        <Alert
          type="warning"
          showIcon
          message="无权访问权限管理"
          description="当前角色不能查看或配置接口授权。请联系超级管理员或系统管理员处理授权变更。"
        />
      </section>
    )
  }

  const hasChanges = !samePermissions(originalPermissions, selected)
  const selectedDefinitions = definitions.filter((definition) => selectedSet.has(definition.apiCode))
  const highRiskCount = selectedDefinitions.filter((definition) => definition.riskLevel === 'HIGH').length

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>接口授权</h1>
          <p>{businessSystemId}</p>
        </div>
        <Link to={returnTo}>{returnLabel}</Link>
      </div>

      <div className="permission-editor-summary" aria-label="授权编辑状态">
        <SummaryItem icon={<FileKey2 size={18} />} label="已选择能力" value={`${selected.length}`} />
        <SummaryItem icon={<ShieldAlert size={18} />} label="高风险能力" value={`${highRiskCount}`} />
        <SummaryItem icon={<GitCompareArrows size={18} />} label="变更状态" value={hasChanges ? '有待保存变更' : '未变更'} />
        <div className="mode-card">
          <span>{canManage ? '可编辑模式' : '只读模式'}</span>
          <strong>{canManage ? '保存前会再次确认' : '当前角色不能保存变更'}</strong>
        </div>
      </div>

      <div className="permission-layout">
        <div className="permission-groups">
          {IDENTITY_TYPES.map((identityType) => (
            <fieldset
              className="permission-group"
              key={identityType}
              aria-label={IDENTITY_LABELS[identityType]}
            >
              <legend>{IDENTITY_LABELS[identityType]}</legend>
              {definitions
                .filter((definition) => definition.identityType === identityType)
                .map((definition) => (
                  <PermissionOption
                    key={definition.apiCode}
                    definition={definition}
                    checked={selectedSet.has(definition.apiCode)}
                    disabled={!canManage}
                    onChange={() => togglePermission(definition.apiCode)}
                  />
                ))}
            </fieldset>
          ))}
        </div>

        <aside className="permission-side-panel">
          <PermissionChangeSummary
            originalPermissions={originalPermissions}
            selectedPermissions={selected}
          />
          {canManage ? null : (
            <Alert type="info" showIcon message="当前角色只能查看接口授权，不能保存变更。" />
          )}
          {waitingConfirm ? (
            <div className="risk-confirm" role="alert">
              <strong>请确认保存接口授权</strong>
              <span>授权变化会影响该业务系统可调用的后台能力，并会更新授权版本。</span>
            </div>
          ) : null}
          {saveError ? <p className="inline-error">{saveError}</p> : null}
          {saveMessage ? <p className="inline-success">{saveMessage}</p> : null}
          <button
            className="primary-button"
            type="button"
            disabled={!canManage || !hasChanges || saveMutation.isLoading}
            onClick={() => {
              if (!waitingConfirm) {
                setWaitingConfirm(true)
                return
              }
              saveMutation.mutate()
            }}
          >
            {waitingConfirm ? '确认保存接口授权' : '保存接口授权'}
          </button>
        </aside>
      </div>
    </section>
  )
}

type PermissionOptionProps = Readonly<{
  definition: ApiPermissionDefinition
  checked: boolean
  disabled: boolean
  onChange: () => void
}>

function PermissionOption({ definition, checked, disabled, onChange }: PermissionOptionProps) {
  const displayName = PERMISSION_NAME_BY_CODE[definition.apiCode] ?? definition.displayName
  const description = PERMISSION_DESCRIPTION_BY_CODE[definition.apiCode] ?? definition.description
  return (
    <label
      className={`permission-option${checked ? ' permission-option--selected' : ''}${disabled ? ' permission-option--disabled' : ''}`}
    >
      <input
        className={`permission-option-control${checked ? ' permission-option--selected' : ''}`}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-label={displayName}
        onChange={onChange}
      />
      <span className="permission-option-check" aria-hidden="true">
        {checked ? '✓' : ''}
      </span>
      <span>
        <strong>{displayName}</strong>
        <small>
          {RISK_LABELS[definition.riskLevel]} · {description}
        </small>
      </span>
    </label>
  )
}

function orderSelectedPermissions(
  definitions: ApiPermissionDefinition[],
  selectedPermissions: string[]
): string[] {
  const selectedSet = new Set(selectedPermissions)
  const knownPermissions = definitions
    .filter((definition) => selectedSet.has(definition.apiCode))
    .map((definition) => definition.apiCode)
  const unknownPermissions = selectedPermissions.filter(
    (apiCode) => !definitions.some((definition) => definition.apiCode === apiCode)
  )
  return [...knownPermissions, ...unknownPermissions]
}

function samePermissions(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }
  const rightSet = new Set(right)
  return left.every((apiCode) => rightSet.has(apiCode))
}
