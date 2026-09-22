import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProject } from '../../services/projectService'
import { generationPageStyles as styles } from './GenerationPage.styles'

const EASE = [0.16, 1, 0.3, 1]
const PROJECT_ID_KEY = 'devpilot-current-project-id'

const STATUS_LABELS = {
  draft: 'Draft',
  ready: 'Ready to generate',
  generating: 'Generating',
  completed: 'Completed',
  failed: 'Failed',
}

const STATUS_CLASSES = {
  draft: styles.statusDraft,
  ready: styles.statusReady,
  generating: styles.statusGenerating,
  completed: styles.statusCompleted,
  failed: styles.statusFailed,
}

function toList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function getProjectFromResponse(data) {
  return data?.project || data?.data?.project || data?.data || null
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || (hasText(status) ? status : 'Draft')
}

function getStatusClass(status) {
  return STATUS_CLASSES[status] || styles.statusDraft
}

export default function GenerationPage() {
  const shouldReduceMotion = useReducedMotion()
  const [loadState, setLoadState] = useState('loading')
  const [project, setProject] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const loadProject = useCallback(async () => {
    const projectId = sessionStorage.getItem(PROJECT_ID_KEY)

    if (!projectId) {
      setProject(null)
      setErrorMessage('')
      setLoadState('missing')
      return
    }

    setLoadState('loading')
    setErrorMessage('')

    try {
      const data = await getProject(projectId)
      const loadedProject = getProjectFromResponse(data)

      if (!loadedProject) {
        throw new Error('Project details could not be found.')
      }

      setProject(loadedProject)
      setLoadState('success')
    } catch (error) {
      setProject(null)
      setErrorMessage(error?.message || 'Could not load the project.')
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function run() {
      const projectId = sessionStorage.getItem(PROJECT_ID_KEY)

      if (!projectId) {
        if (!isCurrent) return
        setProject(null)
        setErrorMessage('')
        setLoadState('missing')
        return
      }

      if (!isCurrent) return
      setLoadState('loading')
      setErrorMessage('')

      try {
        const data = await getProject(projectId)
        const loadedProject = getProjectFromResponse(data)

        if (!loadedProject) {
          throw new Error('Project details could not be found.')
        }

        if (!isCurrent) return
        setProject(loadedProject)
        setLoadState('success')
      } catch (error) {
        if (!isCurrent) return
        setProject(null)
        setErrorMessage(error?.message || 'Could not load the project.')
        setLoadState('error')
      }
    }

    run()

    return () => {
      isCurrent = false
    }
  }, [])

  const pageMotion = {
    initial: shouldReduceMotion ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: EASE },
  }

  if (loadState === 'loading') {
    return (
      <main className={styles.page}>
        <StatePanel title="Loading project" body="Retrieving the saved project configuration from DevPilot." type="loading" />
      </main>
    )
  }

  if (loadState === 'missing') {
    return (
      <main className={styles.page}>
        <StatePanel
          title="Project session not found"
          body="The current project ID is missing in this tab. Start again from Prompt to prepare a project for generation."
          action={<Link to="/prompt" className={styles.retryButton}>Back to Prompt</Link>}
        />
      </main>
    )
  }

  if (loadState === 'error') {
    return (
      <main className={styles.page}>
        <StatePanel
          title="Could not load project"
          body={errorMessage}
          action={<button type="button" onClick={loadProject} className={styles.retryButton}>Try Again</button>}
        />
      </main>
    )
  }

  return (
    <motion.main className={styles.page} {...pageMotion}>
      <ProjectReady project={project} />
    </motion.main>
  )
}

function ProjectReady({ project }) {
  const requirements = project?.requirements || {}
  const inspirations = toList(project?.inspirations)
  const status = project?.generationStatus || 'draft'
  const notes = hasText(requirements.notes) ? requirements.notes.trim() : ''

  const summaryRows = [
    { label: 'Project Type', value: requirements.projectType || 'Not selected' },
    { label: 'Pages', items: toList(requirements.pages) },
    { label: 'Features', items: toList(requirements.features) },
    { label: 'Devices', items: toList(requirements.devices) },
    { label: 'Design Preferences', items: toList(requirements.designPreferences) },
  ]

  return (
    <>
      <section className={styles.hero} aria-labelledby="generation-title">
        <div className={styles.heroTop}>
          <div>
            <p className={styles.eyebrow}>Generation</p>
            <h1 id="generation-title" className={styles.title}>
              {project?.projectName || 'Untitled Project'}
            </h1>
            <p className={styles.intro}>
              The project configuration has been prepared and saved. The generation engine is the next stage, so this page shows the real persisted setup without starting any AI work yet.
            </p>
          </div>
          <span className={`${styles.statusBase} ${getStatusClass(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
        <div className={styles.actionRow}>
          <Link to="/inspiration" className={styles.secondaryLink}>Edit inspirations</Link>
          <Link to="/requirements" className={styles.secondaryLink}>Edit requirements</Link>
          <p className={styles.helperText}>Generation engine coming next.</p>
        </div>
      </section>

      <div className={styles.layout}>
        <div className={styles.stack}>
          <section className={styles.panel} aria-labelledby="project-summary-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="project-summary-title" className={styles.panelTitle}>Project Summary</h2>
                <p className={styles.panelDescription}>Loaded from the saved MongoDB project.</p>
              </div>
            </div>

            <dl className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <dt className={styles.summaryTerm}>Prompt</dt>
                <dd className={`${styles.summaryValue} ${styles.promptBox}`}>
                  {project?.prompt || 'No prompt saved.'}
                </dd>
              </div>

              {summaryRows.map((row) => (
                <SummaryRow key={row.label} label={row.label} value={row.value} items={row.items} />
              ))}

              {notes && (
                <div className={styles.summaryItem}>
                  <dt className={styles.summaryTerm}>Notes</dt>
                  <dd className={`${styles.summaryValue} ${styles.notes}`}>{notes}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className={styles.panel} aria-labelledby="inspiration-summary-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="inspiration-summary-title" className={styles.panelTitle}>Inspiration Summary</h2>
                <p className={styles.panelDescription}>Compact inspiration references saved for this project.</p>
              </div>
            </div>

            {inspirations.length ? (
              <div className={styles.inspirationGrid}>
                {inspirations.map((item, index) => (
                  <InspirationReference key={`${item.inspirationId || 'inspiration'}-${index}`} item={item} />
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>No inspiration references saved.</p>
            )}
          </section>
        </div>

        <aside className={styles.actionPanel} aria-labelledby="generation-action-title">
          <h2 id="generation-action-title" className={styles.actionTitle}>Generation Action</h2>
          <p className={styles.actionCopy}>
            This foundation is ready for the future generation backend. The button is intentionally disabled until that engine exists.
          </p>
          <button type="button" className={styles.actionButton} disabled>
            Generate Project
          </button>
          <div className={styles.editLinks}>
            <Link to="/inspiration" className={styles.secondaryLink}>Review inspirations</Link>
            <Link to="/requirements" className={styles.secondaryLink}>Review requirements</Link>
          </div>
        </aside>
      </div>
    </>
  )
}

function SummaryRow({ label, value, items }) {
  const list = toList(items)

  return (
    <div className={styles.summaryItem}>
      <dt className={styles.summaryTerm}>{label}</dt>
      <dd className={styles.summaryValue}>
        {list.length ? (
          <span className={styles.tagList}>
            {list.map((item) => (
              <span key={item} className={styles.tag}>{item}</span>
            ))}
          </span>
        ) : (
          value || 'None saved'
        )}
      </dd>
    </div>
  )
}

function InspirationReference({ item }) {
  const id = item?.inspirationId || 'Unknown inspiration'
  const source = item?.source || 'devpilot'

  return (
    <article className={styles.inspirationCard}>
      {item?.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={`Inspiration reference ${id}`}
          className={styles.inspirationImage}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles.inspirationFallback}>No image</div>
      )}
      <div className={styles.inspirationBody}>
        <p className={styles.inspirationLabel}>{source}</p>
        <p className={styles.inspirationId}>{id}</p>
      </div>
    </article>
  )
}

function StatePanel({ title, body, action, type }) {
  return (
    <section
      className={styles.stateWrap}
      aria-live={type === 'loading' ? 'polite' : undefined}
      role={type === 'loading' ? 'status' : 'alert'}
    >
      <div className={styles.stateContent}>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{body}</p>
        {type === 'loading' && <div className={`${styles.skeleton} mt-5`} aria-hidden="true" />}
        {action && <div className={styles.stateActions}>{action}</div>}
      </div>
    </section>
  )
}
