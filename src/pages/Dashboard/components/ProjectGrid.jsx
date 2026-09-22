import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { getRecentProjects } from '../../../services/projectService'
import { restoreProjectSession } from '../../../utils/projectResume'
import ProjectCard from './ProjectCard'
import { projectGridStyles } from './ProjectGrid.styles'

const buttonMotion = { duration: 0.2, ease: 'easeOut' }

function normalizeProject(p) {
  return {
    ...p,
    id: p.id || p._id || p.slug || p.name,
    name: p.name || p.projectName || p.title || 'Untitled website',
    description: p.description || p.prompt || '',
    thumbnail: p.thumbnail || p.previewImage || p.previewUrl || p.screenshot || '',
    updatedAt: p.updatedAt || p.lastUpdated || p.createdAt,
    status: p.status || p.generationStatus || '',
    href: p.href || p.url || p.editUrl || '',
  }
}

function Skeleton() {
  return (
    <div className={projectGridStyles.skeleton}>
      <div className={`${projectGridStyles.skeletonPreview} ${projectGridStyles.shimmer}`} />
      <div className={projectGridStyles.skeletonBody}>
        <div className={`${projectGridStyles.skeletonLineLarge} ${projectGridStyles.shimmer}`} />
        <div className={`${projectGridStyles.skeletonLineSmall} ${projectGridStyles.shimmer}`} />
      </div>
    </div>
  )
}

function EmptyState() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className={projectGridStyles.empty}>
      <div className={projectGridStyles.emptyIconWrap} aria-hidden="true">
        <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={projectGridStyles.emptyIcon}>
          <path d="M3.5 6.5h5l1.4 2H18.5v6.7a2.3 2.3 0 0 1-2.3 2.3H5.8a2.3 2.3 0 0 1-2.3-2.3V6.5Z" />
          <path d="M3.5 8.5h15" />
        </svg>
      </div>
      <p className={projectGridStyles.emptyTitle}>No projects yet</p>
      <p className={projectGridStyles.emptyCopy}>Start your first AI website.</p>
      <motion.a
        href="/prompt"
        className={projectGridStyles.emptyButton}
        whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.01 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={buttonMotion}
      >
        Generate Website
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={projectGridStyles.emptyButtonIcon}>
          <path d="M2.5 6h7M6.5 2.5l3.5 3.5-3.5 3.5" />
        </svg>
      </motion.a>
    </div>
  )
}

export default function ProjectGrid({ searchQuery = '' }) {
  const [state, setState] = useState({ status: 'loading', projects: [], isConfigured: true })
  const [openError, setOpenError] = useState('')
  const navigate = useNavigate()
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

  function handleProjectOpen(project) {
    try {
      const route = restoreProjectSession(project)
      setOpenError('')
      navigate(route)
    } catch (error) {
      setOpenError(error?.message || 'This project could not be opened.')
    }
  }

  return (
    <motion.section
      className={projectGridStyles.section}
      aria-labelledby="projects-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={projectGridStyles.header}>
        <h2 id="projects-heading" className={projectGridStyles.heading}>Recent Projects</h2>
        {hasProjects && (
          <a href="/dashboard/projects" className={projectGridStyles.viewAll}>
            View all
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={projectGridStyles.viewAllIcon}>
              <path d="M4.5 2.5l4 4-4 4" />
            </svg>
          </a>
        )}
      </div>

      {openError && (
        <p className={projectGridStyles.openError} role="alert">{openError}</p>
      )}

      {state.status === 'loading' && (
        <div className={projectGridStyles.grid}>
          {[0, 1, 2].map((i) => <Skeleton key={i} />)}
        </div>
      )}

      {state.status === 'error' && (
        <div className={projectGridStyles.error}>
          <p className={projectGridStyles.errorText}>Couldn't load projects.</p>
          <motion.button
            type="button"
            onClick={reload}
            className={projectGridStyles.retryButton}
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
        <div className={projectGridStyles.grid}>
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onOpen={handleProjectOpen} />
          ))}
        </div>
      )}
    </motion.section>
  )
}
