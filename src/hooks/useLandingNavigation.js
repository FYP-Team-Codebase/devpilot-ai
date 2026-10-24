import { useLocation, useNavigate } from 'react-router-dom'

import { getCurrentUser, getToken } from '../services/authService'
import { scrollToLandingSection } from '../utils/landingScroll'
import { getSafeRedirectPath } from '../utils/routeRedirect'

const LOGIN_ROUTE = '/login'
const PROMPT_ROUTE = '/prompt'
const CHECKOUT_ROUTE = '/checkout'

function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser())
}

export default function useLandingNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  function navigateWithAuth(destination) {
    const safeDestination = getSafeRedirectPath(destination)

    if (isAuthenticated()) {
      navigate(safeDestination, { state: safeDestination === CHECKOUT_ROUTE ? { checkoutFrom: location.pathname } : undefined })
      return
    }

    navigate(LOGIN_ROUTE, {
      state: { from: safeDestination, ...(safeDestination === CHECKOUT_ROUTE ? { checkoutFrom: location.pathname } : {}) },
    })
  }

  function handleStartBuilding(event) {
    event?.preventDefault()
    navigateWithAuth(PROMPT_ROUTE)
  }

  function handleGoPro(event) {
    event?.preventDefault()
    navigateWithAuth(CHECKOUT_ROUTE)
  }

  function handleSectionClick(event, sectionId) {
    event?.preventDefault()

    navigate({
      pathname: '/',
      hash: `#${sectionId}`,
    })

    window.setTimeout(() => {
      scrollToLandingSection(sectionId)
    }, 0)
  }

  function handleHomeClick(event) {
    event?.preventDefault()

    navigate('/', {
      replace: location.pathname === '/',
    })

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }, 0)
  }

  return {
    handleGoPro,
    handleHomeClick,
    handleSectionClick,
    handleStartBuilding,
  }
}
