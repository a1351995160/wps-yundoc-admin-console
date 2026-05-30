import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PaginationControls } from './PaginationControls'
import { StatusTag } from './StatusTag'

describe('PaginationControls', () => {
  it('moves between available pages', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<PaginationControls page={2} hasMore onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: '上一页' }))
    await user.click(screen.getByRole('button', { name: '下一页' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })

  it('disables unavailable pagination actions', () => {
    render(<PaginationControls page={1} hasMore={false} loading onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled()
  })
})

describe('StatusTag', () => {
  it('renders enabled, disabled, and unknown states', () => {
    const { rerender } = render(<StatusTag status="ENABLED" />)

    expect(screen.getByText('启用')).toHaveClass('status-pill--enabled')

    rerender(<StatusTag status="DISABLED" />)
    expect(screen.getByText('停用')).toHaveClass('status-pill--disabled')

    rerender(<StatusTag status={null} />)
    expect(screen.getByText('未知')).toHaveClass('status-pill')
  })
})
