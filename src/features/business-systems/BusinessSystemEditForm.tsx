import type { FormEvent } from 'react'
import { useState } from 'react'
import type { BusinessSystem, BusinessSystemStatus, BusinessSystemUpdateRequest } from './types'

type BusinessSystemEditFormProps = Readonly<{
  businessSystem: BusinessSystem
  onSubmit: (request: BusinessSystemUpdateRequest) => Promise<void>
}>

export function BusinessSystemEditForm({ businessSystem, onSubmit }: BusinessSystemEditFormProps) {
  const [businessSystemName, setBusinessSystemName] = useState(businessSystem.businessSystemName)
  const [status, setStatus] = useState<BusinessSystemStatus>(businessSystem.status)
  const [jwtTtlSeconds, setJwtTtlSeconds] = useState(String(businessSystem.jwtTtlSeconds))
  const [description, setDescription] = useState(businessSystem.description ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [waitingConfirm, setWaitingConfirm] = useState(false)
  const disablesSystem = businessSystem.status !== 'DISABLED' && status === 'DISABLED'
  const submitLabel = getSubmitLabel(submitting, waitingConfirm)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (disablesSystem && !waitingConfirm) {
      setWaitingConfirm(true)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        businessSystemName,
        status,
        jwtTtlSeconds: Number(jwtTtlSeconds),
        description
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="edit-grid" onSubmit={handleSubmit}>
      <label>
        <span>系统名称</span>
        <input
          aria-label="系统名称"
          value={businessSystemName}
          onChange={(event) => setBusinessSystemName(event.target.value)}
        />
      </label>
      <label>
        <span>状态</span>
        <select
          aria-label="状态"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as BusinessSystemStatus)
            setWaitingConfirm(false)
          }}
        >
          <option value="ENABLED">启用</option>
          <option value="DISABLED">停用</option>
        </select>
      </label>
      <label>
        <span>令牌有效期（秒）</span>
        <input
          aria-label="令牌有效期"
          inputMode="numeric"
          value={jwtTtlSeconds}
          onChange={(event) => setJwtTtlSeconds(event.target.value)}
        />
      </label>
      <label>
        <span>描述</span>
        <textarea
          aria-label="描述"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      {waitingConfirm ? (
        <div className="risk-confirm" role="alert">
          <strong>请确认停用业务系统</strong>
          <span>停用后，该业务系统将无法继续使用当前接入能力，请确认接入方已知晓影响。</span>
        </div>
      ) : null}
      <button className="primary-button" type="submit" disabled={submitting}>
        {submitLabel}
      </button>
    </form>
  )
}

function getSubmitLabel(submitting: boolean, waitingConfirm: boolean): string {
  if (submitting) {
    return '保存中'
  }
  if (waitingConfirm) {
    return '确认保存'
  }
  return '保存基础信息'
}
