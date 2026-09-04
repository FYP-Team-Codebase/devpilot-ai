import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'

const STATS = ['Free Plan', '0 Projects', '0 AI Generations']

export default function PromptComposer() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      className="mb-5 rounded-xl border border-dp-border bg-white px-6 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] max-sm:px-4"
      aria-labelledby="welcome-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 id="welcome-heading" className="m-0 text-[22px] font-bold leading-tight tracking-[-0.025em] text-dp-black">
        Welcome back
      </h2>
      <p className="mt-1.5 text-[14px] leading-6 text-dp-text">Ready to build your next AI-powered website?</p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Link
          to="/prompt"
          className="group inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Generate Website
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </Link>
        <Link
          to="/dashboard/projects"
          className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Continue Project
        </Link>
        <Link
          to="/dashboard/inspiration"
          className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Inspiration Gallery
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {STATS.map((stat) => (
          <span key={stat} className="inline-flex h-8 items-center rounded-lg border border-dp-border bg-[#FAFAF8] px-3 text-[12px] font-semibold text-dp-black">
            {stat}
          </span>
        ))}
      </div>
    </motion.section>
  )
}
