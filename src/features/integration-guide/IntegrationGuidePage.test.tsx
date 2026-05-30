import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IntegrationGuidePage } from './IntegrationGuidePage'

describe('IntegrationGuidePage', () => {
  it('uses real request field names with placeholders instead of secrets', () => {
    const { container } = render(<IntegrationGuidePage />)
    const text = container.textContent ?? ''

    expect(text).toContain('<接入标识>')
    expect(text).toContain('<客户端密钥>')
    expect(text).toContain('<业务访问令牌>')
    expect(text).toContain('clientId')
    expect(text).toContain('clientSecret')
    expect(text).toContain('"source"')
    expect(text).toContain('<请求签名密钥>')
    expect(text).toContain('X-Yundoc-User-Id')
    expect(text).toContain('X-Yundoc-User-Timestamp')
    expect(text).toContain('X-Yundoc-User-Nonce')
    expect(text).toContain('X-Yundoc-User-Signature')
    expect(text).toContain('base64url(HMAC-SHA256')

    expect(text).not.toContain('<business-jwt>')
    expect(text).not.toContain('eyJ')
    expect(text).not.toContain('real-client-secret')
    expect(text).not.toContain('wps-token-')
    expect(text).not.toContain('Bearer eyJ')
  })
})
