import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import codenovaMark from '../../assets/branding/codenova-mark.svg'
import useLandingNavigation from '../../hooks/useLandingNavigation'
import { useScrollDirection } from './useScrollDirection'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Products', href: '#products' },
  { label: 'Business', href: '#business' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact Us', href: '#contact' },
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
      <div className={styles.staticControls}>
        <div className={styles.staticBar}>
          <Link to="/" className={styles.brand} aria-label="Go to Code Nova home" onClick={handleHomeClick}>
            <img src={codenovaMark} alt="" className={styles.mark} width="34" height="34" />
            <span className={styles.wordmark}>Code Nova</span>
          </Link>

          <div className={styles.actions}>
            <Link to="/login" className={styles.login}>
              Login
            </Link>
            <a href="/prompt" className={styles.cta} onClick={handleStartBuilding}>
              Try DevPilot AI
            </a>
          </div>
        </div>
      </div>

      <header className={styles.header}>
        <nav className={styles.bar} aria-label="Primary">
          <div className={styles.headerSpacer} aria-hidden="true" />

          <div className={`${styles.pill} ${isSolid ? styles.solid : styles.transparent}`}>
            <ul className={styles.links}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={styles.link}
                    onClick={(event) => handleSectionClick(event, link.href.slice(1))}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.headerSpacer} aria-hidden="true" />

          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className={`${styles.menuIcon} ${isMenuOpen ? styles.menuIconOpen : ''}`} aria-hidden="true" />
          </button>

          <div
            id="mobile-menu"
            className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}
            aria-hidden={!isMenuOpen}
            inert={!isMenuOpen}
          >
            <ul className={styles.mobileLinks}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={styles.mobileLink}
                    onClick={(event) => handleMobileSectionClick(event, link.href.slice(1))}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className={styles.mobileActions}>
              <Link to="/login" className={styles.mobileLogin} onClick={closeMenu}>
                Login
              </Link>
              <a href="/prompt" className={styles.mobileCta} onClick={handleMobileStartBuilding}>
                Try DevPilot AI
              </a>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
