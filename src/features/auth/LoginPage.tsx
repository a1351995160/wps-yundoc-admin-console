import { Alert, Button, Form, Input } from 'antd'
import { LockKeyhole, LogIn, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../shared/api/httpClient'
import { loginAdmin } from './api'
import { saveAdminSession } from './authSession'

interface LoginFormValues {
  username: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(values: LoginFormValues) {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const result = await loginAdmin(values)
      saveAdminSession(result)
      navigate('/business-systems', { replace: true })
    } catch (error) {
      setErrorMessage(toSafeLoginMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-surface">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <LogIn aria-hidden="true" />
          <span>Yundoc Admin</span>
        </div>
        <h1 id="login-title">登录管理台</h1>
        {errorMessage ? (
          <Alert role="alert" type="error" showIcon message={errorMessage} />
        ) : null}
        <Form<LoginFormValues> layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<User size={16} aria-hidden="true" />} autoComplete="username" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockKeyhole size={16} aria-hidden="true" />}
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} aria-label="登录" block>
            登录
          </Button>
        </Form>
      </section>
    </main>
  )
}

function toSafeLoginMessage(error: unknown): string {
  if (error instanceof ApiError && error.code) {
    return `登录失败：${error.code}`
  }
  return '登录失败'
}
