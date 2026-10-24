import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { promptComposerStyles } from './PromptComposer.styles'
import { getCurrentPlanId } from '../../../utils/subscription'

const STATS = ['0 Projects', '0 AI Generations']

export default function PromptComposer({ user }) {
  const shouldReduceMotion = useReducedMotion()
  const stats = [`${getCurrentPlanId(user).charAt(0).toUpperCase()}${getCurrentPlanId(user).slice(1)} Plan`, ...STATS]

  return (
    <motion.section
      className={promptComposerStyles.section}
      aria-labelledby="welcome-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 id="welcome-heading" className={promptComposerStyles.heading}>
        Welcome back
      </h2>
      <p className={promptComposerStyles.copy}>Ready to build your next AI-powered website?</p>

      <div className={promptComposerStyles.actions}>
        <Link
          to="/prompt"
          className={promptComposerStyles.primaryButton}
        >
          Generate Website
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={promptComposerStyles.arrowIcon}
            aria-hidden="true"
          >
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </Link>
        <Link
          to="/dashboard/projects"
          className={promptComposerStyles.secondaryButton}
        >
          Continue Project
        </Link>
        <Link
          to="/dashboard/inspiration"
          className={promptComposerStyles.secondaryButton}
        >
          Inspiration Gallery
        </Link>
      </div>

      <div className={promptComposerStyles.stats}>
        {stats.map((stat) => (
          <span key={stat} className={promptComposerStyles.stat}>
            {stat}
          </span>
        ))}
      </div>
    </motion.section>
  )
}
