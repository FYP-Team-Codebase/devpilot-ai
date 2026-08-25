import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import styles from './ScrollHandoff.module.css'

/**
 * A lightweight, scroll-scrubbed boundary that gives adjacent sections a shared
 * visual anchor without taking control of the browser's native scroll position.
 */
export default function ScrollHandoff({ children, tone = 'light', className = '' }) {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.3'] })
  const lineScale = useTransform(scrollYProgress, [0, 0.82], [0.06, 1])
  const nodeOpacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className={`${styles.handoff} ${styles[tone]} ${className}`.trim()}>
      <div className={styles.track} aria-hidden="true">
        <motion.span
          className={styles.line}
          style={shouldReduceMotion ? { scaleX: 1 } : { scaleX: lineScale }}
        />
        <motion.span
          className={styles.node}
          style={shouldReduceMotion ? { opacity: 0 } : { opacity: nodeOpacity }}
        />
      </div>
      {children}
    </div>
  )
}
