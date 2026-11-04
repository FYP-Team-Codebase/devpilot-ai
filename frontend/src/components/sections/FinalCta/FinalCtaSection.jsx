import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import useLandingNavigation from '../../../hooks/useLandingNavigation'
import styles from './FinalCtaSection.module.css'
import { finalCtaStyles } from './FinalCtaSection.styles'

const EASE = [0.16, 1, 0.3, 1]

export default function FinalCtaSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.35 })
  const shouldReduceMotion = useReducedMotion()
  const { handleStartBuilding } = useLandingNavigation()
  const shouldAnimatePreview = isInView && !shouldReduceMotion

  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 18 },
    animate: isInView ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: shouldReduceMotion ? 0 : 0.6, ease: EASE, delay: shouldReduceMotion ? 0 : delay },
  })

  return (
    <section id="try" ref={sectionRef} className={finalCtaStyles.section} aria-labelledby="final-cta-heading">
      <div className={finalCtaStyles.content}>
        <motion.div
          className={finalCtaStyles.promptChip}
          aria-hidden="true"
          {...reveal(0.04)}
        >
          <span className={finalCtaStyles.promptChevron}>&gt;</span>
          <span>describe your idea</span>
          <span className={`${finalCtaStyles.chipCursor} ${styles.blink}`} />
        </motion.div>

        <motion.h2
          id="final-cta-heading"
          className={finalCtaStyles.heading}
          {...reveal(0.1)}
        >
          <span>Your next project</span>
          <span>starts with a prompt.</span>
        </motion.h2>

        <motion.p
          className={finalCtaStyles.description}
          {...reveal(0.18)}
        >
          Describe what you want to build. DevPilot AI turns your idea into structured project context for the build process.
        </motion.p>

        <motion.div
          className={finalCtaStyles.actions}
          {...reveal(0.26)}
        >
          <a className={finalCtaStyles.primaryCta} href="/prompt" onClick={handleStartBuilding}>
            Start Building
            <span
              className={finalCtaStyles.ctaArrow}
              aria-hidden="true"
            >
              &rarr;
            </span>
          </a>
          <Link className={finalCtaStyles.secondaryCta} to="/products">
            Explore DevPilot AI
          </Link>
        </motion.div>

        <motion.div
          className={finalCtaStyles.preview}
          aria-hidden="true"
          {...reveal(0.34)}
        >
          <div className={finalCtaStyles.previewHeader}>
            <span className={finalCtaStyles.previewPrompt}>&gt; prompt</span>
            <span
              className={`${finalCtaStyles.previewStatus} ${
                shouldAnimatePreview ? styles.previewStatusReveal : ''
              }`}
            >
              <span className={finalCtaStyles.previewStatusDot} />
              Preparing
            </span>
          </div>
          <p
            className={`${finalCtaStyles.previewText} ${
              shouldAnimatePreview ? styles.previewTextReveal : ''
            }`}
          >
            Build a modern ecommerce website with a clean editorial interface
            <span
              className={`${finalCtaStyles.previewCursor} ${
                shouldAnimatePreview ? styles.previewCursorReady : ''
              }`}
            />
          </p>
          <div className={finalCtaStyles.previewFooter}>
            <span>Natural language</span>
            <span aria-hidden="true">&rarr;</span>
            <span>Generation-ready context</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
