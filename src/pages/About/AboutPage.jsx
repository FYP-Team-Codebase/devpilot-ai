import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import Navbar from '../../components/layout/Navbar'
import FooterSection from '../../components/sections/Footer/FooterSection'
import useLandingNavigation from '../../hooks/useLandingNavigation'
import { aboutPageStyles as styles } from './AboutPage.styles'

const EASE = [0.16, 1, 0.3, 1]

const PROBLEM_FLOW = [
  ['Idea', 'A clear product thought appears.', 'It is simple at first, but it needs structure before it can become software.'],
  ['Prompts', 'The idea becomes language.', 'Helpful fragments can get separated from the decisions that made them useful.'],
  ['Requirements', 'The product shape gets more specific.', 'Pages, features, devices, and notes need to stay attached to the original intent.'],
  ['References', 'The visual direction starts to form.', 'Screenshots and inspiration matter most when they remain connected to the build.'],
  ['Implementation', 'The work moves toward code.', 'Context loss at this point can make the result harder to inspect, change, or own.'],
]

const APPROACH = [
  ['01', 'Understand the idea', 'Start with intent in plain language, then keep that first product thought visible as the work becomes more detailed.'],
  ['02', 'Make requirements explicit', 'Capture pages, features, devices, design preferences, and notes before generation or implementation begins.'],
  ['03', 'Establish visual direction', 'Use real references to guide interface choices instead of leaving visual taste as a disconnected afterthought.'],
  ['04', 'Preserve project context', 'Keep prompts, requirements, and inspiration tied to the same project so the build can be resumed later.'],
  ['05', 'Keep the result ownable', 'The direction is inspectable software, clear project state, and code users can eventually understand and control.'],
]

const CURRENT_CAPABILITIES = [
  'Account authentication',
  'Prompt-based project creation',
  'Requirements configuration',
  'Inspiration selection',
  'MongoDB-backed project persistence',
  'Saved project resume',
  'Dashboard project management',
  'Generation-ready project state',
]

const CREATOR_NAMES = [
  'Ali Hamza',
  'Taha Shahzad',
  'Mubariz Elahi',
  'Haziq Naeem',
  'Abaid Ullah',
  'Nimra Khan',
]

const PRINCIPLES = [
  ['Clarity', 'Software decisions should be understandable before implementation. A project should not become harder to reason about as it moves forward.'],
  ['Context', 'Requirements, references, and product decisions should stay connected instead of living across scattered drafts and tools.'],
  ['Ownership', 'Users should ultimately be able to inspect and own what they create, not just receive an opaque output.'],
  ['Honest Progress', 'Product stages should clearly separate what works today from what is still being built.'],
]

const FUTURE = [
  ['In development', 'AI-powered MERN project generation', 'Generate frontend, backend, and database code from prepared project context.'],
  ['Coming next', 'Live Preview', 'Review generated output in a browser-like preview before export.'],
  ['Coming next', 'Monaco-based code inspection and editing', 'Inspect and edit generated code in a real code editor experience.'],
  ['Planned', 'ZIP export', 'Download the generated project after the generation pipeline is complete.'],
  ['Planned', 'Subscription and payment support', 'Connect product access to real billing when payment infrastructure is ready.'],
]

function Reveal({ children, className = '', delay = 0, amount = 0.24 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount })
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 1, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 1, y: 14 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE, delay: shouldReduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}

export default function AboutPage() {
  const { handleStartBuilding } = useLandingNavigation()

  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <Hero />
        <WhyCodeNovaExists />
        <Problem />
        <Approach />
        <DevPilotProduct onStartBuilding={handleStartBuilding} />
        <Creators />
        <Principles />
        <WhereHeading />
        <FinalCta onStartBuilding={handleStartBuilding} />
      </main>
      <FooterSection revealContent={false} />
    </div>
  )
}

function Hero() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className={styles.hero} aria-labelledby="about-hero-title">
      <motion.div
        className={styles.heroInner}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: EASE }}
      >
        <div>
          <p className={styles.eyebrow}>About Code Nova</p>
          <h1 id="about-hero-title" className={styles.heroTitle}>
            We're building a clearer way to turn software ideas into products.
          </h1>
        </div>

        <aside className={styles.heroAside} aria-label="Code Nova focus">
          <p className={styles.heroCopy}>
            Code Nova builds software tools that bring ideas, requirements, design direction, and implementation closer together.
          </p>
        </aside>
      </motion.div>

      <div className={`${styles.container} ${styles.heroRule}`}>
        <p className={styles.heroRuleText}>Product-led company thinking for the space between an idea and a build.</p>
        <span className={styles.heroMark} aria-hidden="true" />
      </div>
    </section>
  )
}

function WhyCodeNovaExists() {
  return (
    <section className={styles.statementSection} aria-labelledby="why-code-nova-title">
      <div className={styles.statementGrid}>
        <Reveal>
          <h2 id="why-code-nova-title" className={styles.statement}>
            Good software rarely starts with code. It starts with decisions.
          </h2>
        </Reveal>

        <Reveal className={styles.storyCopyWrap} delay={0.08}>
          <p className={styles.storyCopy}>
            Software projects often begin as a simple idea. Then the work spreads into prompts, notes, requirement documents, screenshots, inspiration, tools, and implementation choices.
          </p>
          <p className={styles.storyCopy}>
            Code Nova exists to explore a more connected way through that process, without pretending every part is solved at once.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Problem() {
  return (
    <section className={styles.problemSection} aria-labelledby="problem-title">
      <div className={styles.container}>
        <Reveal className={styles.sectionHeader}>
          <h2 id="problem-title" className={styles.sectionTitle}>The problem is not only building. It is keeping context intact.</h2>
          <p className={styles.sectionCopy}>
            As an idea moves toward implementation, the original intent can become detached from the details that should guide the build.
          </p>
        </Reveal>

        <Reveal className={styles.problemFlow} delay={0.08}>
          {PROBLEM_FLOW.map(([label, text, aside]) => (
            <article key={label} className={styles.problemRow}>
              <p className={styles.problemLabel}>{label}</p>
              <h3 className={styles.problemText}>{text}</h3>
              <p className={styles.problemAside}>{aside}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function Approach() {
  return (
    <section className={styles.approachSection} aria-labelledby="approach-title">
      <div className={styles.narrow}>
        <Reveal className={styles.sectionHeader}>
          <h2 id="approach-title" className={styles.sectionTitle}>How we think software creation should work.</h2>
          <p className={styles.sectionCopy}>
            Before software can be generated or implemented well, the system needs to understand what is being built.
          </p>
        </Reveal>

        <Reveal className={styles.approachList} delay={0.08}>
          {APPROACH.map(([index, title, text]) => (
            <article key={title} className={styles.approachItem}>
              <span className={styles.approachIndex}>{index}</span>
              <h3 className={styles.approachTitle}>{title}</h3>
              <p className={styles.approachText}>{text}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function DevPilotProduct({ onStartBuilding }) {
  return (
    <section className={styles.productSection} aria-labelledby="devpilot-title">
      <div className={styles.productGrid}>
        <Reveal className={styles.productCopy}>
          <p className={styles.eyebrow}>DevPilot AI</p>
          <h2 id="devpilot-title" className={styles.sectionTitle}>That thinking became DevPilot AI.</h2>
          <p className={styles.sectionCopy}>
            DevPilot AI is Code Nova's flagship product for turning an idea into structured project context before generation begins.
          </p>

          <ul className={styles.productList} aria-label="Current verified DevPilot AI capabilities">
            {CURRENT_CAPABILITIES.map((item) => (
              <li key={item} className={styles.productListItem}>{item}</li>
            ))}
          </ul>

          <div className={styles.productActions}>
            <Link to="/products" className={styles.primaryCta}>View DevPilot</Link>
            <motion.a
              href="/prompt"
              className={styles.secondaryCta}
              onClick={onStartBuilding}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              Try DevPilot AI
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className={styles.productVisual}>
            <img
              src="/workflow/optimized/Shapetheexperience.jpg"
              alt="DevPilot AI requirements interface showing project fields and selected visual inspiration"
              className={styles.productImage}
              width="1920"
              height="1536"
              loading="lazy"
            />
            <figcaption className={styles.productCaption}>
              DevPilot keeps requirements and visual direction attached to the same persisted project.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}

function Creators() {
  return (
    <section className={styles.creatorsSection} aria-labelledby="creators-title">
      <div className={styles.creatorsGrid}>
        <Reveal>
          <div>
            <p className={styles.eyebrow}>Creators of DevPilot AI</p>
            <h2 id="creators-title" className={styles.sectionTitle}>The team behind DevPilot AI.</h2>
            <p className={styles.sectionCopy}>
              DevPilot AI is being created by a six-member team focused on bringing ideas, requirements, design direction, and implementation closer together.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className={styles.creatorList}>
            {CREATOR_NAMES.map((name, index) => (
              <li key={name} className={styles.creatorItem}>
                <span className={styles.creatorIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.creatorName}>{name}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

function Principles() {
  return (
    <section className={styles.principlesSection} aria-labelledby="principles-title">
      <div className={styles.container}>
        <Reveal className={styles.sectionHeader}>
          <h2 id="principles-title" className={styles.sectionTitle}>Principles guide the product direction.</h2>
        </Reveal>

        <Reveal className={styles.principlesList} delay={0.08}>
          {PRINCIPLES.map(([word, text]) => (
            <article key={word} className={styles.principleRow}>
              <h3 className={styles.principleWord}>{word}</h3>
              <p className={styles.principleText}>{text}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function WhereHeading() {
  return (
    <section className={styles.futureSection} aria-labelledby="future-title">
      <div className={styles.futureGrid}>
        <div>
          <p className={styles.eyebrow}>Where We're Heading</p>
          <h2 id="future-title" className={styles.sectionTitle}>The current workflow establishes the foundation.</h2>
          <p className={styles.sectionCopy}>
            The next product stages build on saved project context. These capabilities are in development or planned, not presented as available today.
          </p>
        </div>

        <div className={styles.futureList}>
          {FUTURE.map(([meta, title, text]) => (
            <article key={title} className={styles.futureItem}>
              <p className={styles.futureMeta}>{meta}</p>
              <div>
                <h3 className={styles.futureTitle}>{title}</h3>
                <p className={styles.futureText}>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ onStartBuilding }) {
  return (
    <section className={styles.finalCta} aria-labelledby="about-final-title">
      <div className={styles.finalInner}>
        <div>
          <h2 id="about-final-title" className={styles.finalTitle}>See what we're building.</h2>
          <p className={styles.finalCopy}>
            Explore DevPilot AI and follow the product from structured idea to implementation.
          </p>
        </div>
        <div className={styles.finalActions}>
          <Link to="/products" className={styles.finalPrimary}>Explore DevPilot</Link>
          <motion.a
            href="/prompt"
            className={styles.finalSecondary}
            onClick={onStartBuilding}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            Try DevPilot AI
          </motion.a>
        </div>
      </div>
    </section>
  )
}
