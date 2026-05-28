import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CopyButton } from './CopyButton'

describe('CopyButton', () => {
  it('copies the provided value only after a user click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    })

    render(<CopyButton value="client-secret" />)

    expect(writeText).not.toHaveBeenCalled()
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '复制' }))
    })

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('client-secret'))
    await waitFor(() => expect(screen.getByText('已复制')).toBeInTheDocument())
  })
})
