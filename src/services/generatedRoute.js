const ROUTE_ORIGIN = 'https://devpilot.invalid'

export function normalizeGeneratedRoute(value) {
  const input = typeof value === 'string'
    ? value
    : `${value?.pathname || '/'}${value?.search || ''}${value?.hash || ''}`
  if (input.length > 2500 || input.startsWith('//') || /[\u0000-\u001f]/.test(input)) return { pathname: '/', search: '', hash: '' }

  try {
    const url = new URL(input || '/', ROUTE_ORIGIN)
    if (url.origin !== ROUTE_ORIGIN) return { pathname: '/', search: '', hash: '' }
    return { pathname: url.pathname.startsWith('/') ? url.pathname : '/', search: url.search, hash: url.hash }
  } catch {
    return { pathname: '/', search: '', hash: '' }
  }
}

export function generatedRouteToString(route) {
  const normalized = normalizeGeneratedRoute(route)
  return `${normalized.pathname}${normalized.search}${normalized.hash}`
}

export function readGeneratedRoute(searchValue) {
  const raw = new URLSearchParams(searchValue).get('path')
  return normalizeGeneratedRoute(raw || '/')
}
