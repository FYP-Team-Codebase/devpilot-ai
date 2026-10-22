const URL_SCHEME = /^([a-z][a-z\d+.-]*):/i

export function isSupportedExternalCssResource({ path, kind } = {}) {
  if (kind !== 'import-rule' && kind !== 'url-token') return false
  let url
  try { url = new URL(path) } catch { return false }
  if (url.protocol !== 'https:' || url.username || url.password) return false

  // The preview CSP permits Google Fonts stylesheets. Keep this exception
  // limited to CSS imports; JavaScript module URLs remain unsupported.
  if (kind === 'import-rule') {
    return url.hostname === 'fonts.googleapis.com' && /^\/css2?(?:\/|$)/.test(url.pathname)
  }

  // HTTPS CSS resources (for example background images) remain in the CSS
  // output and are subject to the iframe's resource policy.
  return true
}

export function externalCssImportError({ path, kind } = {}) {
  if (kind !== 'import-rule' || isSupportedExternalCssResource({ path, kind })) return null
  const scheme = String(path || '').match(URL_SCHEME)?.[1]?.toLowerCase()
  if (!scheme) return null
  return `The isolated preview cannot load this external CSS stylesheet (${scheme}:). Use a local stylesheet or a Google Fonts CSS import.`
}

export function collectExternalModuleSpecifiers(metafile) {
  const specifiers = new Set()
  for (const [outputPath, output] of Object.entries(metafile?.outputs || {})) {
    // CSS imports and url() references are browser resources, not JavaScript
    // modules that belong in the import map.
    if (!/\.m?js$/i.test(outputPath)) continue
    for (const item of output.imports || []) {
      if (item.external) specifiers.add(item.path)
    }
  }
  return specifiers
}

export function externalModuleImportError(specifier) {
  const scheme = String(specifier || '').match(URL_SCHEME)?.[1]?.toLowerCase()
  if (!scheme) return null
  return `The isolated preview cannot load external JavaScript module URLs (${scheme}:). Add the library as a supported dependency in package.json.`
}
