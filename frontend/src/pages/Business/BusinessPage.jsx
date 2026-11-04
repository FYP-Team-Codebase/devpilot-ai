import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import Navbar from '../../components/layout/Navbar'
import FooterSection from '../../components/sections/Footer/FooterSection'
import useLandingNavigation from '../../hooks/useLandingNavigation'
import { businessPageStyles as styles } from './BusinessPage.styles'

const EASE = [0.16, 1, 0.3, 1]

const PROBLEM_POINTS = [
  ['Briefs', 'The original product intent is written down, then separated from later technical choices.'],
  ['Chat threads', 'Decisions move quickly, but the useful context can become hard to recover.'],
  ['Requirement documents', 'Pages, features, devices, and notes need to remain connected to the actual build path.'],
  ['Screenshots and references', 'Visual direction helps most when it stays attached to the project.'],
  ['Developer handoff', 'Implementation starts cleaner when the idea, requirements, and references are already organized.'],
]

const WORKFLOW_STEPS = [
  ['01', 'Capture the idea', 'Start with a plain-language prompt that creates the project context.'],
  ['02', 'Define requirements', 'Configure pages, features, devices, design preferences, and product notes.'],
  ['03', 'Establish design direction', 'Select real inspiration references to clarify the intended interface direction.'],
  ['04', 'Persist project context', 'Save the project to the authenticated account with backend persistence.'],
  ['05', 'Resume and continue the project', 'Return from the dashboard and reopen the appropriate project stage.'],
  ['06', 'Prepare it for generation', 'Move completed project configuration into a generation-ready state.'],
]

const USE_CASES = [
  ['Founders', 'Turn an early product idea into a structured project before implementation begins.'],
  ['Agencies', 'Organize client requirements, references, and project direction in one guided flow.'],
  ['Developers', 'Move from loose requirements toward a clearer implementation context.'],
  ['Product teams', 'Capture product intent, screens, features, and design direction before build execution.'],
  ['Small teams', 'Keep project decisions more organized and resumable across planning sessions.'],
]

const CURRENT_CAPABILITIES = [
  ['Create authenticated projects', 'Projects are tied to a logged-in user and protected application flow.'],
  ['Start from a prompt', 'A plain-language idea becomes the starting point for a persisted project.'],
  ['Configure requirements', 'Capture product type, pages, features, devices, visual preferences, and notes.'],
  ['Select design inspirations', 'Choose inspiration references and keep them attached to the same project.'],
  ['Save projects persistently', 'Project context is stored so it can survive navigation and later sessions.'],
  ['Resume saved projects', 'Saved project cards reopen the current stage instead of starting over.'],
  ['Manage projects from dashboard', 'The dashboard provides access to recent and saved project records.'],
  ['Move projects into generation-ready state', 'Completed planning context can advance toward the generation stage.'],
]

const PLANNED_CAPABILITIES = [
  ['Planned', 'Shared projects', 'A team direction for letting project context be shared when the collaboration layer exists.'],
  ['Planned', 'Team workspaces', 'A professional workspace model for grouping future team project activity.'],
  ['Planned', 'Team billing', 'Billing infrastructure for the team offering when payments are connected.'],
  ['Planned', 'Higher generation limits', 'Expanded usage for professional workflows after generation limits are defined.'],
  ['In development', 'Priority generation', 'A planned way to support heavier professional usage as generation matures.'],
]

function softMotion(shouldReduceMotion, delay = 0) {
  return {
    initial: shouldReduceMotion ? false : { opacity: 1, y: 12 },
    whileInView: shouldReduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: EASE, delay: shouldReduceMotion ? 0 : delay },
  }
}

export default function BusinessPage() {
  const shouldReduceMotion = useReducedMotion()
  const { handleStartBuilding } = useLandingNavigation()

  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <BusinessHero
          shouldReduceMotion={shouldReduceMotion}
          onStartBuilding={handleStartBuilding}
        />
        <FragmentedProblem shouldReduceMotion={shouldReduceMotion} />
        <ProfessionalWorkflow shouldReduceMotion={shouldReduceMotion} />
        <UseCases shouldReduceMotion={shouldReduceMotion} />
        <WhatWorksToday />
        <PlannedDirection />
        <TeamPlan />
        <FinalCta onStartBuilding={handleStartBuilding} />
      </main>
      <FooterSection revealContent={false} />
    </div>
  )
}

function BusinessHero({ shouldReduceMotion, onStartBuilding }) {
  return (
    <section className={styles.hero} aria-labelledby="business-hero-title">
      <motion.div
        className={styles.heroGrid}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: EASE }}
      >
        <div>
          <p className={styles.eyebrow}>CODE NOVA FOR BUSINESS</p>
          <h1 id="business-hero-title" className={styles.heroTitle}>
            Turn early software ideas into structured build context.
          </h1>
          <p className={styles.heroDescription}>
            Teams often begin with scattered briefs, notes, references, requirements, and implementation decisions. DevPilot brings that early context into one structured project workflow before the build begins.
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
            <Link to="/contact" className={styles.secondaryCta}>
              Talk to us
            </Link>
          </div>
        </div>

        <figure className={styles.heroVisual}>
          <img
            src="/workflow/optimized/describe-step.jpg"
            alt="DevPilot AI prompt screen for starting a new project"
            className={styles.heroImage}
            width="1600"
            height="1280"
          />
          <figcaption className={styles.heroCaption}>
            Prompt-based project creation gives professional planning a durable starting point.
          </figcaption>
        </figure>
      </motion.div>

      <div className={`${styles.container} ${styles.heroMeta}`}>
        <p className={styles.heroMetaText}>For founders, agencies, developers, product teams, small teams, and organizations exploring software ideas.</p>
        <span className={styles.heroRule} aria-hidden="true" />
      </div>
    </section>
  )
}

function FragmentedProblem({ shouldReduceMotion }) {
  return (
    <section className={styles.problemSection} aria-labelledby="fragmented-problem-title">
      <div className={styles.problemGrid}>
        <motion.div {...softMotion(shouldReduceMotion)}>
          <p className={styles.sectionLabel}>The fragmented planning problem</p>
          <h2 id="fragmented-problem-title" className={styles.problemStatement}>
            Teams rarely lack ideas. They lose context between them.
          </h2>
          <p className={styles.sectionCopy}>
            A software idea often spreads across many places. The issue is not lack of information. The issue is disconnected context.
          </p>
        </motion.div>

        <div className={styles.problemRows}>
          {PROBLEM_POINTS.map(([term, detail], index) => (
            <motion.article key={term} className={styles.problemRow} {...softMotion(shouldReduceMotion, index * 0.035)}>
              <p className={styles.problemTerm}>{term}</p>
              <p className={styles.problemDetail}>{detail}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProfessionalWorkflow({ shouldReduceMotion }) {
  return (
    <section className={styles.workflowSection} aria-labelledby="professional-workflow-title">
      <div className={styles.container}>
        <motion.header className={styles.sectionHeader} {...softMotion(shouldReduceMotion)}>
          <p className={styles.sectionLabel}>How DevPilot fits professional workflows</p>
          <h2 id="professional-workflow-title" className={styles.sectionTitle}>
            A current workflow for shaping the project before generation.
          </h2>
          <p className={styles.sectionCopy}>
            DevPilot supports the planning and persistence layer that turns loose inputs into a saved project record.
          </p>
        </motion.header>

        <div className={styles.workflowGrid}>
          <div className={styles.workflowList}>
            {WORKFLOW_STEPS.map(([index, title, text], stepIndex) => (
              <motion.article key={title} className={styles.workflowItem} {...softMotion(shouldReduceMotion, stepIndex * 0.025)}>
                <span className={styles.workflowIndex}>{index}</span>
                <div>
                  <h3 className={styles.workflowTitle}>{title}</h3>
                  <p className={styles.workflowText}>{text}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <div className={styles.visualStack}>
            <motion.figure className={styles.imageFrame} {...softMotion(shouldReduceMotion, 0.08)}>
              <img
                src="/workflow/optimized/describe-step.jpg"
                alt="DevPilot AI prompt interface with a project prompt form"
                className={styles.productImage}
                width="1600"
                height="1280"
                loading="lazy"
              />
              <figcaption className={styles.imageCaption}>
                Capture the product idea as the first piece of saved project context.
              </figcaption>
            </motion.figure>

            <motion.figure className={styles.imageFrame} {...softMotion(shouldReduceMotion, 0.12)}>
              <img
                src="/workflow/optimized/Shapetheexperience.jpg"
                alt="DevPilot AI requirements and inspiration interface for shaping a project"
                className={styles.productImage}
                width="1600"
                height="1280"
                loading="lazy"
              />
              <figcaption className={styles.imageCaption}>
                Requirements and inspiration selections keep project direction connected.
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </div>
    </section>
  )
}

function UseCases({ shouldReduceMotion }) {
  return (
    <section className={styles.useCasesSection} aria-labelledby="use-cases-title">
      <div className={styles.narrow}>
        <motion.header className={styles.sectionHeader} {...softMotion(shouldReduceMotion)}>
          <p className={styles.sectionLabel}>Use cases</p>
          <h2 id="use-cases-title" className={styles.sectionTitle}>
            Practical planning paths for early software work.
          </h2>
        </motion.header>

        <div className={styles.useCaseList}>
          {USE_CASES.map(([name, text], index) => (
            <motion.article key={name} className={styles.useCaseRow} {...softMotion(shouldReduceMotion, index * 0.025)}>
              <p className={styles.useCaseName}>{name}</p>
              <h3 className={styles.useCaseText}>{text}</h3>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhatWorksToday() {
  return (
    <section className={styles.todaySection} aria-labelledby="today-title">
      <div className={styles.todayGrid}>
        <div>
          <p className={styles.sectionLabel}>WHAT WORKS TODAY</p>
          <h2 id="today-title" className={styles.sectionTitle}>
            Operational capabilities available in the current product.
          </h2>
          <p className={styles.sectionCopy}>
            This is the verified DevPilot workflow today: authenticated planning, saved project context, and a project path that can continue toward generation.
          </p>
        </div>

        <div className={styles.capabilityMatrix}>
          {CURRENT_CAPABILITIES.map(([capability, meaning]) => (
            <article key={capability} className={styles.capabilityRow}>
              <h3 className={styles.capabilityName}>{capability}</h3>
              <p className={styles.capabilityMeaning}>{meaning}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlannedDirection() {
  return (
    <section className={styles.plannedSection} aria-labelledby="planned-title">
      <div className={styles.plannedGrid}>
        <div>
          <p className={styles.sectionLabel}>BUSINESS DIRECTION</p>
          <h2 id="planned-title" className={styles.sectionTitle}>
            Planned for teams, clearly separate from what works today.
          </h2>
          <p className={styles.sectionCopy}>
            These capabilities represent the intended professional direction. They are planned or in development, not current product claims.
          </p>
        </div>

        <div className={styles.plannedList}>
          {PLANNED_CAPABILITIES.map(([status, title, text]) => (
            <article key={title} className={styles.plannedItem}>
              <p className={styles.plannedStatus}>{status}</p>
              <div>
                <h3 className={styles.plannedTitle}>{title}</h3>
                <p className={styles.plannedText}>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function TeamPlan() {
  return (
    <section className={styles.teamSection} aria-labelledby="team-plan-title">
      <div className={styles.teamPanel}>
        <div>
          <p className={styles.teamMeta}>Team plan positioning</p>
          <h2 id="team-plan-title" className={styles.sectionTitle}>
            Built for teams as DevPilot grows.
          </h2>
          <p className={styles.teamCopy}>
            The Team tier represents the planned professional offering for teams that want more structured project planning and future team-oriented usage.
          </p>
          <div className={styles.teamActions}>
            <Link to="/contact" className={styles.primaryCta}>
              Contact Us
            </Link>
            <Link to="/pricing" className={styles.secondaryCta}>
              Explore Pricing
            </Link>
          </div>
        </div>

        <aside className={styles.teamNote} aria-label="Current Team plan note">
          <p className={styles.teamMeta}>TEAM</p>
          <p className={styles.teamPrice}>$49/month</p>
          <p className={styles.teamPriceNote}>Team billing is not yet connected.</p>
        </aside>
      </div>
    </section>
  )
}

function FinalCta({ onStartBuilding }) {
  return (
    <section className={styles.finalCta} aria-labelledby="business-final-title">
      <div className={styles.finalInner}>
        <div>
          <h2 id="business-final-title" className={styles.finalTitle}>
            Bring the idea together before the build begins.
          </h2>
          <p className={styles.finalCopy}>
            Start with DevPilot's current workflow, keep the project context organized, and continue from a clearer foundation.
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
          <Link to="/products" className={styles.finalSecondary}>
            Explore Products
          </Link>
          <Link to="/contact" className={styles.finalLink}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}
