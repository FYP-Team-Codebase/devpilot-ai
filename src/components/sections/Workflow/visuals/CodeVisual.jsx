import { motion, useReducedMotion } from 'motion/react'
import { workflowVisualStyles } from './WorkflowVisual.styles'

const EASE = [0.16, 1, 0.3, 1]

export default function CodeVisual({ isActive }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={workflowVisualStyles.frame}
      initial={shouldReduceMotion ? false : { opacity: 0, x: 24, scale: 0.98 }}
      animate={isActive ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE }}
    >
      <img
        className={`${workflowVisualStyles.image} aspect-[1600/1280]`}
        src="/workflow/optimized/code.jpg"
        alt="DevPilot AI code editor: the generated project's file explorer, source code for Home.jsx, the AI build status checklist, and Download Project, Copy, Preview and Export ZIP actions"
        width={1600}
        height={1280}
        loading="lazy"
      />
    </motion.div>
  )
}
