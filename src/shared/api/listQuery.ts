type ListQueryValue = string | number | null | undefined

type NormalizedListParams = Record<string, string | number>

const DEFAULT_LIST_PARAMS = {
  page: 1,
  pageSize: 20
}

export function normalizeListParams(
  params: object,
  defaults: Record<string, string | number> = DEFAULT_LIST_PARAMS
): NormalizedListParams {
  const normalized: NormalizedListParams = {}
  const merged = { ...defaults, ...(params as Record<string, ListQueryValue>) }
  for (const [key, value] of Object.entries(merged)) {
    if (value !== null && value !== undefined && value !== '') {
      normalized[key] = value
    }
  }
  return normalized
}

export function buildListSearch(params: object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(normalizeListParams(params))) {
    search.set(key, String(value))
  }
  return search.toString()
}
