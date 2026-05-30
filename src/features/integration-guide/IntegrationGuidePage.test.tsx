import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IntegrationGuidePage } from './IntegrationGuidePage'

describe('IntegrationGuidePage', () => {
  it('uses placeholders instead of real client secrets, JWTs, or WPS tokens', () => {
    const { container } = render(<IntegrationGuidePage />)
    const text = container.textContent ?? ''

    expect(text).toContain('<接入标识>')
    expect(text).toContain('<客户端密钥>')
    expect(text).toContain('<业务访问令牌>')
    expect(text).toContain('<WPS访问令牌>')

    expect(text).not.toContain('<business-jwt>')
    expect(text).not.toContain('clientId')
    expect(text).not.toContain('clientSecret')
    expect(text).not.toContain('eyJ')
    expect(text).not.toContain('real-client-secret')
    expect(text).not.toContain('wps-token-')
    expect(text).not.toContain('Bearer eyJ')
  })
})
