const CURRENT_PROJECT_ID_KEY = 'devpilot-current-project-id'
const PROMPT_KEY = 'devpilot-prompt'
const REQUIREMENTS_KEY = 'devpilot-requirements'
const INSPIRATIONS_KEY = 'devpilot-inspirations'

const GENERATION_STATUSES = new Set(['ready', 'generating', 'completed', 'failed'])
const KNOWN_STYLES = ['Modern', 'Minimal', 'Corporate']
const KNOWN_COLORS = ['Blue', 'Violet', 'Emerald', 'Amber', 'Rose', 'Slate', 'Cyan', 'Orange']

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function toList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function getProjectId(project) {
  return typeof project?._id === 'string' && project._id.trim()
    ? project._id.trim()
    : typeof project?.id === 'string' && project.id.trim()
      ? project.id.trim()
      : ''
}

function hasMeaningfulRequirements(project) {
  const requirements = project?.requirements || {}

  return (
    hasText(requirements.projectType) ||
    toList(requirements.pages).length > 0 ||
    toList(requirements.features).length > 0 ||
    toList(requirements.devices).length > 0 ||
    toList(requirements.designPreferences).length > 0
  )
}

function hasInspirations(project) {
  return toList(project?.inspirations).some((item) => hasText(item?.inspirationId))
}

function findKnownValue(rawValue, knownValues) {
  if (!hasText(rawValue)) return ''

  const normalized = rawValue.trim().toLowerCase()
  return knownValues.find((value) => normalized === value.toLowerCase()) || ''
}

function getPreferenceValue(preferences, label) {
  const prefix = `${label}:`
  const entry = toList(preferences).find((item) => (
    typeof item === 'string' && item.trim().toLowerCase().startsWith(prefix.toLowerCase())
  ))

  return entry ? entry.slice(prefix.length).trim() : ''
}

function parseKnownPreference(preferences, label, knownValues) {
  const rawValue = getPreferenceValue(preferences, label)
  if (!rawValue) return ''

  return knownValues.find((value) => {
    const normalizedValue = value.toLowerCase()
    const normalizedRaw = rawValue.toLowerCase()
    return normalizedRaw === normalizedValue || normalizedRaw.startsWith(`${normalizedValue} `)
  }) || ''
}

function buildRequirementsDraft(project) {
  const requirements = project?.requirements || {}
  const notes = hasText(requirements.notes) ? requirements.notes.trim() : ''

  return {
    projectName: hasText(project?.projectName) ? project.projectName.trim() : '',
    industry: findKnownValue(requirements.projectType, [
      'Restaurant',
      'Portfolio',
      'SaaS',
      'Healthcare',
      'Education',
      'Ecommerce',
      'Agency',
      'Real Estate',
    ]),
    targetAudience: '',
    style: parseKnownPreference(requirements.designPreferences, 'Style', KNOWN_STYLES),
    primaryColor: parseKnownPreference(requirements.designPreferences, 'Primary Color', KNOWN_COLORS),
    secondaryColor: parseKnownPreference(requirements.designPreferences, 'Secondary Color', KNOWN_COLORS),
    pages: toList(requirements.pages),
    features: toList(requirements.features),
    devices: toList(requirements.devices),
    assets: [],
    assetsSkipped: false,
    notes,
    noAdditionalNotes: !notes,
  }
}

export function getProjectResumeRoute(project) {
  const status = hasText(project?.generationStatus) ? project.generationStatus.trim().toLowerCase() : 'draft'
  const hasRequirements = hasMeaningfulRequirements(project)

  if (GENERATION_STATUSES.has(status)) {
    return '/generation'
  }

  if (status === 'draft') {
    if (!hasRequirements) return '/requirements'
    return hasInspirations(project) ? '/generation' : '/inspiration'
  }

  return hasRequirements ? '/generation' : '/requirements'
}

export function restoreProjectSession(project) {
  const projectId = getProjectId(project)

  if (!projectId) {
    throw new Error('Project ID is missing.')
  }

  sessionStorage.removeItem(REQUIREMENTS_KEY)
  sessionStorage.removeItem(INSPIRATIONS_KEY)
  sessionStorage.setItem(CURRENT_PROJECT_ID_KEY, projectId)

  if (hasText(project?.prompt)) {
    sessionStorage.setItem(PROMPT_KEY, project.prompt.trim())
  }

  if (hasMeaningfulRequirements(project) || hasText(project?.projectName)) {
    sessionStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(buildRequirementsDraft(project)))
    window.dispatchEvent(new Event('devpilot-requirements-changed'))
  }

  const inspirations = toList(project?.inspirations)
    .filter((item) => hasText(item?.inspirationId))

  if (inspirations.length) {
    sessionStorage.setItem(INSPIRATIONS_KEY, JSON.stringify(inspirations))
  }

  return getProjectResumeRoute(project)
}
