import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBusinessSystem, resetClientSecret, updateBusinessSystem } from './api'

function okResponse() {
  return new Response(JSON.stringify({ success: true, data: {} }), { status: 200 })
}

describe('business system api', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('encodes business system ids before putting them in request paths', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => okResponse())

    await getBusinessSystem('../users/victim')
    await updateBusinessSystem('a/b', {
      businessSystemName: 'Name',
      status: 'ENABLED',
      jwtTtlSeconds: 1800,
      description: ''
    })
    await resetClientSecret('a b')

    expect(fetchSpy.mock.calls.map(([input]) => input)).toEqual([
      '/api/v1/admin/business-systems/..%2Fusers%2Fvictim',
      '/api/v1/admin/business-systems/a%2Fb',
      '/api/v1/admin/business-systems/a%20b/client-secret:reset'
    ])
  })
})
