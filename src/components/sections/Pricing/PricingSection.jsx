import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import useLandingNavigation from '../../../hooks/useLandingNavigation'
import { pricingStyles } from './PricingSection.styles'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'For exploring DevPilot AI and turning your first ideas into working projects.',
    features: ['3 projects', 'AI website generation', 'Live preview', 'Basic code export'],
    action: 'Try for Free',
    href: '/prompt',
    intent: 'start',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/ month',
    description: 'For developers who want to build, iterate, and ship faster.',
    features: ['Unlimited projects', 'Advanced AI generation', 'Live preview & editing', 'Full code export', 'Priority generation'],
    action: 'Go Pro',
    href: '/dashboard/pricing',
    intent: 'upgrade',
    featured: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/ month',
    description: 'For teams building products together with DevPilot AI.',
    features: ['Everything in Pro', 'Team collaboration', 'Shared projects', 'Higher generation limits', 'Team workspace'],
    action: 'Contact Us',
    href: '#contact',
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

export default function PricingSection() {
  const sectionRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.92', 'start 0.25'] })
  const headerOpacity = useTransform(scrollYProgress, [0, 0.32], [0, 1])
  const headerY = useTransform(scrollYProgress, [0, 0.32], [24, 0])
  const { handleGoPro, handleSectionClick, handleStartBuilding } = useLandingNavigation()

  function handlePlanAction(event, plan) {
    if (plan.intent === 'upgrade') {
      handleGoPro(event)
      return
    }

    if (plan.intent === 'contact') {
      handleSectionClick(event, 'contact')
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
          <h2
            id="pricing-heading"
            className={pricingStyles.heading}
          >
            Build more. Pay less.
          </h2>
          <p className={pricingStyles.subheading}>
            Start free, then upgrade when your projects demand more.
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
