import '@testing-library/jest-dom/vitest'

class TestResponse {
  readonly status: number
  readonly ok: boolean
  private readonly body: string | null

  constructor(body: string | null = null, init: { status?: number } = {}) {
    this.body = body
    this.status = init.status ?? 200
    this.ok = this.status >= 200 && this.status < 300
  }

  async json() {
    return this.body ? JSON.parse(this.body) : null
  }

  async text() {
    return this.body ?? ''
  }
}

if (!('Response' in globalThis)) {
  Object.defineProperty(globalThis, 'Response', {
    writable: true,
    value: TestResponse
  })
}

if (!('fetch' in globalThis)) {
  Object.defineProperty(globalThis, 'fetch', {
    writable: true,
    value: () => Promise.reject(new Error('fetch mock not configured'))
  })
}

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false
  })
})
