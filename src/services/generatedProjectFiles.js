const ENTRYPOINT_PRIORITY = [
  'src/main.jsx',
  'src/main.tsx',
  'src/main.js',
  'src/main.ts',
]
const ALTERNATIVE_ENTRYPOINTS = [
  'src/index.jsx', 'src/index.tsx', 'src/index.js', 'src/index.ts',
  'src/client.jsx', 'src/client.tsx', 'src/client.js', 'src/client.ts',
  'src/entry.jsx', 'src/entry.tsx', 'src/entry.js', 'src/entry.ts',
  'index.jsx', 'index.tsx', 'index.js', 'index.ts',
]

function normalizeGeneratedPath(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('A generated file has no valid path.')
  let path = value.trim().replace(/\\/g, '/')
  if (path.startsWith('/') || /^[a-z]:/i.test(path)) throw new Error(`Generated file path must be relative: ${value}`)
  path = path.replace(/\/{2,}/g, '/')
  while (path.startsWith('./')) path = path.slice(2)
  const segments = path.split('/')
  if (segments.some((segment) => segment === '..')) throw new Error(`Generated file path contains an unsafe traversal segment: ${value}`)
  path = segments.filter((segment) => segment && segment !== '.').join('/')
  if (/^frontend\//i.test(path)) path = path.slice('frontend/'.length)
  if (!path || path.split('/').some((segment) => segment === '..')) throw new Error(`Generated file path is invalid: ${value}`)
  return path
}

function getFileList(generatedFiles) {
  if (Array.isArray(generatedFiles)) return generatedFiles
  if (generatedFiles && typeof generatedFiles === 'object') {
    return Object.entries(generatedFiles).map(([path, file]) => ({ ...(file || {}), path: file?.path || path }))
  }
  throw new Error('The project response does not contain a generated file list.')
}

export function normalizeGeneratedProjectFiles(generatedFiles) {
  const files = new Map()
  for (const rawFile of getFileList(generatedFiles)) {
    if (!rawFile || typeof rawFile !== 'object') continue
    const path = normalizeGeneratedPath(rawFile.path)
    if (files.has(path)) throw new Error(`Generated project contains duplicate normalized file path "${path}".`)
    if (typeof rawFile.content !== 'string') throw new Error(`Generated file "${path}" has no text content.`)
    const language = typeof rawFile.language === 'string' && rawFile.language.trim()
      ? rawFile.language.trim().toLowerCase()
      : 'text'
    files.set(path, { path, content: rawFile.content, language })
  }
  return files
}

function resolveExistingPath(files, candidate) {
  const lowerCandidate = candidate.toLowerCase()
  for (const path of files.keys()) {
    if (path.toLowerCase() === lowerCandidate) return path
  }
  return null
}

function entryFromHtml(files) {
  const html = files.get('index.html')?.content || ''
  const scripts = html.matchAll(/<script\b([^>]*)\bsrc=["']([^"']+)["'][^>]*>/gi)
  for (const match of scripts) {
    const attributes = match[1] || ''
    const source = match[2].replace(/[?#].*$/, '').replace(/^\//, '')
    if (!/\.(?:[cm]?[jt]sx?)$/i.test(source)) continue
    if (/\btype=["']module["']/i.test(attributes) || /\.(?:jsx|tsx)$/i.test(source)) {
      const existing = resolveExistingPath(files, source)
      if (existing) return existing
    }
  }
  return null
}

export function findGeneratedFrontendEntryPoint(files) {
  const preferred = ENTRYPOINT_PRIORITY.map((path) => resolveExistingPath(files, path)).find(Boolean)
  if (preferred) return preferred

  const fromHtml = entryFromHtml(files)
  if (fromHtml) return fromHtml

  const packageContent = files.get('package.json')?.content
  if (packageContent) {
    try {
      const packageJson = JSON.parse(packageContent)
      for (const candidate of [packageJson.module, packageJson.browser, packageJson.source, packageJson.main]) {
        if (typeof candidate !== 'string') continue
        const path = normalizeGeneratedPath(candidate)
        const existing = resolveExistingPath(files, path)
        if (existing && /\.[cm]?[jt]sx?$/i.test(existing)) return existing
      }
    } catch { /* Malformed package JSON is reported by the bundle stage. */ }
  }

  return ALTERNATIVE_ENTRYPOINTS.map((path) => resolveExistingPath(files, path)).find(Boolean) || null
}

export { normalizeGeneratedPath }
