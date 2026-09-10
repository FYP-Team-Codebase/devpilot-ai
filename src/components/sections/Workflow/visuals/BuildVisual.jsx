import { motion, useReducedMotion } from 'motion/react'
import { workflowVisualStyles } from './WorkflowVisual.styles'

const EASE = [0.16, 1, 0.3, 1]

export default function BuildVisual({ isActive }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={workflowVisualStyles.frame}
      initial={shouldReduceMotion ? false : { opacity: 0, x: 24, scale: 0.98 }}
      animate={isActive ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE }}
    >
      <img
        className={`${workflowVisualStyles.image} aspect-[1920/1474]`}
        src="/workflow/optimized/buildthestack.jpg"
        alt="DevPilot AI building your application: a generation pipeline showing the Frontend AI complete, Backend AI generating application logic, and Database AI queued, with overall progress and a live activity feed"
        width={1920}
        height={1474}
        loading="lazy"
      />
    </motion.div>
  )
}
