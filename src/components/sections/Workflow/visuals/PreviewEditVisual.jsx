import { motion, useReducedMotion } from 'motion/react'
import styles from './PreviewEditVisual.module.css'

const EASE = [0.16, 1, 0.3, 1]

export default function PreviewEditVisual({ isActive }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={styles.frame}
      initial={shouldReduceMotion ? false : { opacity: 0, x: -24, scale: 0.98 }}
      animate={isActive ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE }}
    >
      <img
        className={styles.image}
        src="/workflow/change-it.png"
        alt="DevPilot AI editing workspace: the generated application's hero section selected in the visual editor, with a properties panel for content, typography, layout and style, alongside a live preview of the generated dashboard"
        width={1600}
        height={1280}
        loading="lazy"
      />
    </motion.div>
  )
}
