import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import codenovaLogo from '../../../assets/branding/codenova-logo.svg'
import styles from './FooterSection.module.css'

const EASE = [0.16, 1, 0.3, 1]

const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'DevPilot AI', href: '#top' },
      { label: 'Features', href: '#features' },
      { label: 'Workflow', href: '#workflow' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Business', href: '#business' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#documentation' },
      { label: 'GitHub', href: 'https://github.com/FYP-Team-Codebase/devpilot-ai', external: true },
      { label: 'Help Center', href: '#help' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
    ],
  },
]

function FooterLink({ link }) {
  return (
    <a className={styles.link} href={link.href} {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {link.label}
    </a>
  )
}

export default function FooterSection() {
  const footerRef = useRef(null)
  const isInView = useInView(footerRef, { once: true, amount: 0.18 })
  const shouldReduceMotion = useReducedMotion()

  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 14 },
    animate: isInView ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: EASE, delay: shouldReduceMotion ? 0 : delay },
  })

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <motion.div className={styles.brand} {...reveal()}>
            <a href="#top" className={styles.logoLink} aria-label="Code Nova home">
              <img className={styles.logo} src={codenovaLogo} alt="Code Nova" width="190" height="36" />
            </a>
            <p className={styles.tagline}>Build software from a single prompt.</p>
            <p className={styles.description}>
              DevPilot AI helps you turn ideas into production-ready web experiences with AI-powered generation, editing, and code.
            </p>
          </motion.div>

          <div className={styles.navigation}>
            {FOOTER_GROUPS.map((group, index) => (
              <motion.nav key={group.title} className={styles.group} aria-label={group.title} {...reveal(0.08 + index * 0.07)}>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                <ul className={styles.links}>
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

        <motion.div className={styles.bottom} {...reveal(0.4)}>
          <p className={styles.copyright}>© 2026 CodeNova. All rights reserved.</p>
          <nav className={styles.bottomLinks} aria-label="Legal and social links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="https://github.com/FYP-Team-Codebase/devpilot-ai" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </motion.div>
      </div>
    </footer>
  )
}
