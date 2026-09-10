import { motion, useReducedMotion } from 'motion/react'
import { workflowVisualStyles } from './WorkflowVisual.styles'

const EASE = [0.16, 1, 0.3, 1]

export default function DefineVisual({ isActive }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={workflowVisualStyles.frame}
      initial={shouldReduceMotion ? false : { opacity: 0, x: -24, scale: 0.98 }}
      animate={isActive ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE }}
    >
      <img
        className={`${workflowVisualStyles.image} aspect-[1920/1536]`}
        src="/workflow/optimized/Shapetheexperience.jpg"
        alt="DevPilot AI define screen: project requirements form with industry, project type, required features and design style, alongside a visual inspiration board with one design selected"
        width={1920}
        height={1536}
        loading="lazy"
      />
    </motion.div>
  )
}
