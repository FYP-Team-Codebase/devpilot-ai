import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import Navbar from '../../components/layout/Navbar'
import FooterSection from '../../components/sections/Footer/FooterSection'
import ScrollHandoff from '../../components/motion/ScrollHandoff'
import useLandingNavigation from '../../hooks/useLandingNavigation'
import { productsPageStyles as styles } from './ProductsPage.styles'

const EASE = [0.16, 1, 0.3, 1]

const PRINCIPLES = [
  {
    title: 'Define the idea',
    text: 'Start with a plain-language prompt and keep the original intent attached to the project.',
  },
  {
    title: 'Structure the requirements',
    text: 'Turn the idea into pages, features, devices, design choices, and notes before generation begins.',
  },
  {
    title: 'Choose the visual direction',
    text: 'Select real inspiration references so the product has a clearer interface direction.',
  },
  {
    title: 'Keep the project persistent',
    text: 'Save project context in MongoDB and return to the same build when you need to continue.',
  },
]

const WORKFLOW = [
  {
    title: 'Start with an idea',
    text: 'Create a persisted project from a prompt and keep the first product thought connected to the build.',
  },
  {
    title: 'Define requirements',
    text: 'Capture the product type, pages, features, devices, design preferences, and notes.',
  },
  {
    title: 'Choose inspiration',
    text: 'Select DevPilot gallery references and save compact inspiration links to the same project.',
  },
  {
    title: 'Prepare the project',
    text: 'Move the build into a generation-ready state without pretending code has been generated yet.',
  },
  {
    title: 'Continue into generation',
    text: 'Open the Generation page with the saved backend project as the source of truth.',
  },
]

const CAPABILITIES = [
  ['Create and authenticate an account', 'Users can sign up, log in, and access the protected DevPilot workspace.'],
  ['Start projects from a prompt', 'Prompt submission creates a real MongoDB project linked to the authenticated user.'],
  ['Configure project requirements', 'Requirements are saved to the same project as structured product context.'],
  ['Select design inspiration', 'Chosen inspirations are persisted as compact references for future generation.'],
  ['Save projects persistently', 'Projects survive page changes and can be retrieved from the dashboard.'],
  ['Resume saved projects', 'Project cards reopen the right stage without creating duplicate projects.'],
  ['Manage projects from the dashboard', 'My Projects and Recent Projects list real backend projects.'],
  ['Prepare a project for generation', 'The workflow marks completed configurations as ready for the next generation stage.'],
]

const AUDIENCES = [
  ['Students', 'Move from project idea to a structured build plan without scattering notes across tools.'],
  ['Solo builders', 'Keep prompts, requirements, and visual references connected while shaping a product.'],
  ['Founders', 'Explore a product direction before investing time in a full build cycle.'],
  ['Small teams', 'Create a shared starting point for what the product should become.'],
  ['Agencies and developers', 'Prototype client ideas with a guided flow that preserves context.'],
]

const ROADMAP = [
  ['In development', 'AI-powered MERN project generation', 'Generate frontend, backend, and database code from the prepared project context.'],
  ['Coming next', 'Live Preview', 'Review generated output in a browser-like preview before export.'],
  ['Coming next', 'Monaco-based code inspection', 'Inspect and edit generated code with a real code editor experience.'],
  ['Planned', 'ZIP export', 'Download the generated project once the generation pipeline is complete.'],
  ['Planned', 'Subscription and payment support', 'Connect product access to real billing when payments are ready.'],
]

function useReveal(amount = 0.22) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount })
  const shouldReduceMotion = useReducedMotion()

  return {
    ref,
    motionProps: {
      initial: shouldReduceMotion ? false : { opacity: 0, y: 18 },
      animate: inView ? { opacity: 1, y: 0 } : undefined,
      transition: { duration: shouldReduceMotion ? 0 : 0.55, ease: EASE },
    },
  }
}

function Reveal({ as: Component = motion.div, children, className = '', amount, delay = 0, reveal = true }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: amount ?? 0.22 })
  const shouldReduceMotion = useReducedMotion()

  if (!reveal) {
    return (
      <Component className={className}>
        {children}
      </Component>
    )
  }

  return (
    <Component
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE, delay: shouldReduceMotion ? 0 : delay }}
    >
      {children}
    </Component>
  )
}

export default function ProductsPage() {
  const workflowRef = useRef(null)
  const { handleStartBuilding } = useLandingNavigation()

  function scrollToWorkflow() {
    workflowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <ProductHero onStartBuilding={handleStartBuilding} onWorkflowClick={scrollToWorkflow} />
        <ScrollHandoff>
          <WhatDevPilotIs />
        </ScrollHandoff>
        <CurrentWorkflow refTarget={workflowRef} />
        <WhatWorksToday />
        <BuiltFor />
        <ComingNext />
        <FinalProductCta onStartBuilding={handleStartBuilding} />
      </main>
      <FooterSection revealContent={false} />
    </div>
  )
}

function ProductHero({ onStartBuilding, onWorkflowClick }) {
  const { ref, motionProps } = useReveal(0.2)

  return (
    <section className={styles.hero} aria-labelledby="products-hero-title">
      <motion.div ref={ref} className={styles.heroGrid} {...motionProps}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Code Nova Products</p>
          <h1 id="products-hero-title" className={styles.heroTitle}>
            Build the idea. Shape the product. Own the code.
          </h1>
          <p className={styles.heroDescription}>
            DevPilot AI turns a software idea into a structured project workflow with prompts, requirements, inspiration, persistent projects, and generation-ready context.
          </p>
          <div className={styles.heroActions}>
            <motion.a
              href="/prompt"
              className={styles.primaryCta}
              onClick={onStartBuilding}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              Try DevPilot AI
            </motion.a>
            <button type="button" className={styles.secondaryCta} onClick={onWorkflowClick}>
              See how it works
            </button>
          </div>
        </div>

        <figure className={styles.heroVisual}>
          <img
            src="/workflow/optimized/describe-step.jpg"
            alt="DevPilot AI prompt screen showing a new project form and project sidebar"
            className={styles.heroImage}
            width="1600"
            height="1280"
          />
          <figcaption className={styles.heroCaption}>
            Code Nova is the company. DevPilot AI is the flagship product for preparing software builds.
          </figcaption>
        </figure>
      </motion.div>
    </section>
  )
}

function WhatDevPilotIs() {
  return (
    <section className={styles.statementSection} aria-labelledby="what-devpilot-is-title">
      <div className={styles.statementGrid}>
        <Reveal>
          <h2 id="what-devpilot-is-title" className={styles.statement}>
            Software ideas get scattered. DevPilot keeps the product decisions together.
          </h2>
        </Reveal>

        <Reveal as={motion.div} delay={0.08}>
          <dl className={styles.principleList}>
            {PRINCIPLES.map((item) => (
              <div key={item.title} className={styles.principleItem}>
                <dt className={styles.principleTitle}>{item.title}</dt>
                <dd className={styles.principleText}>{item.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}

function CurrentWorkflow({ refTarget }) {
  return (
    <section ref={refTarget} id="product-workflow" className={styles.workflowSection} aria-labelledby="current-workflow-title">
      <div className={styles.container}>
        <Reveal as={motion.header} className={styles.sectionHeader}>
          <h2 id="current-workflow-title" className={styles.sectionTitle}>Current workflow</h2>
          <p className={styles.sectionCopy}>
            The verified product flow moves from a prompt into saved configuration before generation starts.
          </p>
        </Reveal>

        <div className={styles.workflowGrid}>
          <Reveal className={styles.workflowList} delay={0.06}>
            {WORKFLOW.map((item, index) => (
              <article key={item.title} className={styles.workflowItem}>
                <span className={styles.workflowIndex}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className={styles.workflowTitle}>{item.title}</h3>
                  <p className={styles.workflowText}>{item.text}</p>
                </div>
              </article>
            ))}
          </Reveal>

          <div className={styles.visualStack}>
            <Reveal delay={0.1}>
              <figure className={styles.imageFrame}>
                <img
                  src="/workflow/optimized/describe-step.jpg"
                  alt="DevPilot AI prompt interface for starting a new project"
                  className={`${styles.productImage} aspect-[1600/1280]`}
                  width="1600"
                  height="1280"
                  loading="lazy"
                />
                <figcaption className={styles.imageCaption}>
                  Prompt-based project creation starts the persistent build record.
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={0.16}>
              <figure className={styles.imageFrame}>
                <img
                  src="/workflow/optimized/Shapetheexperience.jpg"
                  alt="DevPilot AI requirements and inspiration interface for shaping a project"
                  className={`${styles.productImage} aspect-[1600/1280]`}
                  width="1600"
                  height="1280"
                  loading="lazy"
                />
                <figcaption className={styles.imageCaption}>
                  Requirements and design references become structured context for the same project.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhatWorksToday() {
  return (
    <section className={styles.todaySection} aria-labelledby="today-title">
      <div className={styles.todayGrid}>
        <Reveal className={styles.stickyIntro}>
          <p className={styles.sectionLabel}>What you can do today</p>
          <h2 id="today-title" className={styles.sectionTitle}>A working product foundation, not a mock promise.</h2>
          <p className={styles.sectionCopy}>
            DevPilot already supports the setup and persistence layer that future generation will build on.
          </p>
        </Reveal>

        <Reveal className={styles.capabilityGrid} delay={0.08}>
          {CAPABILITIES.map(([title, text]) => (
            <article key={title} className={styles.capability}>
              <h3 className={styles.capabilityTitle}>{title}</h3>
              <p className={styles.capabilityText}>{text}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function BuiltFor() {
  return (
    <section className={styles.audienceSection} aria-labelledby="built-for-title">
      <div className={styles.container}>
        <Reveal as={motion.header} className={styles.sectionHeader}>
          <h2 id="built-for-title" className={styles.sectionTitle}>Built for people shaping early software ideas.</h2>
          <p className={styles.sectionCopy}>
            DevPilot is most useful when the idea is real, but the product shape still needs structure.
          </p>
        </Reveal>

        <div className={styles.audienceList}>
          {AUDIENCES.map(([name, text], index) => (
            <Reveal key={name} as={motion.article} className={styles.audienceRow} delay={index * 0.035}>
              <h3 className={styles.audienceName}>{name}</h3>
              <p className={styles.audienceText}>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComingNext() {
  return (
    <section className={styles.nextSection} aria-labelledby="coming-next-title">
      <div className={styles.nextGrid}>
        <Reveal reveal={false}>
          <p className={styles.sectionLabel}>Coming next</p>
          <h2 id="coming-next-title" className={styles.sectionTitle}>Where DevPilot is heading.</h2>
          <p className={styles.sectionCopy}>
            These are product directions in development or planned. They are not presented as available today.
          </p>
        </Reveal>

        <Reveal className={styles.roadmapList} delay={0.08} reveal={false}>
          {ROADMAP.map(([meta, title, text]) => (
            <article key={title} className={styles.roadmapItem}>
              <p className={styles.roadmapMeta}>{meta}</p>
              <h3 className={styles.roadmapTitle}>{title}</h3>
              <p className={styles.roadmapText}>{text}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function FinalProductCta({ onStartBuilding }) {
  return (
    <section className={styles.finalCta} aria-labelledby="products-final-title">
      <Reveal className={styles.finalInner} reveal={false}>
        <div>
          <h2 id="products-final-title" className={styles.finalTitle}>
            Your project already starts with an idea. DevPilot gives it structure.
          </h2>
          <p className={styles.finalCopy}>
            Start with the workflow that exists today, and carry that context into generation as the engine comes online.
          </p>
        </div>
        <div className={styles.finalActions}>
          <motion.a
            href="/prompt"
            className={styles.finalPrimary}
            onClick={onStartBuilding}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            Try DevPilot AI
          </motion.a>
          <a href="/pricing" className={styles.finalSecondary}>
            Explore Pricing
          </a>
        </div>
      </Reveal>
    </section>
  )
}
