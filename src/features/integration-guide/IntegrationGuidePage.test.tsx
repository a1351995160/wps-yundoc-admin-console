import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IntegrationGuidePage } from './IntegrationGuidePage'

describe('IntegrationGuidePage', () => {
  it('uses placeholders instead of real client secrets, JWTs, or WPS tokens', () => {
    const { container } = render(<IntegrationGuidePage />)
    const text = container.textContent ?? ''

    expect(screen.getByText('<client-id>')).toBeInTheDocument()
    expect(screen.getByText('<client-secret>')).toBeInTheDocument()
    expect(screen.getByText('<business-jwt>')).toBeInTheDocument()
    expect(screen.getByText('<wps-access-token>')).toBeInTheDocument()

    expect(text).not.toContain('eyJ')
    expect(text).not.toContain('real-client-secret')
    expect(text).not.toContain('wps-token-')
    expect(text).not.toContain('Bearer eyJ')
  })
})
