import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import styles from './FinalCtaSection.module.css'

const EASE = [0.16, 1, 0.3, 1]

export default function FinalCtaSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.35 })
  const shouldReduceMotion = useReducedMotion()

  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 18 },
    animate: isInView ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: shouldReduceMotion ? 0 : 0.6, ease: EASE, delay: shouldReduceMotion ? 0 : delay },
  })

  return (
    <section ref={sectionRef} className={styles.cta} aria-labelledby="final-cta-heading">
      <div className={styles.container}>
        <motion.div className={styles.promptMotif} aria-hidden="true" {...reveal(0.04)}>
          <span className={styles.promptMark}>&gt;</span>
          <span>describe your idea</span>
          <span className={styles.cursor} />
        </motion.div>

        <motion.h2 id="final-cta-heading" className={styles.heading} {...reveal(0.1)}>
          <span>Your next project</span>
          <span>starts with a prompt.</span>
        </motion.h2>

        <motion.p className={styles.description} {...reveal(0.18)}>
          Describe what you want to build. DevPilot AI turns your idea into a working web application.
        </motion.p>

        <motion.div className={styles.actions} {...reveal(0.26)}>
          <a className={styles.primaryCta} href="#try">
            Start Building
            <span aria-hidden="true">→</span>
          </a>
          <a className={styles.secondaryCta} href="#top">
            Explore DevPilot AI
          </a>
        </motion.div>

        <motion.div
          className={`${styles.promptPreview} ${isInView && !shouldReduceMotion ? styles.promptPreviewReady : ''}`}
          aria-hidden="true"
          {...reveal(0.34)}
        >
          <div className={styles.previewHeader}>
            <span className={styles.previewLabel}>&gt; prompt</span>
            <span className={styles.previewStatus}>
              <span className={styles.statusDot} />
              Generating
            </span>
          </div>
          <p className={styles.previewText}>
            Build a modern ecommerce website with a clean editorial interface<span className={styles.previewCursor} />
          </p>
          <div className={styles.previewFooter}>
            <span>Natural language</span>
            <span aria-hidden="true">→</span>
            <span>Working software</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
