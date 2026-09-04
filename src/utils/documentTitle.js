const COMPANY_TITLE = 'Code Nova'
const APP_TITLE = 'DevPilot AI'

const DEV_APP_ROUTE_TITLES = {
  '/login': 'Login',
  '/signup': 'Sign Up',
  '/verify-email': 'Verify Email',
  '/prompt': 'Prompt Builder',
  '/requirements': 'Requirements',
  '/inspiration': 'Inspiration',
  '/dashboard': 'Dashboard',
  '/dashboard/projects': 'My Projects',
  '/dashboard/assets': 'My Assets',
  '/dashboard/inspiration': 'Inspiration Gallery',
  '/dashboard/pricing': 'Pricing',
  '/dashboard/settings': 'Settings',
  '/dashboard/profile': 'Profile',
}

const PROJECT_TITLE_ROUTES = new Set([
  '/requirements',
  '/inspiration',
])

const PLACEHOLDER_PROJECT_NAMES = new Set([
  'null',
  'undefined',
  'untitled',
  'untitled project',
  'untitled website',
])

export function formatCompanyTitle(pageName) {
  return pageName ? `${pageName} · ${COMPANY_TITLE}` : COMPANY_TITLE
}

export function formatDevPilotTitle(pageName) {
  return pageName ? `${pageName} · ${APP_TITLE}` : APP_TITLE
}

export function getMeaningfulProjectName(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const projectName = value.trim()

  if (!projectName || PLACEHOLDER_PROJECT_NAMES.has(projectName.toLowerCase())) {
    return ''
  }

  return projectName
}

export function getStoredProjectName() {
  try {
    const storedRequirements = sessionStorage.getItem('devpilot-requirements')
    const requirements = storedRequirements ? JSON.parse(storedRequirements) : null
    return getMeaningfulProjectName(requirements?.projectName)
  } catch {
    return ''
  }
}

export function getDocumentTitle(pathname) {
  if (pathname === '/') {
    return formatCompanyTitle()
  }

  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const routeTitle = DEV_APP_ROUTE_TITLES[normalizedPath]

  if (!routeTitle) {
    return formatCompanyTitle()
  }

  if (PROJECT_TITLE_ROUTES.has(normalizedPath)) {
    const projectName = getStoredProjectName()

    if (projectName) {
      return formatDevPilotTitle(projectName)
    }
  }

  return formatDevPilotTitle(routeTitle)
}
