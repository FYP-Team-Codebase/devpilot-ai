import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProject } from '../../services/projectService'
import { generationPageStyles as styles } from './GenerationPage.styles'

const EASE = [0.16, 1, 0.3, 1]
const PROJECT_ID_KEY = 'devpilot-current-project-id'
const INSPIRATION_MANIFEST_URL = '/inspirations/manifest.json'

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
  return STATUS_LABELS[status] || 'Status unavailable'
}

function getStatusClass(status) {
  return STATUS_CLASSES[status] || styles.statusUnknown
}

function resolveManifestInspiration(inspirations, inspirationId) {
  if (!Array.isArray(inspirations) || !hasText(inspirationId)) return null

  const exactMatch = inspirations.find((item) => item?.id === inspirationId)
  if (exactMatch) return exactMatch

  const normalizedId = inspirationId.trim().toLowerCase()
  return inspirations.find((item) => (
    hasText(item?.id) && item.id.trim().toLowerCase() === normalizedId
  )) || null
}

function getManifestImage(item) {
  return [item?.galleryPreview, item?.thumbnail, item?.fullPage].find(hasText) || ''
}

export default function GenerationPage() {
  const shouldReduceMotion = useReducedMotion()
  const [loadState, setLoadState] = useState('loading')
  const [project, setProject] = useState(null)
  const [inspirationManifest, setInspirationManifest] = useState([])

  const loadProject = useCallback(async () => {
    const projectId = sessionStorage.getItem(PROJECT_ID_KEY)

    if (!projectId) {
      setProject(null)
      setLoadState('missing')
      return
    }

    setLoadState('loading')

    try {
      const data = await getProject(projectId)
      const loadedProject = getProjectFromResponse(data)

      if (!loadedProject) {
        throw new Error('Project details could not be found.')
      }

      setProject(loadedProject)
      setLoadState('success')
    } catch (error) {
      if (import.meta.env.DEV) console.error('Unable to load the current project.', error)
      setProject(null)
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function run() {
      const projectId = sessionStorage.getItem(PROJECT_ID_KEY)

      if (!projectId) {
        if (isCurrent) setLoadState('missing')
        return
      }

      setLoadState('loading')

      try {
        const data = await getProject(projectId)
        const loadedProject = getProjectFromResponse(data)

        if (!loadedProject) throw new Error('Project details could not be found.')
        if (!isCurrent) return

        setProject(loadedProject)
        setLoadState('success')
      } catch (error) {
        if (!isCurrent) return
        if (import.meta.env.DEV) console.error('Unable to load the current project.', error)
        setProject(null)
        setLoadState('error')
      }
    }

    run()
    return () => { isCurrent = false }
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadInspirationManifest() {
      try {
        const response = await fetch(INSPIRATION_MANIFEST_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Manifest request failed with ${response.status}`)

        const data = await response.json()
        const entries = Array.isArray(data) ? data : data?.inspirations

        if (!Array.isArray(entries)) throw new Error('Manifest does not contain an inspirations array')
        if (isCurrent) setInspirationManifest(entries)
      } catch (error) {
        if (import.meta.env.DEV) console.error('Unable to load inspiration metadata.', error)
      }
    }

    loadInspirationManifest()
    return () => { isCurrent = false }
  }, [])

  const pageMotion = {
    initial: shouldReduceMotion ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: EASE },
  }

  if (loadState === 'loading') return <main className={styles.page}><LoadingState /></main>

  if (loadState === 'missing') {
    return (
      <main className={styles.page}>
        <StatePanel
          eyebrow="Generation"
          title="No active project found"
          body="Open a saved project or start a new one before reviewing it for generation."
          action={(
            <>
              <Link to="/dashboard" className={styles.primaryStateButton}>Back to Dashboard</Link>
              <Link to="/prompt" className={styles.secondaryStateButton}>Start from Prompt</Link>
            </>
          )}
        />
      </main>
    )
  }

  if (loadState === 'error') {
    return (
      <main className={styles.page}>
        <StatePanel
          eyebrow="Generation"
          title="We couldn’t load this project"
          body="Please try again, or return to your projects and open the saved setup again."
          action={(
            <>
              <button type="button" onClick={loadProject} className={styles.primaryStateButton}>Try Again</button>
              <Link to="/dashboard" className={styles.secondaryStateButton}>Back to Dashboard</Link>
            </>
          )}
        />
      </main>
    )
  }

  return (
    <motion.main className={styles.page} {...pageMotion}>
      <ProjectReview
        project={project}
        inspirationManifest={inspirationManifest}
        shouldReduceMotion={shouldReduceMotion}
      />
    </motion.main>
  )
}

function ProjectReview({ project, inspirationManifest, shouldReduceMotion }) {
  const requirements = project?.requirements || {}
  const status = project?.generationStatus || 'draft'
  const inspirations = toList(project?.inspirations)
  const generatedFiles = toList(project?.generatedFiles)
  const hasCompletedOutput = status === 'completed' && generatedFiles.length > 0
  const notes = hasText(requirements.notes) ? requirements.notes.trim() : ''

  return (
    <>
      <ProjectIdentity project={project} />
      <div className={styles.layout}>
        <div className={styles.stack}>
          <ProjectBrief prompt={project?.prompt} />
          <RequirementsSummary requirements={requirements} notes={notes} />
          <InspirationSummary inspirations={inspirations} inspirationManifest={inspirationManifest} />
        </div>
        <GenerationActionPanel
          status={status}
          generatedFileCount={generatedFiles.length}
          hasCompletedOutput={hasCompletedOutput}
          shouldReduceMotion={shouldReduceMotion}
        />
      </div>
    </>
  )
}

function ProjectIdentity({ project }) {
  return (
    <header className={styles.identity} aria-labelledby="generation-title">
      <div className={styles.identityTop}>
        <div>
          <p className={styles.eyebrow}>Generation</p>
          <h1 id="generation-title" className={styles.title}>{project?.projectName || 'Untitled Project'}</h1>
          <p className={styles.intro}>Review the saved project context before DevPilot generates its files.</p>
        </div>
      </div>
    </header>
  )
}

function StatusBadge({ status }) {
  return <span className={`${styles.statusBase} ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>
}

function ProjectBrief({ prompt }) {
  return (
    <section className={styles.panel} aria-labelledby="project-brief-title">
      <SectionHeading id="project-brief-title" title="Project Brief" description="The original prompt saved for this project." />
      <p className={styles.promptText}>{hasText(prompt) ? prompt.trim() : 'No prompt saved.'}</p>
    </section>
  )
}

function RequirementsSummary({ requirements, notes }) {
  const rows = [
    { label: 'Project Type', value: requirements.projectType },
    { label: 'Devices', items: toList(requirements.devices) },
    { label: 'Pages', items: toList(requirements.pages) },
    { label: 'Features', items: toList(requirements.features) },
    { label: 'Design Direction', items: toList(requirements.designPreferences), wide: true },
  ]

  return (
    <section className={styles.panel} aria-labelledby="requirements-summary-title">
      <SectionHeading id="requirements-summary-title" title="Requirements" description="The project decisions currently persisted in DevPilot." />
      <dl className={styles.summaryList}>
        {rows.map((row) => <SummaryRow key={row.label} {...row} />)}
        {notes && (
          <div className={`${styles.summaryItem} ${styles.summaryItemWide}`}>
            <dt className={styles.summaryTerm}>Notes</dt>
            <dd className={`${styles.summaryValue} ${styles.notes}`}>{notes}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

function SummaryRow({ label, value, items, wide }) {
  const list = toList(items)

  return (
    <div className={`${styles.summaryItem} ${wide ? styles.summaryItemWide : ''}`}>
      <dt className={styles.summaryTerm}>{label}</dt>
      <dd className={styles.summaryValue}>
        {list.length ? (
          <span className={styles.tagList}>{list.map((item) => <span key={item} className={styles.tag}>{item}</span>)}</span>
        ) : (value || 'None saved')}
      </dd>
    </div>
  )
}

function InspirationSummary({ inspirations, inspirationManifest }) {
  return (
    <section className={styles.panel} aria-labelledby="inspiration-summary-title">
      <SectionHeading id="inspiration-summary-title" title="Inspirations" description="Reference images selected for this project." />
      {inspirations.length ? (
        <div className={styles.inspirationList}>
          {inspirations.map((item, index) => (
            <InspirationReference
              key={`${item.inspirationId || 'inspiration'}-${index}`}
              item={item}
              metadata={resolveManifestInspiration(inspirationManifest, item?.inspirationId)}
            />
          ))}
        </div>
      ) : <p className={styles.emptyText}>No inspiration references saved.</p>}
    </section>
  )
}

function InspirationReference({ item, metadata }) {
  const title = hasText(metadata?.title) ? metadata.title.trim() : 'Saved inspiration'
  const category = hasText(metadata?.category) ? metadata.category.trim() : ''
  const imageUrl = hasText(item?.imageUrl) ? item.imageUrl.trim() : getManifestImage(metadata)

  return (
    <article className={styles.inspirationReference}>
      {imageUrl ? (
        <img src={imageUrl} alt={`${title} inspiration reference`} className={styles.inspirationImage} loading="lazy" decoding="async" />
      ) : <div className={styles.inspirationFallback}>No image</div>}
      <div className={styles.inspirationBody}>
        <p className={styles.inspirationId}>{title}</p>
        {category && <p className={styles.inspirationLabel}>{category}</p>}
      </div>
    </article>
  )
}

function GenerationActionPanel({ status, generatedFileCount, hasCompletedOutput, shouldReduceMotion }) {
  const content = {
    draft: {
      title: 'Complete project setup',
      copy: 'Review the requirements and inspiration selections before this project can be considered ready for generation.',
    },
    ready: {
      title: 'Ready for generation',
      copy: 'Your saved project context is ready. AI generation will be enabled when the generation engine is connected.',
    },
    generating: {
      title: 'Generating your project…',
      copy: 'DevPilot is preparing the project files. This may take a moment.',
    },
    failed: {
      title: 'Generation didn’t complete',
      copy: 'Your project information is still saved. Review the setup before generation retry is available.',
    },
    completed: hasCompletedOutput ? {
      title: 'Generation completed',
      copy: `${generatedFileCount} generated ${generatedFileCount === 1 ? 'file is' : 'files are'} saved. Project workspace tooling will become available when it is connected.`,
    } : {
      title: 'Generation output unavailable',
      copy: 'This project reports completion, but no generated files are available to inspect yet.',
    },
  }
  const state = content[status] || {
    title: 'Project status unavailable',
    copy: 'This project has an unrecognized generation status. Review the saved setup or return to your projects.',
  }

  return (
    <aside className={styles.actionPanel} aria-labelledby="generation-action-title">
      <div className={styles.actionHeader}>
        <p className={styles.actionEyebrow}>Generation status</p>
        <StatusBadge status={status} />
      </div>
      <h2 id="generation-action-title" className={styles.actionTitle}>{state.title}</h2>
      <p className={styles.actionCopy}>{state.copy}</p>
      {status === 'generating' && <GeneratingActivity shouldReduceMotion={shouldReduceMotion} />}
      {status === 'ready' && <button type="button" className={styles.actionButton} disabled>Generate Project</button>}
      {status === 'draft' && (
        <div className={styles.actionLinks}>
          <Link to="/requirements" className={styles.primaryActionLink}>Review Requirements</Link>
          <Link to="/inspiration" className={styles.secondaryActionLink}>Review Inspirations</Link>
        </div>
      )}
      {(status === 'failed' || !['draft', 'ready', 'generating', 'completed'].includes(status)) && (
        <div className={styles.actionLinks}>
          <Link to="/requirements" className={styles.secondaryActionLink}>Edit Requirements</Link>
          <Link to="/inspiration" className={styles.secondaryActionLink}>Edit Inspirations</Link>
          <Link to="/dashboard" className={styles.secondaryActionLink}>Back to Dashboard</Link>
        </div>
      )}
      {status === 'ready' && (
        <div className={styles.actionLinks}>
          <Link to="/requirements" className={styles.secondaryActionLink}>Edit Requirements</Link>
          <Link to="/inspiration" className={styles.secondaryActionLink}>Edit Inspirations</Link>
        </div>
      )}
      {status === 'completed' && !hasCompletedOutput && (
        <div className={styles.actionLinks}>
          <Link to="/requirements" className={styles.secondaryActionLink}>Edit Requirements</Link>
          <Link to="/inspiration" className={styles.secondaryActionLink}>Edit Inspirations</Link>
          <Link to="/dashboard" className={styles.secondaryActionLink}>Back to Dashboard</Link>
        </div>
      )}
    </aside>
  )
}

function GeneratingActivity({ shouldReduceMotion }) {
  return (
    <div className={styles.activity} role="status" aria-live="polite">
      <span className={`${styles.activityDot} ${shouldReduceMotion ? '' : 'motion-safe:animate-pulse'}`} aria-hidden="true" />
      <span>Generation is in progress.</span>
    </div>
  )
}

function SectionHeading({ id, title, description }) {
  return (
    <div className={styles.panelHeader}>
      <h2 id={id} className={styles.panelTitle}>{title}</h2>
      <p className={styles.panelDescription}>{description}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <section className={styles.loadingShell} aria-live="polite" aria-busy="true">
      <div className={styles.loadingHeader}>
        <div className={`${styles.skeletonLine} ${styles.skeletonEyebrow}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonIntro}`} />
      </div>
      <div className={styles.loadingLayout}>
        <div className={styles.loadingStack}>
          <div className={styles.loadingPanel}><div className={styles.skeletonLine} /><div className={styles.skeletonBlock} /></div>
          <div className={styles.loadingPanel}><div className={styles.skeletonLine} /><div className={styles.skeletonRows} /></div>
        </div>
        <div className={styles.loadingPanel}><div className={styles.skeletonLine} /><div className={styles.skeletonBlock} /></div>
      </div>
    </section>
  )
}

function StatePanel({ eyebrow, title, body, action }) {
  return (
    <section className={styles.stateWrap} role="status">
      <div className={styles.stateContent}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{body}</p>
        {action && <div className={styles.stateActions}>{action}</div>}
      </div>
    </section>
  )
}
