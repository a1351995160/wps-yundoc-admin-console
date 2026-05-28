import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../shared/api/httpClient'
import {
  getBusinessSystemPermissions,
  listApiPermissionDefinitions,
  saveBusinessSystemPermissions
} from './api'
import { PermissionChangeSummary } from './PermissionChangeSummary'
import type { ApiPermissionDefinition, PermissionIdentityType } from './types'

const IDENTITY_TYPES: PermissionIdentityType[] = ['APP', 'USER']

export function PermissionEditorPage() {
  const { businessSystemId = '' } = useParams()
  const queryClient = useQueryClient()
  const [selectedPermissions, setSelectedPermissions] = useState<string[] | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const definitionsQuery = useQuery({
    queryKey: ['api-permission-definitions'],
    queryFn: listApiPermissionDefinitions
  })
  const permissionsQuery = useQuery({
    queryKey: ['business-system-permissions', businessSystemId],
    queryFn: () => getBusinessSystemPermissions(businessSystemId),
    enabled: Boolean(businessSystemId)
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
      setSaveMessage(`已保存，permissionVersion: ${updated.permissionVersion}`)
    },
    onError: (error) => {
      setSaveMessage('')
      setSaveError(error instanceof ApiError ? error.message : '保存失败')
    }
  })

  function togglePermission(apiCode: string) {
    setSaveMessage('')
    setSaveError('')
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

  if (definitionsQuery.isLoading || permissionsQuery.isLoading) {
    return <Spin />
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>权限控制</h1>
          <p>{businessSystemId}</p>
        </div>
        <Link to={`/business-systems/${businessSystemId}`}>返回系统详情</Link>
      </div>

      <div className="permission-layout">
        <div className="permission-groups">
          {IDENTITY_TYPES.map((identityType) => (
            <fieldset className="permission-group" key={identityType} aria-label={identityType}>
              <legend>{identityType}</legend>
              {definitions
                .filter((definition) => definition.identityType === identityType)
                .map((definition) => (
                  <PermissionOption
                    key={definition.apiCode}
                    definition={definition}
                    checked={selectedSet.has(definition.apiCode)}
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
          {saveError ? <p className="inline-error">{saveError}</p> : null}
          {saveMessage ? <p className="inline-success">{saveMessage}</p> : null}
          <button
            className="primary-button"
            type="button"
            disabled={saveMutation.isLoading}
            onClick={() => saveMutation.mutate()}
          >
            保存权限
          </button>
        </aside>
      </div>
    </section>
  )
}

interface PermissionOptionProps {
  definition: ApiPermissionDefinition
  checked: boolean
  onChange: () => void
}

function PermissionOption({ definition, checked, onChange }: PermissionOptionProps) {
  return (
    <label className="permission-option">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>
        <strong>{definition.apiCode}</strong>
        <span>{definition.displayName}</span>
        <small>
          {definition.riskLevel} · {definition.description}
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
