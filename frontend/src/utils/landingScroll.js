export function scrollToLandingSection(sectionId, options = {}) {
  const target = document.getElementById(sectionId)

  if (!target) {
    return false
  }

  target.scrollIntoView({
    behavior: options.behavior || 'smooth',
    block: 'start',
  })

  return true
}

export function getSectionIdFromHash(hash) {
  if (!hash || hash === '#') {
    return ''
  }

  try {
    return decodeURIComponent(hash.replace(/^#/, ''))
  } catch {
    return hash.replace(/^#/, '')
  }
}
