import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { getRecentProjects } from '../../../services/projectService'
import ProjectCard from './ProjectCard'

const buttonMotion = { duration: 0.2, ease: 'easeOut' }

function normalizeProject(p) {
  return {
    id: p.id || p._id || p.slug || p.name,
    name: p.name || p.title || 'Untitled website',
    description: p.description || p.prompt || '',
    thumbnail: p.thumbnail || p.previewImage || p.previewUrl || p.screenshot || '',
    updatedAt: p.updatedAt || p.lastUpdated || p.createdAt,
    status: p.status || '',
    href: p.href || p.url || p.editUrl || '',
  }
}

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-dp-border bg-white">
      <div className="aspect-[16/10] bg-[linear-gradient(90deg,var(--color-dp-off-white),var(--color-dp-border),var(--color-dp-off-white))] bg-[length:200%_100%] animate-[shimmer_1.3s_ease-in-out_infinite]" />
      <div className="p-3">
        <div className="h-2.5 w-2/3 rounded-[3px] bg-[linear-gradient(90deg,var(--color-dp-off-white),var(--color-dp-border),var(--color-dp-off-white))] bg-[length:200%_100%] animate-[shimmer_1.3s_ease-in-out_infinite]" />
        <div className="mt-2 h-2.5 w-2/5 rounded-[3px] bg-[linear-gradient(90deg,var(--color-dp-off-white),var(--color-dp-border),var(--color-dp-off-white))] bg-[length:200%_100%] animate-[shimmer_1.3s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}

function EmptyState() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] px-6 py-9 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-dp-border bg-white text-dp-black" aria-hidden="true">
        <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M3.5 6.5h5l1.4 2H18.5v6.7a2.3 2.3 0 0 1-2.3 2.3H5.8a2.3 2.3 0 0 1-2.3-2.3V6.5Z" />
          <path d="M3.5 8.5h15" />
        </svg>
      </div>
      <p className="m-0 mt-4 text-[15px] font-semibold tracking-[-0.02em] text-dp-black">No projects yet</p>
      <p className="mt-1.5 text-[13px] leading-6 text-dp-muted">Start your first AI website.</p>
      <motion.a
        href="/prompt"
        className="group mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
        whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.01 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={buttonMotion}
      >
        Generate Website
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5">
          <path d="M2.5 6h7M6.5 2.5l3.5 3.5-3.5 3.5" />
        </svg>
      </motion.a>
    </div>
  )
}

export default function ProjectGrid({ searchQuery = '' }) {
  const [state, setState] = useState({ status: 'loading', projects: [], isConfigured: true })
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    let active = true
    getRecentProjects()
      .then((result) => {
        if (!active) return
        const projects = (result.projects || []).map(normalizeProject).filter((p) => p.id)
        setState({ status: 'success', projects, isConfigured: result.isConfigured !== false })
      })
      .catch(() => {
        if (!active) return
        setState({ status: 'error', projects: [], isConfigured: true })
      })
    return () => { active = false }
  }, [])

  function reload() {
    setState((p) => ({ ...p, status: 'loading' }))
    getRecentProjects()
      .then((result) => {
        const projects = (result.projects || []).map(normalizeProject).filter((p) => p.id)
        setState({ status: 'success', projects, isConfigured: result.isConfigured !== false })
      })
      .catch(() => {
        setState({ status: 'error', projects: [], isConfigured: true })
      })
  }

  const filtered = state.projects.filter((p) => {
    if (!searchQuery) return true
    return p.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const hasProjects = filtered.length > 0

  return (
    <motion.section
      className="mb-5 rounded-xl border border-dp-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] max-sm:p-4"
      aria-labelledby="projects-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="projects-heading" className="m-0 text-[18px] font-bold leading-tight tracking-[-0.03em] text-dp-black">Recent Projects</h2>
        {hasProjects && (
          <a href="/dashboard/projects" className="inline-flex cursor-pointer items-center gap-[3px] rounded-full px-2.5 py-1.5 text-[12.5px] font-medium text-dp-text no-underline transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white">
            View all
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <path d="M4.5 2.5l4 4-4 4" />
            </svg>
          </a>
        )}
      </div>

      {state.status === 'loading' && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 max-sm:grid-cols-1">
          {[0, 1, 2].map((i) => <Skeleton key={i} />)}
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dp-border bg-[#FAFAF8] px-4 py-3">
          <p className="m-0 text-[13px] text-dp-text">Couldn't load projects.</p>
          <motion.button
            type="button"
            onClick={reload}
            className="shrink-0 cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-dp-black transition-[background-color,border-color,color] duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            Try again
          </motion.button>
        </div>
      )}

      {state.status === 'success' && !hasProjects && <EmptyState />}

      {state.status === 'success' && hasProjects && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 max-sm:grid-cols-1">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </motion.section>
  )
}
