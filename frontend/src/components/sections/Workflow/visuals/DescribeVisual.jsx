import { motion, useReducedMotion } from 'motion/react'
import { workflowVisualStyles } from './WorkflowVisual.styles'

const EASE = [0.16, 1, 0.3, 1]

export default function DescribeVisual({ isActive }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={workflowVisualStyles.frame}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={isActive ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: EASE }}
    >
      <img
        className={`${workflowVisualStyles.image} aspect-[1600/1280]`}
        src="/workflow/optimized/describe-step.jpg"
        alt="DevPilot AI new project screen: a “What do you want to build?” prompt field with model and inspiration controls and a Generate button, alongside the project sidebar"
        width={1600}
        height={1280}
        loading="lazy"
      />
    </motion.div>
  )
}
