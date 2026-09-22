import { useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import WorkflowStep from './WorkflowStep'
import DescribeVisual from './visuals/DescribeVisual'
import DefineVisual from './visuals/DefineVisual'
import BuildVisual from './visuals/BuildVisual'
import PreviewEditVisual from './visuals/PreviewEditVisual'
import CodeVisual from './visuals/CodeVisual'
import { workflowSectionStyles } from './WorkflowSection.styles'

const EASE = [0.16, 1, 0.3, 1]

const STEPS = [
  {
    index: '01',
    label: 'DESCRIBE',
    heading: 'Start with an idea.',
    description:
      'Tell DevPilot what you want to build in plain language. Describe the features, functionality, design, and experience you have in mind.',
    visual: (isActive) => <DescribeVisual isActive={isActive} />,
  },
  {
    index: '02',
    label: 'DEFINE',
    heading: 'Shape the experience.',
    description: 'Refine your idea with inspiration, requirements, and design preferences before development begins.',
    visual: (isActive) => <DefineVisual isActive={isActive} />,
    reverse: true,
  },
  {
    index: '03',
    label: 'BUILD',
    heading: 'Prepare the stack.',
    description:
      'DevPilot is being built toward MERN generation from the saved prompt, requirements, and design direction.',
    visual: (isActive) => <BuildVisual isActive={isActive} />,
  },
  {
    index: '04',
    label: 'PREVIEW & EDIT',
    heading: 'Preview what comes next.',
    description: 'Live preview and editing are planned so generated applications can be reviewed and refined in the product.',
    visual: (isActive) => <PreviewEditVisual isActive={isActive} />,
    reverse: true,
  },
  {
    index: '05',
    label: 'OWN THE CODE',
    heading: 'Own the code.',
    description:
      'Code inspection, editing, and ZIP export are planned for the generation workflow as the engine comes online.',
    visual: (isActive) => <CodeVisual isActive={isActive} />,
  },
]

export default function WorkflowSection() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, amount: 0.6 })
  const shouldReduceMotion = useReducedMotion()

  const stepsRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ['start 0.85', 'end 0.65'] })
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="business"
      className={workflowSectionStyles.section}
      aria-label="How DevPilot works"
    >
      <span id="workflow" className="landing-anchor" aria-hidden="true" />
      <div className={workflowSectionStyles.container}>
        <div
          ref={headerRef}
          className={workflowSectionStyles.header}
        >
          <motion.h2
            className={workflowSectionStyles.heading}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: EASE }}
          >
            <span>Your idea.</span>
            <span>Our workflow.</span>
          </motion.h2>

          <motion.p
            className={workflowSectionStyles.description}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: EASE, delay: shouldReduceMotion ? 0 : 0.12 }}
          >
            From your first prompt to generation-ready project context, DevPilot guides the early
            product planning process.
          </motion.p>
        </div>

        <div
          ref={stepsRef}
          className={workflowSectionStyles.steps}
        >
          <div className={workflowSectionStyles.rail} aria-hidden="true" />
          <motion.div
            className={workflowSectionStyles.progressRail}
            style={{ scaleY: shouldReduceMotion ? 1 : railScale }}
            aria-hidden="true"
          />

          {STEPS.map((step) => (
            <WorkflowStep key={step.index} {...step} />
          ))}
        </div>
      </div>
    </section>
  )
}
