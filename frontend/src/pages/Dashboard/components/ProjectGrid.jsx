import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { deleteProject as deleteProjectRequest, getRecentProjects, updateProject as updateProjectRequest } from '../../../services/projectService'
import { restoreProjectSession } from '../../../utils/projectResume'
import { downloadProjectZip } from '../../../utils/projectZipExport'
import ProjectCard from './ProjectCard'
import { projectGridStyles } from './ProjectGrid.styles'
import { dashboardPageStyles } from '../DashboardPage.styles'

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
  const [exportError, setExportError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deletingProjectId, setDeletingProjectId] = useState('')
  const deletingProjectRef = useRef('')
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')
  const [renamingProjectId, setRenamingProjectId] = useState('')
  const renamingProjectRef = useRef('')
  const [openMenuId, setOpenMenuId] = useState('')
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

  function handleProjectExport(project) {
    try {
      downloadProjectZip(project)
      setExportError('')
    } catch (error) {
      setExportError(error?.message || 'Could not export this project as a ZIP file.')
    }
  }

  function confirmDelete(project) {
    if (!project || deletingProjectRef.current === project.id) return
    deletingProjectRef.current = project.id
    setDeletingProjectId(project.id)
    setDeleteError('')

    deleteProjectRequest(project.id)
      .then(() => {
        setState((current) => ({
          ...current,
          projects: current.projects.filter((item) => item.id !== project.id),
        }))
        setDeleteTarget(null)
      })
      .catch((error) => {
        setDeleteError(error?.message || 'Could not delete this project. Please try again.')
      })
      .finally(() => {
        deletingProjectRef.current = ''
        setDeletingProjectId('')
      })
  }

  function openDeleteDialog(project) {
    if (deletingProjectRef.current) return
    setDeleteError('')
    setDeleteTarget(project)
  }

  function openRenameDialog(project) {
    if (deletingProjectRef.current || renamingProjectRef.current) return
    setRenameTarget(project)
    setRenameValue(project.name)
    setRenameError('')
  }

  async function saveProjectName() {
    if (!renameTarget || renamingProjectRef.current) return
    const projectName = renameValue.trim()
    if (!projectName) {
      setRenameError('Enter a project name.')
      return
    }
    if (projectName === renameTarget.name) {
      setRenameTarget(null)
      return
    }

    renamingProjectRef.current = renameTarget.id
    setRenamingProjectId(renameTarget.id)
    setRenameError('')
    try {
      await updateProjectRequest(renameTarget.id, { projectName })
      setState((current) => ({
        ...current,
        projects: current.projects.map((project) => project.id === renameTarget.id
          ? { ...project, name: projectName, projectName }
          : project),
      }))
      setRenameTarget(null)
    } catch (error) {
      setRenameError(error?.message || 'Could not rename this project. Please try again.')
    } finally {
      renamingProjectRef.current = ''
      setRenamingProjectId('')
    }
  }

  function closeRenameDialog() {
    if (renamingProjectRef.current) return
    setRenameError('')
    setRenameTarget(null)
  }

  function toggleProjectMenu(projectId) {
    if (deletingProjectRef.current || renamingProjectRef.current) return
    setOpenMenuId((current) => current === projectId ? '' : projectId)
  }

  function closeProjectMenu() {
    setOpenMenuId('')
  }

  function closeDeleteDialog() {
    if (deletingProjectRef.current) return
    setDeleteError('')
    setDeleteTarget(null)
  }

  useEffect(() => {
    if (!deleteTarget && !renameTarget) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !deletingProjectRef.current && !renamingProjectRef.current) {
        setDeleteError('')
        setDeleteTarget(null)
        setRenameError('')
        setRenameTarget(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleteTarget, renameTarget])

  return (
    <>
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
        {exportError && (
          <p className={projectGridStyles.openError} role="alert">{exportError}</p>
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
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onOpen={handleProjectOpen}
                onRename={openRenameDialog}
                onExport={handleProjectExport}
                onDelete={openDeleteDialog}
                menuOpen={openMenuId === project.id}
                onMenuToggle={toggleProjectMenu}
                onMenuClose={closeProjectMenu}
                deleteDisabled={Boolean(deletingProjectId || renamingProjectId)}
              />
            ))}
          </div>
        )}
      </motion.section>

      {deleteTarget && (
        <div
          className={dashboardPageStyles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeleteDialog()
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            aria-describedby="delete-project-warning"
            className={dashboardPageStyles.modalPanelNarrow}
          >
            <div className={dashboardPageStyles.modalHeader}>
              <h2 id="delete-project-title" className={dashboardPageStyles.modalTitle}>Delete project?</h2>
            </div>
            <p id="delete-project-warning" className={dashboardPageStyles.modalCopy}>
              <strong>{deleteTarget.name}</strong> and all its saved data will be permanently deleted. This action cannot be undone.
            </p>
            {deleteError && <p className={projectGridStyles.deleteError} role="alert">{deleteError}</p>}
            <div className={projectGridStyles.deleteActions}>
              <button type="button" onClick={closeDeleteDialog} disabled={Boolean(deletingProjectId)} className={projectGridStyles.cancelDeleteButton}>Cancel</button>
              <button type="button" onClick={() => confirmDelete(deleteTarget)} disabled={Boolean(deletingProjectId)} className={projectGridStyles.confirmDeleteButton}>
                {deletingProjectId === deleteTarget.id ? 'Deleting…' : 'Delete Project'}
              </button>
            </div>
          </section>
        </div>
      )}

      {renameTarget && (
        <div
          className={dashboardPageStyles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRenameDialog()
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="rename-project-title" className={dashboardPageStyles.modalPanelNarrow}>
            <div className={dashboardPageStyles.modalHeader}>
              <h2 id="rename-project-title" className={dashboardPageStyles.modalTitle}>Rename project</h2>
            </div>
            <label className={projectGridStyles.renameLabel} htmlFor="rename-project-name">Project name</label>
            <input
              id="rename-project-name"
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') saveProjectName() }}
              className={projectGridStyles.renameInput}
              disabled={Boolean(renamingProjectId)}
            />
            {renameError && <p className={projectGridStyles.deleteError} role="alert">{renameError}</p>}
            <div className={projectGridStyles.deleteActions}>
              <button type="button" onClick={closeRenameDialog} disabled={Boolean(renamingProjectId)} className={projectGridStyles.cancelDeleteButton}>Cancel</button>
              <button type="button" onClick={saveProjectName} disabled={Boolean(renamingProjectId)} className={projectGridStyles.confirmRenameButton}>
                {renamingProjectId === renameTarget.id ? 'Saving…' : 'Save Name'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
