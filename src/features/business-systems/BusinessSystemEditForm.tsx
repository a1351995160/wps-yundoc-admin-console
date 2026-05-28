import type { FormEvent } from 'react'
import { useState } from 'react'
import type { BusinessSystem, BusinessSystemStatus, BusinessSystemUpdateRequest } from './types'

interface BusinessSystemEditFormProps {
  businessSystem: BusinessSystem
  onSubmit: (request: BusinessSystemUpdateRequest) => Promise<void>
}

export function BusinessSystemEditForm({ businessSystem, onSubmit }: BusinessSystemEditFormProps) {
  const [businessSystemName, setBusinessSystemName] = useState(businessSystem.businessSystemName)
  const [status, setStatus] = useState<BusinessSystemStatus>(businessSystem.status)
  const [jwtTtlSeconds, setJwtTtlSeconds] = useState(String(businessSystem.jwtTtlSeconds))
  const [description, setDescription] = useState(businessSystem.description ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
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
        系统名称
        <input
          aria-label="系统名称"
          value={businessSystemName}
          onChange={(event) => setBusinessSystemName(event.target.value)}
        />
      </label>
      <label>
        状态
        <select
          aria-label="状态"
          value={status}
          onChange={(event) => setStatus(event.target.value as BusinessSystemStatus)}
        >
          <option value="ENABLED">启用</option>
          <option value="DISABLED">停用</option>
        </select>
      </label>
      <label>
        JWT TTL
        <input
          aria-label="JWT TTL"
          inputMode="numeric"
          value={jwtTtlSeconds}
          onChange={(event) => setJwtTtlSeconds(event.target.value)}
        />
      </label>
      <label>
        描述
        <textarea
          aria-label="描述"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? '保存中' : '保存基础信息'}
      </button>
    </form>
  )
}
