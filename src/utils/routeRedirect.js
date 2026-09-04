export const DEFAULT_AUTH_REDIRECT = '/prompt'

export function getSafeRedirectPath(value, fallback = DEFAULT_AUTH_REDIRECT) {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmedValue = value.trim()

  if (!trimmedValue.startsWith('/') || trimmedValue.startsWith('//')) {
    return fallback
  }

  return trimmedValue
}
