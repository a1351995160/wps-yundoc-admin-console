import { describe, expect, it } from 'vitest'
import { formatTtl } from './ttl'

describe('formatTtl', () => {
  it('formats empty and second values safely', () => {
    expect(formatTtl(null)).toBe('-')
    expect(formatTtl(1800)).toBe('30 分钟')
  })
})
