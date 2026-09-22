import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import codenovaMark from '../../assets/branding/codenova-mark.svg'
import useLandingNavigation from '../../hooks/useLandingNavigation'
import { navbarStyles } from './Navbar.styles'
import { useScrollDirection } from './useScrollDirection'

const NAV_LINKS = [
  { label: 'About', href: '/about', route: true },
  { label: 'Products', href: '/products', route: true },
  { label: 'Business', href: '/business', route: true },
  { label: 'Pricing', href: '/pricing', route: true },
  { label: 'Contact Us', href: '/contact', route: true },
]

export default function Navbar() {
  const isSolid = useScrollDirection()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { handleHomeClick, handleSectionClick, handleStartBuilding } = useLandingNavigation()

  useEffect(() => {
    if (!isMenuOpen) return

    function onKeyDown(event) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  function handleMobileSectionClick(event, sectionId) {
    closeMenu()
    handleSectionClick(event, sectionId)
  }

  function handleMobileStartBuilding(event) {
    closeMenu()
    handleStartBuilding(event)
  }

  return (
    <>
      <div className={navbarStyles.logoBarShell}>
        <div className={navbarStyles.logoBarInner}>
          <Link
            to="/"
            className={`${navbarStyles.logoLink} ${navbarStyles.focusDark}`}
            aria-label="Go to Code Nova home"
            onClick={handleHomeClick}
          >
            <img src={codenovaMark} alt="" className="block" width="34" height="34" />
            <span className={navbarStyles.logoText}>
              Code Nova
            </span>
          </Link>

          <div className={navbarStyles.actionGroup}>
            <Link to="/login" className={`${navbarStyles.login} ${navbarStyles.focusDark}`}>
              Login
            </Link>
            <a href="/prompt" className={`${navbarStyles.cta} ${navbarStyles.focusDark}`} onClick={handleStartBuilding}>
              Try DevPilot AI
            </a>
          </div>
        </div>
      </div>

      <header className={navbarStyles.header}>
        <nav
          className={navbarStyles.nav}
          aria-label="Primary"
        >
          <div aria-hidden="true" />

          <div className={`${navbarStyles.pillBase} ${isSolid ? navbarStyles.pillSolid : navbarStyles.pillTransparent}`}>
            <ul className={navbarStyles.desktopList}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.route ? (
                    <Link
                      to={link.href}
                      className={`${navbarStyles.desktopLink} ${navbarStyles.focusDark}`}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`${navbarStyles.desktopLink} ${navbarStyles.focusDark}`}
                      onClick={(event) => handleSectionClick(event, link.href.slice(1))}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden="true" />

          <button
            type="button"
            className={`${navbarStyles.mobileToggle} ${navbarStyles.focusDark}`}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className={`${navbarStyles.menuIcon} ${isMenuOpen ? navbarStyles.menuIconOpen : ''}`} aria-hidden="true" />
          </button>

          <div
            id="mobile-menu"
            className={`${navbarStyles.mobileMenu} ${isMenuOpen ? navbarStyles.mobileMenuOpen : ''}`}
            aria-hidden={!isMenuOpen}
            inert={!isMenuOpen}
          >
            <ul className={navbarStyles.mobileList}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.route ? (
                    <Link
                      to={link.href}
                      className={navbarStyles.mobileLink}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={navbarStyles.mobileLink}
                      onClick={(event) => handleMobileSectionClick(event, link.href.slice(1))}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <div className={navbarStyles.mobileActions}>
              <Link to="/login" className={`${navbarStyles.mobileLogin} ${navbarStyles.focusDark}`} onClick={closeMenu}>
                Login
              </Link>
              <a href="/prompt" className={`${navbarStyles.mobileCta} ${navbarStyles.focusDark}`} onClick={handleMobileStartBuilding}>
                Try DevPilot AI
              </a>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
