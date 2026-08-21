import { motion, useReducedMotion } from 'motion/react'
import PromptBar from './PromptBar'
import styles from './HeroSection.module.css'

const WORKFLOW_STEPS = ['Prompt', 'Generate', 'Preview', 'Own']
const EASE = [0.16, 1, 0.3, 1]

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="top" className={styles.hero} aria-label="Introduction">
      <div className={styles.backdrop} aria-hidden="true" />

      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
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
              href="#try"
              className={styles.primaryCta}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              Start Building
            </motion.a>
            <motion.a
              href="#try"
              className={styles.secondaryCta}
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
