export const ASSET_PURPOSES = [
  { value: 'logo', label: 'Logo / Brand Identity' },
  { value: 'background', label: 'Background / Hero Image' },
  { value: 'content-image', label: 'Product / Content Image' },
  { value: 'design-reference', label: 'Design Reference / Inspiration' },
  { value: 'requirements-document', label: 'Requirements Document' },
  { value: 'icon-illustration', label: 'Icon / Illustration' },
  { value: 'portfolio-gallery', label: 'Portfolio / Gallery Item' },
  { value: 'other', label: 'Other' },
]

const placementOptions = {
  logo: [['ai', 'Let AI decide'], ['header', 'Header / Navbar'], ['footer', 'Footer'], ['other', 'Other']],
  background: [['ai', 'Let AI decide'], ['hero', 'Hero section'], ['section', 'Section background'], ['other', 'Other']],
  'content-image': [['ai', 'Let AI decide'], ['product', 'Product section'], ['gallery', 'Gallery / Portfolio'], ['hero', 'Hero section'], ['other', 'Other']],
  'design-reference': [['ai', 'Let AI decide'], ['hero', 'Hero section style'], ['section', 'Specific section'], ['other', 'Other']],
  'requirements-document': [['ai', 'Use throughout requirements']],
  'icon-illustration': [['ai', 'Let AI decide'], ['header', 'Header / Navbar'], ['product', 'Product section'], ['gallery', 'Gallery / Portfolio'], ['other', 'Other']],
  'portfolio-gallery': [['ai', 'Let AI decide'], ['gallery', 'Gallery / Portfolio'], ['section', 'Specific section'], ['other', 'Other']],
  other: [['ai', 'Let AI decide'], ['other', 'Other']],
}

export function getAssetPlacements(purpose) {
  return placementOptions[purpose] || placementOptions.other
}

export function createAssetSelection(asset, config = {}) {
  const id = String(config.assetId || asset?.id || asset?._id || '')
  const isPdf = asset?.mimeType === 'application/pdf'
  return {
    ...asset,
    id,
    purpose: config.purpose || (isPdf ? 'requirements-document' : 'content-image'),
    customPurpose: config.customPurpose || '',
    placement: config.placement || 'ai',
    placementDetails: config.placementDetails || '',
    instructions: config.instructions || '',
  }
}

export function mergeAssetSelections(current, incoming) {
  const merged = [...(Array.isArray(current) ? current : [])]
  const indexes = new Map(merged.map((item, index) => [String(item.id || item.assetId), index]))
  for (const raw of incoming || []) {
    const item = createAssetSelection(raw, raw)
    if (!item.id) continue
    if (indexes.has(item.id)) {
      const index = indexes.get(item.id)
      merged[index] = { ...item, ...merged[index] }
    } else {
      indexes.set(item.id, merged.length)
      merged.push(item)
    }
  }
  return merged
}

export function updateAssetSelection(selections, assetId, changes) {
  return (selections || []).map((item) => String(item.id || item.assetId) === String(assetId)
    ? { ...item, ...changes }
    : item)
}

export function removeAssetSelection(selections, assetId) {
  return (selections || []).filter((item) => String(item.id || item.assetId) !== String(assetId))
}

export function toProjectAssetSelection(asset) {
  return {
    assetId: String(asset.id || asset.assetId || asset._id),
    purpose: asset.purpose,
    customPurpose: asset.customPurpose || '',
    placement: asset.placement || 'ai',
    placementDetails: asset.placementDetails || '',
    instructions: asset.instructions || '',
  }
}

export function getPersistedAssetSelections(assets, assetsSkipped = false) {
  if (assetsSkipped) return []
  return (Array.isArray(assets) ? assets : []).map(toProjectAssetSelection)
}
