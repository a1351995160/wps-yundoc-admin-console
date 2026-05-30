import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBusinessSystemPermissions, saveBusinessSystemPermissions } from './api'

function okResponse() {
  return new Response(JSON.stringify({ success: true, data: {} }), { status: 200 })
}

describe('permissions api', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('encodes business system ids before using permission request paths', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => okResponse())

    await getBusinessSystemPermissions('../users/victim')
    await saveBusinessSystemPermissions('a/b', { apiPermissions: [] })

    expect(fetchSpy.mock.calls.map(([input]) => input)).toEqual([
      '/api/v1/admin/business-systems/..%2Fusers%2Fvictim/api-permissions',
      '/api/v1/admin/business-systems/a%2Fb/api-permissions'
    ])
  })
})
