import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import useLandingNavigation from '../../../hooks/useLandingNavigation'
import { pricingStyles } from './PricingSection.styles'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'For exploring DevPilot AI and turning your first ideas into structured projects.',
    features: ['Starter project access', 'AI website generation - in development', 'Live preview - coming next', 'Basic code export - planned'],
    action: 'Try for Free',
    href: '/prompt',
    intent: 'start',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/ month',
    description: 'For developers who want more room to shape and continue project context.',
    features: ['Unlimited projects - planned', 'Advanced AI generation - in development', 'Live preview & editing - coming next', 'Full code export - planned', 'Priority generation - planned'],
    action: 'Go Pro',
    href: '/dashboard/pricing',
    intent: 'upgrade',
    featured: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/ month',
    description: 'For teams evaluating a future professional DevPilot AI workflow.',
    features: ['Everything in Pro - planned', 'Team collaboration - planned', 'Shared projects - planned', 'Higher generation limits - planned', 'Team workspace - planned'],
    action: 'Contact Us',
    href: '/contact',
    intent: 'contact',
  },
]

const REVEAL_EASE = [0.16, 1, 0.3, 1]

function PricingCard({ plan, progress, index, shouldReduceMotion, onPlanAction }) {
  const start = 0.2 + index * 0.12
  const end = start + 0.32
  const opacity = useTransform(progress, [start, end], [0, 1])
  const y = useTransform(progress, [start, end], [34, 0])
  const scale = useTransform(progress, [start, end], [0.96, 1])

  return (
    <motion.div
      className={pricingStyles.motionShell}
      style={shouldReduceMotion ? undefined : { opacity, y, scale }}
      transition={{ duration: 0.5, ease: REVEAL_EASE }}
    >
      <article className={`${pricingStyles.card} ${plan.featured ? pricingStyles.featuredCard : ''}`}>
        {plan.featured && (
          <span className={pricingStyles.badge}>
            Most popular
          </span>
        )}

        <div className={pricingStyles.intro}>
          <p className={`${pricingStyles.eyebrow} ${pricingStyles.planName}`}>{plan.name}</p>
          <div className={pricingStyles.priceRow}>
            <span className={pricingStyles.price}>
              {plan.price}
            </span>
            {plan.period && <span className={pricingStyles.period}>{plan.period}</span>}
          </div>
          <p className={pricingStyles.description}>{plan.description}</p>
        </div>

        <ul className={pricingStyles.featureList}>
          {plan.features.map((feature) => (
            <li
              className={pricingStyles.featureItem}
              key={feature}
            >
              {feature}
            </li>
          ))}
        </ul>

        <a
          className={`${pricingStyles.cardCta} ${plan.featured ? pricingStyles.featuredCta : ''}`}
          href={plan.href}
          onClick={(event) => onPlanAction(event, plan)}
        >
          {plan.action}
        </a>
      </article>
    </motion.div>
  )
}

export default function PricingSection({ headingLevel: Heading = 'h2' }) {
  const sectionRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.92', 'start 0.25'] })
  const headerOpacity = useTransform(scrollYProgress, [0, 0.32], [0, 1])
  const headerY = useTransform(scrollYProgress, [0, 0.32], [24, 0])
  const navigate = useNavigate()
  const { handleGoPro, handleStartBuilding } = useLandingNavigation()

  function handlePlanAction(event, plan) {
    if (plan.intent === 'upgrade') {
      handleGoPro(event)
      return
    }

    if (plan.intent === 'contact') {
      event.preventDefault()
      navigate('/contact')
      return
    }

    handleStartBuilding(event)
  }

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className={pricingStyles.section}
      aria-labelledby="pricing-heading"
    >
      <div className={pricingStyles.container}>
        <motion.div
          className={pricingStyles.header}
          style={shouldReduceMotion ? undefined : { opacity: headerOpacity, y: headerY }}
        >
          <p className={`${pricingStyles.eyebrow} ${pricingStyles.headerEyebrow}`}>Pricing</p>
          <Heading
            id="pricing-heading"
            className={pricingStyles.heading}
          >
            Build more. Pay less.
          </Heading>
          <p className={pricingStyles.subheading}>
            Start free, then explore paid tiers as DevPilot's generation and billing capabilities grow.
          </p>
        </motion.div>

        <div className={pricingStyles.grid}>
          {PLANS.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              progress={scrollYProgress}
              index={index}
              shouldReduceMotion={shouldReduceMotion}
              onPlanAction={handlePlanAction}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
