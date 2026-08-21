import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import styles from './WorkflowStep.module.css'

const EASE = [0.16, 1, 0.3, 1]

export default function WorkflowStep({ index, label, heading, description, visual, reverse = false, centered = false }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.35 })
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={`${styles.step} ${centered ? styles.centered : ''} ${reverse ? styles.reverse : ''}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE }}
    >
      <div className={styles.rail} aria-hidden="true">
        <motion.span
          className={styles.dot}
          data-active={isInView}
          animate={{ scale: isInView ? 1.12 : 1 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <span className={styles.dotNumber}>{index}</span>
        </motion.span>
      </div>

      <div className={styles.content}>
        <div className={styles.text}>
          <span className={styles.stepLabel}>{label}</span>
          <h3 className={styles.heading}>{heading}</h3>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.visual}>{typeof visual === 'function' ? visual(isInView) : visual}</div>
      </div>
    </motion.div>
  )
}
