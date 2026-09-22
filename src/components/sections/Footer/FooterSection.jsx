import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import codenovaLogo from '../../../assets/branding/codenova-logo.svg'
import useLandingNavigation from '../../../hooks/useLandingNavigation'
import { footerStyles } from './FooterSection.styles'

const EASE = [0.16, 1, 0.3, 1]

const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Home', href: '/', route: true },
      { label: 'Products', href: '/products', route: true },
      { label: 'Pricing', href: '/pricing', route: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about', route: true },
      { label: 'Business', href: '/business', route: true },
      { label: 'Contact', href: '/contact', route: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'GitHub', href: 'https://github.com/FYP-Team-Codebase/devpilot-ai', external: true },
    ],
  },
]

function FooterLink({ link }) {
  if (link.route) {
    return (
      <Link className={footerStyles.link} to={link.href}>
        {link.label}
      </Link>
    )
  }

  return (
    <a
      className={footerStyles.link}
      href={link.href}
      {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {link.label}
    </a>
  )
}

export default function FooterSection({ revealContent = true }) {
  const footerRef = useRef(null)
  const isInView = useInView(footerRef, { once: true, amount: 0.18 })
  const shouldReduceMotion = useReducedMotion()
  const { handleHomeClick } = useLandingNavigation()

  const reveal = (delay = 0) => ({
    initial: !revealContent || shouldReduceMotion ? false : { opacity: 0, y: 14 },
    animate: revealContent ? (isInView ? { opacity: 1, y: 0 } : undefined) : undefined,
    transition: { duration: !revealContent || shouldReduceMotion ? 0 : 0.5, ease: EASE, delay: !revealContent || shouldReduceMotion ? 0 : delay },
  })

  return (
    <footer
      id="contact"
      ref={footerRef}
      className={footerStyles.section}
    >
      <div className={footerStyles.container}>
        <div className={footerStyles.mainGrid}>
          <motion.div className={footerStyles.brandBlock} {...reveal()}>
            <a
              href="/"
              className={footerStyles.logoLink}
              aria-label="Go to Code Nova home"
              onClick={handleHomeClick}
            >
              <img className={footerStyles.logo} src={codenovaLogo} alt="Code Nova" width="190" height="36" />
            </a>
            <p className={footerStyles.tagline}>Structure software from a single prompt.</p>
            <p className={footerStyles.description}>
              DevPilot AI helps you structure ideas, requirements, and design direction while AI-assisted MERN generation is in development.
            </p>
          </motion.div>

          <div className={footerStyles.groupGrid}>
            {FOOTER_GROUPS.map((group, index) => (
              <motion.nav key={group.title} aria-label={group.title} {...reveal(0.08 + index * 0.07)}>
                <h2 className={footerStyles.groupTitle}>{group.title}</h2>
                <ul className={footerStyles.groupList}>
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </motion.nav>
            ))}
          </div>
        </div>

        <motion.div
          className={footerStyles.bottom}
          {...reveal(0.4)}
        >
          <p className={footerStyles.copyright}>© 2026 CodeNova. All rights reserved.</p>
          <nav className={footerStyles.legalNav} aria-label="Legal and social links">
            <a className={footerStyles.legalLink} href="https://github.com/FYP-Team-Codebase/devpilot-ai" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </motion.div>
      </div>
    </footer>
  )
}
