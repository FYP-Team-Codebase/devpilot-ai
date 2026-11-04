import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { workflowStepStyles } from './WorkflowStep.styles'

const EASE = [0.16, 1, 0.3, 1]

export default function WorkflowStep({ index, label, heading, description, visual, reverse = false, centered = false }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.35 })
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={workflowStepStyles.step}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE }}
    >
      <div className={workflowStepStyles.markerColumn} aria-hidden="true">
        <motion.span
          className={workflowStepStyles.marker}
          data-active={isInView}
          style={isInView ? { backgroundColor: 'var(--color-dp-black)', borderColor: 'var(--color-dp-black)' } : undefined}
          animate={{ scale: isInView ? 1.12 : 1 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <span
            className={`${workflowStepStyles.markerText} ${isInView ? workflowStepStyles.markerTextActive : ''}`}
          >
            {index}
          </span>
        </motion.span>
      </div>

      <div
        className={`${workflowStepStyles.body} ${reverse ? workflowStepStyles.reversed : ''} ${centered ? workflowStepStyles.centeredBody : ''}`}
      >
        <div
          className={`${workflowStepStyles.copy} ${centered ? workflowStepStyles.centeredCopy : ''}`}
        >
          <span className={workflowStepStyles.label}>{label}</span>
          <h3 className={workflowStepStyles.heading}>{heading}</h3>
          <p className={`${workflowStepStyles.description} ${centered ? workflowStepStyles.centeredDescription : ''}`}>{description}</p>
        </div>

        <div className={`${workflowStepStyles.visual} ${centered ? workflowStepStyles.centeredVisual : ''}`}>
          {typeof visual === 'function' ? visual(isInView) : visual}
        </div>
      </div>
    </motion.div>
  )
}
