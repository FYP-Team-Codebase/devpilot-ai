import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProject } from '../../services/projectService'
import { generatedRouteToString, normalizeGeneratedRoute, readGeneratedRoute } from '../../services/generatedRoute'
import GeneratedAppPreview from './GeneratedAppPreview'
import { previewPageStyles as styles } from './PreviewPage.styles'

const PROJECT_ID_KEY = 'devpilot-current-project-id'
const REQUIREMENTS_KEY = 'devpilot-requirements'

function getProjectFromResponse(data) {
  return data?.project || data?.data?.project || data?.data || null
}

function getFileDisplayPath(path) {
  return typeof path === 'string' ? path.replace(/^frontend\//, '') : 'Generated file'
}

function syncProjectTitle(projectName) {
  if (typeof projectName !== 'string' || !projectName.trim()) return

  let current
  try {
    current = JSON.parse(sessionStorage.getItem(REQUIREMENTS_KEY) || '{}')
  } catch {
    current = {}
  }

  try {
    sessionStorage.setItem(REQUIREMENTS_KEY, JSON.stringify({ ...current, projectName: projectName.trim() }))
    window.dispatchEvent(new Event('devpilot-requirements-changed'))
  } catch { /* The workspace remains usable if browser storage is unavailable. */ }
}

export default function PreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentRoute, setCurrentRoute] = useState(() => readGeneratedRoute(window.location.search))
  const shouldReduceMotion = useReducedMotion()
  const [loadState, setLoadState] = useState('loading')
  const [project, setProject] = useState(null)
  const [selectedPath, setSelectedPath] = useState('')
  const [activeView, setActiveView] = useState('preview')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadProject() {
      const queryProjectId = searchParams.get('project')
      const sessionStorageProjectId = sessionStorage.getItem(PROJECT_ID_KEY)
      const projectId = queryProjectId || sessionStorageProjectId
      if (!projectId) {
        setLoadError('No active project was found. Return to your projects and open a saved generation.')
        setLoadState('error')
        return
      }

      setLoadState('loading')
      try {
        const data = await getProject(projectId)
      const loadedProject = getProjectFromResponse(data)
      if (!loadedProject) throw new Error('The saved project could not be found.')
      if (!isCurrent) return
        const files = Array.isArray(loadedProject.generatedFiles) ? loadedProject.generatedFiles : []
        const preferredFile = files.find((file) => /(?:^|\/)src\/App\.(?:jsx|tsx)$/i.test(file?.path || '')) || files[0]
        setProject(loadedProject)
        setSelectedPath(preferredFile?.path || '')
        syncProjectTitle(loadedProject.projectName)
        setLoadState('success')
      } catch (error) {
        if (!isCurrent) return
        setLoadError(error?.message || 'The saved project could not be loaded. Please try again.')
        setLoadState('error')
      }
    }

    loadProject()
    return () => { isCurrent = false }
  }, [])

  function handleNavigation(route) {
    const nextRoute = normalizeGeneratedRoute(route)
    if (generatedRouteToString(nextRoute) === generatedRouteToString(currentRoute)) return
    setCurrentRoute(nextRoute)
    setSearchParams((params) => { params.set('path', generatedRouteToString(nextRoute)); return params }, { replace: true })
  }

  const files = Array.isArray(project?.generatedFiles) ? project.generatedFiles : []
  const selectedFile = files.find((file) => file?.path === selectedPath) || null
  const isGenerated = project?.generationStatus === 'completed' && files.length > 0

  if (loadState === 'loading') {
    return (
      <main className={styles.page} aria-label="Loading generated project" aria-busy="true">
        <div className={styles.loadingPanel}>
          <div className={`${styles.skeleton} h-3 w-28`} />
          <div className={`${styles.skeleton} h-8 w-64 max-w-full`} />
          <div className={`${styles.skeleton} min-h-72 w-full`} />
        </div>
      </main>
    )
  }

  if (loadState === 'error') {
    return (
      <main className={styles.page}>
        <StatePanel
          eyebrow="Project unavailable"
          title="We couldn’t open this workspace"
          copy={loadError}
          action={<><Link className={styles.primaryLink} to="/generation">Back to Generation</Link><Link className={styles.secondaryLink} to="/dashboard/projects">My Projects</Link></>}
        />
      </main>
    )
  }

  if (!isGenerated) {
    return (
      <main className={styles.page}>
      <WorkspaceHeader project={project} canEdit={false} activeView={activeView} onViewChange={setActiveView} />
        <StatePanel
          eyebrow="Preview unavailable"
          title="This project has no completed output yet"
          copy={project?.generationStatus === 'generating'
            ? 'Generation is still in progress. Return to the Generation page to check its status.'
            : 'Once generation completes, the saved project files will appear here.'}
          action={<Link className={styles.primaryLink} to="/generation">Return to Generation</Link>}
        />
      </main>
    )
  }

  return (
    <motion.main
      className={styles.page}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <WorkspaceHeader project={project} canEdit activeView={activeView} onViewChange={setActiveView} currentRoute={currentRoute} />
      <section className={styles.workspace} aria-label="Generated project workspace">
        <aside className={styles.fileRail} aria-label="Generated files">
          <div className={styles.railHeader}>
            <h2 className={styles.railTitle}>Generated Files</h2>
            <span className={styles.fileCount}>{files.length} FILES</span>
          </div>
          <ul className={styles.fileList}>
            {files.map((file, index) => {
              const path = typeof file?.path === 'string' ? file.path : `file-${index + 1}`
              const isSelected = path === selectedPath
              return (
                <li key={`${path}-${index}`} className="min-w-0 list-none">
                  <button
                    type="button"
                    className={`${styles.fileButton} ${isSelected ? styles.selectedFileButton : ''}`}
                    onClick={() => setSelectedPath(path)}
                    aria-pressed={isSelected}
                    title={path}
                  >
                    <span className={`${styles.fileMark} ${isSelected ? styles.selectedFileMark : ''}`} aria-hidden="true" />
                    <span className={styles.fileName}>{getFileDisplayPath(path)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <PreviewWorkspace files={files} selectedFile={selectedFile} activeView={activeView} design={getPageDesign(project.editorDesign, currentRoute.pathname)} initialRoute={currentRoute} onNavigation={handleNavigation} />
      </section>
    </motion.main>
  )
}

function WorkspaceHeader({ project, canEdit, activeView, onViewChange, currentRoute }) {
  const status = project?.generationStatus || 'unknown'
  const statusLabel = status === 'completed' ? 'Generation completed' : status.charAt(0).toUpperCase() + status.slice(1)
  const projectId = project?._id || project?.id
  const exportUrl = projectId
    ? `/projects/${encodeURIComponent(projectId)}/export?path=${encodeURIComponent(generatedRouteToString(currentRoute || { pathname: '/' }))}`
    : ''
  const editorUrl = projectId
    ? `/edit?project=${encodeURIComponent(projectId)}&path=${encodeURIComponent(generatedRouteToString(currentRoute))}`
    : '/edit'

  function openEditor() {
    if (projectId) {
      sessionStorage.setItem(PROJECT_ID_KEY, projectId)
    }
  }

  return (
    <header className={styles.workspaceBar}>
      <div className={styles.projectMeta}>
        <p className={styles.eyebrow}>Project Workspace</p>
        <h1 className={styles.projectName}>{project?.projectName || 'Untitled Project'}</h1>
      </div>
      <div className={styles.headerActions}>
        <span className={`${styles.status} ${status === 'completed' ? '' : styles.statusOther}`}><span className={styles.statusDot} />{statusLabel}</span>
        <nav className={styles.tabs} aria-label="Project workspace sections">
          <button className={`${styles.tab} ${activeView === 'preview' ? styles.activeTab : ''}`} type="button" aria-current={activeView === 'preview' ? 'page' : undefined} onClick={() => onViewChange('preview')}>Preview</button>
          <button className={`${styles.tab} ${activeView === 'code' ? styles.activeTab : ''}`} type="button" aria-current={activeView === 'code' ? 'page' : undefined} onClick={() => onViewChange('code')}>Code</button>
          {projectId && <Link className={styles.tab} to={exportUrl} aria-label="Export project">Export</Link>}
        </nav>
        <Link to="/generation" className={styles.backLink}>Back to Generation</Link>
        {canEdit && <Link to={editorUrl} onClick={openEditor} className="inline-flex min-h-9 items-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-3 text-[12px] font-semibold text-white no-underline transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black" aria-label={`Edit ${project?.projectName || 'project'}`} title="Edit project">
          <PencilIcon />
          <span>Edit</span>
        </Link>}
      </div>
    </header>
  )
}

function PencilIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="m13.9 3.1 3 3m-11.8 8.8 9.9-9.9a2.1 2.1 0 0 1 3 3l-9.9 9.9-4.4 1.4 1.4-4.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="m12.5 4.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}

function PreviewWorkspace({ files, selectedFile, activeView, design, initialRoute, onNavigation }) {
  return <GeneratedAppPreview files={files} selectedFile={selectedFile} mode={activeView} design={design} initialRoute={initialRoute} onNavigation={onNavigation} />
}

function getPageDesign(editorDesign, pathname) {
  return editorDesign?.pages?.[pathname]?.elements || (pathname === '/' && !editorDesign?.pages ? editorDesign || {} : {})
}

function StatePanel({ eyebrow, title, copy, action }) {
  return (
    <section className={styles.statePanel} role="status">
      <div className={styles.stateContent}>
        <p className={styles.stateEyebrow}>{eyebrow}</p>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateCopy}>{copy}</p>
        {action && <div className={styles.stateActions}>{action}</div>}
      </div>
    </section>
  )
}
