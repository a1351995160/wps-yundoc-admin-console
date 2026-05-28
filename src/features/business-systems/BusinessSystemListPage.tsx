import { useQuery } from '@tanstack/react-query'
import { Button, Input } from 'antd'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusTag } from '../../shared/ui/StatusTag'
import { formatTtl } from '../../shared/utils/ttl'
import { listBusinessSystems } from './api'
import type { BusinessSystemStatus } from './types'

export function BusinessSystemListPage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<BusinessSystemStatus | ''>('')
  const query = useQuery({
    queryKey: ['business-systems', keyword, status],
    queryFn: () => listBusinessSystems({ keyword, status, page: 1, pageSize: 20 })
  })

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>业务系统</h1>
          <p>管理接入系统、状态和业务凭证版本。</p>
        </div>
        <Link to="/business-systems/new">
          <Button type="primary" icon={<Plus size={16} />}>
            创建业务系统
          </Button>
        </Link>
      </div>
      <div className="toolbar">
        <Input
          aria-label="搜索业务系统"
          prefix={<Search size={16} aria-hidden="true" />}
          placeholder="搜索系统标识、名称或 clientId"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <select
          aria-label="状态筛选"
          value={status}
          onChange={(event) => setStatus(event.target.value as BusinessSystemStatus | '')}
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
              <th>系统标识</th>
              <th>系统名称</th>
              <th>clientId</th>
              <th>状态</th>
              <th>tokenVersion</th>
              <th>permissionVersion</th>
              <th>JWT TTL</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.items ?? []).map((item) => (
              <tr key={item.businessSystemId}>
                <td>
                  <Link to={`/business-systems/${item.businessSystemId}`}>
                    {item.businessSystemId}
                  </Link>
                </td>
                <td>{item.businessSystemName}</td>
                <td>{item.clientId}</td>
                <td>
                  <StatusTag status={item.status} />
                </td>
                <td>{item.tokenVersion}</td>
                <td>{item.permissionVersion}</td>
                <td>{formatTtl(item.jwtTtlSeconds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
