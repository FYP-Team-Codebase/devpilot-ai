import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import useLandingNavigation from '../../../hooks/useLandingNavigation'
import PromptBar from './PromptBar'
import styles from './HeroSection.module.css'

const WORKFLOW_STEPS = ['Prompt', 'Generate', 'Preview', 'Own']
const EASE = [0.16, 1, 0.3, 1]

export default function HeroSection() {
  const sectionRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -54])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82], [1, 0.35])
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, -32])
  const { handleStartBuilding } = useLandingNavigation()

  return (
    <section ref={sectionRef} id="about" className={`${styles.hero} landing-scroll-target`} aria-label="Introduction">
      <span id="top" className="landing-anchor" aria-hidden="true" />
      <motion.div className={styles.backdrop} style={shouldReduceMotion ? undefined : { y: backdropY }} aria-hidden="true" />

      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={shouldReduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: EASE }}
        >
          <p className={styles.eyebrow}>Code Nova · DevPilot AI</p>

          <h1 className={styles.headline}>
            <span>Build Software</span>
            <span>From A Single Prompt.</span>
          </h1>

          <p className={styles.description}>
            DevPilot AI turns natural-language ideas into production-ready MERN
            applications — from interface to backend and database.
          </p>

          <PromptBar />

          <div className={styles.actions}>
            <motion.a
              href="/prompt"
              className={styles.primaryCta}
              onClick={handleStartBuilding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              Start Building
            </motion.a>
            <motion.a
              href="/prompt"
              className={styles.secondaryCta}
              onClick={handleStartBuilding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              Try DevPilot
            </motion.a>
          </div>

          <div className={styles.workflow}>
            {WORKFLOW_STEPS.map((step, index) => (
              <span className={styles.workflowGroup} key={step}>
                <span className={styles.workflowStep}>{step}</span>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <span className={styles.workflowArrow} aria-hidden="true">
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
