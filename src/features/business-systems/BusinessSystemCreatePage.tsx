import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
          <p>密钥明文只会在创建成功后展示一次。</p>
        </div>
        <Link to="/business-systems">返回列表</Link>
      </div>
      <form className="edit-grid" onSubmit={handleSubmit}>
        <label>
          系统标识
        <input
          aria-label="系统标识"
          value={businessSystemId}
          onChange={(event) => setBusinessSystemId(event.target.value)}
          />
        </label>
        <label>
          系统名称
        <input
          aria-label="系统名称"
          value={businessSystemName}
          onChange={(event) => setBusinessSystemName(event.target.value)}
            required
          />
        </label>
        <label>
          JWT TTL
        <input
          aria-label="JWT TTL"
          inputMode="numeric"
          value={jwtTtlSeconds}
            onChange={(event) => setJwtTtlSeconds(event.target.value)}
            required
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
      <button className="primary-button" type="submit" aria-label="创建" disabled={submitting}>
        {submitting ? '创建中' : '创建'}
      </button>
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
