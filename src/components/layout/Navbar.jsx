import { useEffect, useState } from 'react'
import codenovaMark from '../../assets/branding/codenova-mark.svg'
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

  return (
    <header className={styles.header}>
      <nav className={styles.bar} aria-label="Primary">
        <a href="#top" className={styles.brand} aria-label="Code Nova home">
          <img src={codenovaMark} alt="" className={styles.mark} width="34" height="34" />
          <span className={styles.wordmark}>Code Nova</span>
        </a>

        <div className={`${styles.pill} ${isSolid ? styles.solid : styles.transparent}`}>
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <a href="#login" className={styles.login}>
            Login
          </a>
          <a href="#try" className={styles.cta}>
            Try DevPilot AI
          </a>
        </div>

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
                <a href={link.href} className={styles.mobileLink} onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <a href="#login" className={styles.mobileLogin} onClick={closeMenu}>
              Login
            </a>
            <a href="#try" className={styles.mobileCta} onClick={closeMenu}>
              Try DevPilot AI
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}
