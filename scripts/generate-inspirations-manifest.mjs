import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { inspirationMetadata } from './inspiration-metadata.mjs'

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const IGNORED_FILES = new Set(['.ds_store', 'thumbs.db'])
const FULL_PAGE_HINTS = ['full-page', 'fullpage', 'full page', 'complete', 'website', 'full', 'landing', 'cover']
const PREVIEW_HINTS = ['homepage', 'home', 'hero', 'cover', 'landing', 'feature']
const DEFAULT_TYPE = 'Website'
const DEFAULT_CATEGORY = 'Other'
const CLASSIFICATION_VERSION = 2
const PREVIEW_FITS = new Set(['cover', 'contain'])
const PREVIEW_POSITIONS = new Set(['top', 'center'])
const ALLOWED_CATEGORIES = new Set([
  'Ecommerce',
  'SaaS',
  'Portfolio',
  'Blog',
  'Agency',
  'Business',
  'Healthcare',
  'Education',
  'Finance',
  'Restaurant',
  'Travel',
  'Real Estate',
  'Other',
])
const ALLOWED_STYLES = new Set([
  'Minimal',
  'Dark',
  'Editorial',
  'Corporate',
  'Playful',
  'Bold',
  'Clean',
  'Luxury',
  'Creative',
  'Friendly',
])
const CATEGORY_ALIASES = new Map([
  ['e-commerce', 'Ecommerce'],
  ['ecommerce', 'Ecommerce'],
  ['shop', 'Ecommerce'],
  ['store', 'Ecommerce'],
  ['shopping', 'Ecommerce'],
  ['software', 'SaaS'],
  ['platform', 'SaaS'],
  ['ai platform', 'SaaS'],
  ['ai tool', 'SaaS'],
  ['artificial intelligence', 'SaaS'],
  ['saas', 'SaaS'],
  ['portfolio website', 'Portfolio'],
  ['personal portfolio', 'Portfolio'],
  ['portfolio', 'Portfolio'],
  ['news', 'Blog'],
  ['article', 'Blog'],
  ['blog', 'Blog'],
  ['creative studio', 'Agency'],
  ['studio', 'Agency'],
  ['agency', 'Agency'],
  ['dashboard', 'Business'],
  ['analytics', 'Business'],
  ['business', 'Business'],
  ['medical', 'Healthcare'],
  ['health', 'Healthcare'],
  ['healthcare', 'Healthcare'],
  ['course', 'Education'],
  ['school', 'Education'],
  ['education', 'Education'],
  ['expense', 'Finance'],
  ['banking', 'Finance'],
  ['finance', 'Finance'],
  ['food', 'Restaurant'],
  ['menu', 'Restaurant'],
  ['restaurant', 'Restaurant'],
  ['hotel', 'Travel'],
  ['travel', 'Travel'],
  ['property', 'Real Estate'],
  ['real estate', 'Real Estate'],
])

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultProjectRoot = path.resolve(__dirname, '..')

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeSlashes(value) {
  return value.replace(/\\/g, '/')
}

function toPublicUrl(relativePath) {
  return `/${normalizeSlashes(relativePath).split('/').map(encodeURIComponent).join('/')}`
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function titleFromFolder(folder) {
  const title = folder
    .replace(/[_-]+/g, ' ')
    .replace(/^inspirations\b/i, 'Inspiration')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return title
}

function normalizeCategory(category) {
  const value = String(category || '').trim()
  if (!value) return ''

  const lower = value.toLowerCase()
  const aliased = CATEGORY_ALIASES.get(lower)
  if (aliased) return aliased

  const normalized = value.replace(/\b\w/g, (char) => char.toUpperCase())
  return ALLOWED_CATEGORIES.has(normalized) ? normalized : DEFAULT_CATEGORY
}

function normalizeStyle(style) {
  const value = String(style || '').trim()
  if (!value) return ''

  const lower = value.toLowerCase()
  const normalized = lower.replace(/\b\w/g, (char) => char.toUpperCase())
  return ALLOWED_STYLES.has(normalized) ? normalized : ''
}

function normalizeTitle(title) {
  return String(title || '').trim().replace(/\s+/g, ' ').slice(0, 48)
}

function cleanMetadata(metadata = {}) {
  metadata = metadata || {}
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : []
  const previewFit = String(metadata.previewFit || '').trim().toLowerCase()
  const previewPosition = String(metadata.previewPosition || '').trim().toLowerCase()

  return {
    title: normalizeTitle(metadata.title),
    category: normalizeCategory(metadata.category),
    type: String(metadata.type || DEFAULT_TYPE).trim() || DEFAULT_TYPE,
    style: normalizeStyle(metadata.style),
    tags,
    description: String(metadata.description || '').trim(),
    designDirection: String(metadata.designDirection || '').trim(),
    previewFit: PREVIEW_FITS.has(previewFit) ? previewFit : '',
    previewPosition: PREVIEW_POSITIONS.has(previewPosition) ? previewPosition : '',
  }
}

function metadataHasClassification(metadata) {
  return Boolean(metadata.title && metadata.category)
}

function finalizeMetadata(metadata, folder) {
  const cleaned = cleanMetadata(metadata)
  return {
    ...cleaned,
    title: cleaned.title || titleFromFolder(folder),
    category: cleaned.category || DEFAULT_CATEGORY,
    type: cleaned.type || DEFAULT_TYPE,
  }
}

async function metadataFileSignature(folderPath) {
  try {
    const stats = await fs.stat(path.join(folderPath, 'metadata.json'))
    return {
      size: stats.size,
      mtimeMs: Math.round(stats.mtimeMs || 0),
    }
  } catch {
    return null
  }
}

function makeAssetFingerprint(folder, images, metadataSignature = null) {
  const payload = {
    folder,
    metadata: metadataSignature,
    images: images.map((image) => ({
      path: normalizeSlashes(image.relativeToFolder),
      size: image.size,
      mtimeMs: Math.round(image.mtimeMs || 0),
      width: image.width,
      height: image.height,
    })),
  }

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 16)
}

async function readJsonFile(filePath, fallback = {}) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    console.warn(`[inspirations] Ignored invalid JSON file ${path.basename(filePath)}.`, error)
    return fallback
  }
}

async function readGeneratedMetadataCache(inspirationsRoot) {
  return readJsonFile(path.join(inspirationsRoot, 'generated-metadata.json'), {})
}

async function writeGeneratedMetadataCache(inspirationsRoot, cache) {
  const cachePath = path.join(inspirationsRoot, 'generated-metadata.json')
  const nextContent = `${JSON.stringify(cache, null, 2)}\n`

  let currentContent = ''
  try {
    currentContent = await fs.readFile(cachePath, 'utf8')
  } catch {
    currentContent = ''
  }

  if (currentContent !== nextContent) {
    await fs.writeFile(cachePath, nextContent)
  }
}

async function readFolderMetadata(folderPath) {
  return readJsonFile(path.join(folderPath, 'metadata.json'), {})
}

function wordsForClassification(folder, images) {
  return [
    folder,
    ...images.flatMap((image) => [
      image.name,
      image.relativeToFolder,
    ]),
  ]
    .join(' ')
    .toLowerCase()
    .replace(/porfolio/g, 'portfolio')
    .replace(/productivty/g, 'productivity')
    .replace(/iamge/g, 'image')
    .replace(/[_\-'.()]+/g, ' ')
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term))
}

function classifyWithHeuristics(folder, images) {
  const text = wordsForClassification(folder, images)
  const hasPortfolio = hasAny(text, ['portfolio', 'about me', 'my projects', 'services port', 'designer', 'ui ux', 'ux designer'])
  const hasEcommerce = hasAny(text, ['ecommerce', 'shop', 'store', 'shopping', 'product page', 'products section', 'products'])
  const hasSaas = hasAny(text, ['saas', 'pricing', 'feature', 'features', 'dashboard', 'landing', 'app', 'platform', 'automation'])
  const tags = []

  if (hasAny(text, ['pet', 'pets', 'dog', 'cat'])) {
    return {
      title: 'Pet Ecommerce',
      category: 'Ecommerce',
      style: 'Friendly',
      tags: ['pets', 'shop'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['furniture', 'furniro', 'chair', 'home']) && hasEcommerce) {
    return {
      title: 'Furniture Ecommerce',
      category: 'Ecommerce',
      style: 'Minimal',
      tags: ['furniture', 'shop'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasPortfolio) {
    if (hasAny(text, ['product'])) {
      return {
        title: 'Product Designer Portfolio',
        category: 'Portfolio',
        style: 'Creative',
        tags: ['portfolio', 'design'],
        generated: true,
        source: 'heuristic',
      }
    }

    if (hasAny(text, ['ui ux', 'ux designer', 'ui designer', 'designer', 'design', 'skills', 'about me', 'my projects', 'services'])) {
      return {
        title: 'UI/UX Portfolio',
        category: 'Portfolio',
        style: hasAny(text, ['dark']) ? 'Dark' : 'Creative',
        tags: ['portfolio', 'design'],
        generated: true,
        source: 'heuristic',
      }
    }

    return {
      title: 'Portfolio Website',
      category: 'Portfolio',
      style: 'Creative',
      tags: ['portfolio'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['ai', 'automation', 'intelligence'])) {
    return {
      title: 'AI SaaS',
      category: 'SaaS',
      style: hasAny(text, ['dark']) ? 'Dark' : 'Clean',
      tags: ['ai', 'saas'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['expense', 'expenses', 'xpense', 'finance', 'pricing part'])) {
    return {
      title: 'Finance SaaS',
      category: 'SaaS',
      style: 'Playful',
      tags: ['finance', 'expenses'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['analytics', 'data', 'report', 'reports'])) {
    return {
      title: hasAny(text, ['dashboard']) ? 'Analytics Dashboard' : 'Data SaaS',
      category: hasAny(text, ['dashboard']) ? 'Business' : 'SaaS',
      style: 'Minimal',
      tags: ['analytics', 'data'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['productivity', 'tasks'])) {
    return {
      title: 'Productivity SaaS',
      category: 'SaaS',
      style: 'Bold',
      tags: ['productivity', 'tasks'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['blog', 'article', 'news'])) {
    return {
      title: 'Technology Blog',
      category: 'Blog',
      style: 'Editorial',
      tags: ['blog'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['agency', 'studio', 'services'])) {
    return {
      title: 'Creative Agency',
      category: 'Agency',
      style: 'Creative',
      tags: ['agency'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['restaurant', 'food', 'menu'])) {
    return {
      title: 'Restaurant Website',
      category: 'Restaurant',
      style: 'Clean',
      tags: ['restaurant'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['healthcare', 'health', 'medical'])) {
    return {
      title: 'Healthcare Website',
      category: 'Healthcare',
      style: 'Clean',
      tags: ['healthcare'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['education', 'course', 'school'])) {
    return {
      title: 'Education Website',
      category: 'Education',
      style: 'Clean',
      tags: ['education'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['travel', 'hotel', 'booking'])) {
    return {
      title: 'Travel Website',
      category: 'Travel',
      style: 'Editorial',
      tags: ['travel'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasAny(text, ['real estate', 'property', 'properties'])) {
    return {
      title: 'Real Estate Website',
      category: 'Real Estate',
      style: 'Corporate',
      tags: ['real estate'],
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasSaas) {
    tags.push('saas')
    return {
      title: 'SaaS Website',
      category: 'SaaS',
      style: 'Clean',
      tags,
      generated: true,
      source: 'heuristic',
    }
  }

  if (hasEcommerce) {
    tags.push('shop')
    return {
      title: 'Ecommerce Website',
      category: 'Ecommerce',
      style: 'Clean',
      tags,
      generated: true,
      source: 'heuristic',
    }
  }

  return {
    title: titleFromFolder(folder),
    category: DEFAULT_CATEGORY,
    style: '',
    tags: [],
    generated: true,
    source: 'fallback',
  }
}

async function classifyWithVisionIfAvailable() {
  return null
}

async function resolveMetadata({ folder, folderPath, images, galleryPreview, fingerprint, generatedMetadataCache }) {
  const cacheEntry = generatedMetadataCache[folder]
  const cleanCache = cleanMetadata(cacheEntry || {})
  if (
    cacheEntry?.assetFingerprint === fingerprint &&
    cacheEntry?.classificationVersion === CLASSIFICATION_VERSION &&
    metadataHasClassification(cleanCache)
  ) {
    return {
      metadata: finalizeMetadata(cleanCache, folder),
      cacheEntry,
      shouldCache: false,
    }
  }

  const folderMetadata = cleanMetadata(await readFolderMetadata(folderPath))
  const override = cleanMetadata(inspirationMetadata[folder.toLowerCase()] || {})
  const visualMetadata = cleanMetadata({
    ...override,
    ...folderMetadata,
  })

  let classification = {}
  let classificationSource = 'fallback'

  if (metadataHasClassification(folderMetadata)) {
    classification = folderMetadata
    classificationSource = 'metadata.json'
  } else if (metadataHasClassification(override)) {
    classification = override
    classificationSource = 'metadata-map'
  } else {
    const visionMetadata = cleanMetadata(await classifyWithVisionIfAvailable({ folder, images, galleryPreview }))
    if (metadataHasClassification(visionMetadata)) {
      classification = visionMetadata
      classificationSource = 'vision'
    } else {
      const heuristicMetadata = classifyWithHeuristics(folder, images)
      classification = cleanMetadata(heuristicMetadata)
      classificationSource = heuristicMetadata.source || 'heuristic'
    }
  }

  const metadata = finalizeMetadata({
    ...classification,
    previewFit: visualMetadata.previewFit,
    previewPosition: visualMetadata.previewPosition,
    description: visualMetadata.description || classification.description,
    designDirection: visualMetadata.designDirection || classification.designDirection,
  }, folder)

  return {
    metadata,
    cacheEntry: {
      title: metadata.title,
      category: metadata.category,
      type: metadata.type,
      style: metadata.style,
      tags: metadata.tags,
      classifiedFrom: galleryPreview.relativeToFolder,
      assetFingerprint: fingerprint,
      classificationVersion: CLASSIFICATION_VERSION,
      generated: !['metadata.json', 'metadata-map'].includes(classificationSource),
      source: classificationSource,
    },
    shouldCache: true,
  }
}

function keywordScore(fileName, hints) {
  const normalized = fileName.toLowerCase().replace(/[_-]+/g, ' ')
  return hints.reduce((score, hint, index) => {
    const normalizedHint = hint.toLowerCase().replace(/[_-]+/g, ' ')
    return normalized.includes(normalizedHint) ? score + (hints.length - index) * 10 : score
  }, 0)
}

function readPngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function readJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null

  let offset = 2
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = buffer[offset + 1]
    const length = buffer.readUInt16BE(offset + 2)
    const isSofMarker = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)

    if (isSofMarker) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }

    offset += 2 + length
  }

  return null
}

function readWebpDimensions(buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return null
  }

  const chunk = buffer.toString('ascii', 12, 16)

  if (chunk === 'VP8X' && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    }
  }

  if (chunk === 'VP8 ' && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    }
  }

  if (chunk === 'VP8L' && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21)
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    }
  }

  return null
}

function readImageDimensions(buffer, extension) {
  if (extension === '.png') return readPngDimensions(buffer)
  if (extension === '.jpg' || extension === '.jpeg') return readJpegDimensions(buffer)
  if (extension === '.webp') return readWebpDimensions(buffer)
  return null
}

async function walkImageFiles(directory, root = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkImageFiles(absolutePath, root))
      continue
    }

    if (!entry.isFile()) continue
    if (IGNORED_FILES.has(entry.name.toLowerCase())) continue

    const extension = path.extname(entry.name).toLowerCase()
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) continue

    const stats = await fs.stat(absolutePath)
    const buffer = await readFileWithRetry(absolutePath)
    const dimensions = readImageDimensions(buffer, extension)
    const relativeToFolder = path.relative(root, absolutePath)

    files.push({
      name: entry.name,
      relativeToFolder,
      absolutePath,
      extension,
      size: stats.size,
      mtimeMs: stats.mtimeMs,
      width: dimensions?.width || null,
      height: dimensions?.height || null,
      aspectRatio: dimensions?.width && dimensions?.height ? dimensions.height / dimensions.width : null,
    })
  }

  return files.sort((a, b) => naturalCompare(a.relativeToFolder, b.relativeToFolder))
}

async function readFileWithRetry(filePath, attempt = 0) {
  try {
    return await fs.readFile(filePath)
  } catch (error) {
    const isTransientLock = ['EBUSY', 'EPERM', 'ENOENT'].includes(error.code)
    if (!isTransientLock || attempt >= 5) throw error
    await wait(100 * (attempt + 1))
    return readFileWithRetry(filePath, attempt + 1)
  }
}

function chooseFullPage(images) {
  if (images.length === 1) return images[0]

  return [...images].sort((a, b) => {
    const aTallScore = (a.aspectRatio || 0) >= 2 ? 1000 + (a.aspectRatio || 0) * 100 : 0
    const bTallScore = (b.aspectRatio || 0) >= 2 ? 1000 + (b.aspectRatio || 0) * 100 : 0
    const aScore = aTallScore + keywordScore(a.name, FULL_PAGE_HINTS) + (a.height || 0) / 1000
    const bScore = bTallScore + keywordScore(b.name, FULL_PAGE_HINTS) + (b.height || 0) / 1000
    return bScore - aScore || naturalCompare(a.relativeToFolder, b.relativeToFolder)
  })[0]
}

function chooseGalleryPreview(images, fullPage) {
  if (images.length === 1) return images[0]

  const candidates = images.filter((image) => image.relativeToFolder !== fullPage.relativeToFolder)
  const pool = candidates.length ? candidates : images

  return [...pool].sort((a, b) => {
    const aShapeScore = (a.aspectRatio || 99) <= 1.35 ? 80 : 0
    const bShapeScore = (b.aspectRatio || 99) <= 1.35 ? 80 : 0
    const aScore = keywordScore(a.name, PREVIEW_HINTS) + aShapeScore - Math.abs((a.aspectRatio || 1) - 0.72) * 10
    const bScore = keywordScore(b.name, PREVIEW_HINTS) + bShapeScore - Math.abs((b.aspectRatio || 1) - 0.72) * 10
    return bScore - aScore || naturalCompare(a.relativeToFolder, b.relativeToFolder)
  })[0]
}

function orderImages(images, fullPage, galleryPreview) {
  const sorted = [...images].sort((a, b) => {
    if (a.relativeToFolder === fullPage.relativeToFolder) return -1
    if (b.relativeToFolder === fullPage.relativeToFolder) return 1
    if (a.relativeToFolder === galleryPreview.relativeToFolder) return -1
    if (b.relativeToFolder === galleryPreview.relativeToFolder) return 1
    return naturalCompare(a.relativeToFolder, b.relativeToFolder)
  })

  return sorted.map((image) => toImageEntry(image))
}

function toImageEntry(image) {
  return {
    src: image.publicUrl,
    label: titleFromFolder(path.basename(image.name, path.extname(image.name))),
    width: image.width,
    height: image.height,
  }
}

async function discoverInspirations(projectRoot = defaultProjectRoot, options = {}) {
  const inspirationsRoot = path.join(projectRoot, 'public', 'inspirations')
  const generatedMetadataCache = await readGeneratedMetadataCache(inspirationsRoot)
  const nextGeneratedMetadataCache = {}
  let metadataCacheChanged = false
  const rootEntries = await fs.readdir(inspirationsRoot, { withFileTypes: true })
  const folders = rootEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(naturalCompare)

  const inspirations = []
  const skipped = []

  for (const folder of folders) {
    const folderPath = path.join(inspirationsRoot, folder)
    const images = await walkImageFiles(folderPath)

    if (!images.length) {
      skipped.push({ folder, reason: 'no supported image files' })
      if (options.logSkipped) {
        console.warn(`[inspirations] Skipped ${folder}: no supported image files.`)
      }
      continue
    }

    for (const image of images) {
      image.publicUrl = toPublicUrl(path.join('inspirations', folder, image.relativeToFolder))
    }

    const fullPage = chooseFullPage(images)
    const galleryPreview = chooseGalleryPreview(images, fullPage)
    const fingerprint = makeAssetFingerprint(folder, images, await metadataFileSignature(folderPath))
    const resolvedMetadata = await resolveMetadata({
      folder,
      folderPath,
      images,
      galleryPreview,
      fingerprint,
      generatedMetadataCache,
    })
    const metadata = resolvedMetadata.metadata

    nextGeneratedMetadataCache[folder] = resolvedMetadata.cacheEntry
    if (JSON.stringify(generatedMetadataCache[folder]) !== JSON.stringify(resolvedMetadata.cacheEntry)) {
      metadataCacheChanged = true
    }

    inspirations.push({
      id: folder,
      folder,
      title: metadata.title,
      category: metadata.category,
      type: metadata.type,
      style: metadata.style,
      tags: metadata.tags,
      description: metadata.description || `Website inspiration assets from the ${folder} folder.`,
      designDirection: metadata.designDirection || 'Use the layout, imagery, spacing, color, and section rhythm shown in this asset set.',
      previewFit: metadata.previewFit || undefined,
      previewPosition: metadata.previewPosition || undefined,
      galleryPreview: galleryPreview.publicUrl,
      fullPage: fullPage.publicUrl,
      images: orderImages(images, fullPage, galleryPreview),
    })
  }

  if (Object.keys(generatedMetadataCache).some((folder) => !nextGeneratedMetadataCache[folder])) {
    metadataCacheChanged = true
  }

  if (metadataCacheChanged) {
    await writeGeneratedMetadataCache(inspirationsRoot, nextGeneratedMetadataCache)
  }

  return {
    root: '/inspirations',
    count: inspirations.length,
    skipped,
    inspirations,
  }
}

async function generateInspirationsManifest(projectRoot = defaultProjectRoot, options = {}) {
  const inspirationsRoot = path.join(projectRoot, 'public', 'inspirations')
  const manifestPath = path.join(inspirationsRoot, 'manifest.json')
  const manifest = await discoverInspirations(projectRoot, options)
  const nextContent = `${JSON.stringify(manifest, null, 2)}\n`

  let currentContent = ''
  try {
    currentContent = await fs.readFile(manifestPath, 'utf8')
  } catch {
    currentContent = ''
  }

  if (currentContent !== nextContent) {
    await fs.writeFile(manifestPath, nextContent)
  }

  return { manifest, manifestPath }
}

export {
  discoverInspirations,
  generateInspirationsManifest,
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : defaultProjectRoot
  const { manifest, manifestPath } = await generateInspirationsManifest(projectRoot, { logSkipped: true })
  console.log(`[inspirations] Generated ${path.relative(projectRoot, manifestPath)} with ${manifest.count} inspirations.`)
}
