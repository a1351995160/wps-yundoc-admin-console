import { Alert, Spin } from 'antd'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { canManageBusinessSystems } from '../auth/permissions'
import { useCurrentAdmin } from '../auth/useAuth'
import { createBusinessSystem } from './api'
import { SecretResultModal } from './SecretResultModal'
import type { BusinessSystemCreateResponse } from './types'

export function BusinessSystemCreatePage() {
  const [businessSystemId, setBusinessSystemId] = useState('')
  const [businessSystemName, setBusinessSystemName] = useState('')
  const [jwtTtlSeconds, setJwtTtlSeconds] = useState('1800')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<BusinessSystemCreateResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const currentAdminQuery = useCurrentAdmin()

  if (currentAdminQuery.isLoading) {
    return <Spin />
  }

  if (!canManageBusinessSystems(currentAdminQuery.data)) {
    return (
      <section className="page-section">
        <Alert
          type="warning"
          showIcon
          message="无权创建业务系统"
          description="只有超级管理员和系统管理员可以创建或调整业务系统。"
        />
      </section>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      const response = await createBusinessSystem({
        businessSystemId,
        businessSystemName,
        jwtTtlSeconds: Number(jwtTtlSeconds),
        description
      })
      setResult(response)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>创建业务系统</h1>
          <p>客户端密钥明文只会在创建成功后展示一次，关闭后不可再次查看。</p>
        </div>
        <Link to="/business-systems">返回列表</Link>
      </div>
      <form className="edit-grid edit-grid--centered" onSubmit={handleSubmit}>
        <label>
          <span>系统标识</span>
          <input
            aria-label="系统标识"
            value={businessSystemId}
            onChange={(event) => setBusinessSystemId(event.target.value)}
          />
        </label>
        <label>
          <span>系统名称</span>
          <input
            aria-label="系统名称"
            value={businessSystemName}
            onChange={(event) => setBusinessSystemName(event.target.value)}
            required
          />
        </label>
        <label>
          <span>令牌有效期（秒）</span>
          <input
            aria-label="令牌有效期"
            inputMode="numeric"
            value={jwtTtlSeconds}
            onChange={(event) => setJwtTtlSeconds(event.target.value)}
            required
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
        <div className="form-actions">
          <Link className="secondary-action" to="/business-systems">
            取消
          </Link>
          <button className="primary-button" type="submit" aria-label="创建业务系统" disabled={submitting}>
            {submitting ? '创建中' : '创建业务系统'}
          </button>
        </div>
      </form>
      {result ? (
        <SecretResultModal
          title="创建成功"
          clientId={result.businessSystem.clientId}
          clientSecret={result.clientSecret}
          onClose={() => setResult(null)}
        />
      ) : null}
    </section>
  )
}
