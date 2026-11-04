import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { exportProject, getProject } from '../../services/projectService'

function unwrap(data) { return data?.project || data?.data?.project || data?.data || null }

export default function ExportPage() {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let current = true
    getProject(projectId).then((result) => {
      const loaded = unwrap(result)
      if (!loaded) throw new Error('Project not found.')
      if (current) setProject(loaded)
    }).catch((loadError) => { if (current) setError(loadError.message || 'Unable to load project.') })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [projectId, loadAttempt])

  const files = Array.isArray(project?.generatedFiles) ? project.generatedFiles : []
  const counts = useMemo(() => ({
    frontend: files.filter((file) => /^frontend\//i.test(file?.path || '')).length,
    backend: files.filter((file) => /^backend\//i.test(file?.path || '')).length,
    config: files.filter((file) => /(?:^|\/)(?:package\.json|vite\.config\.[^/]+|\.env(?:\.example)?|README\.md|\.gitignore)$/i.test(file?.path || '')).length,
  }), [files])

  async function handleExport() {
    setExporting(true)
    setError('')
    try {
      await exportProject(projectId, project?.projectName)
      setDownloaded(true)
    } catch (exportError) {
      setError(exportError.message || 'Unable to export project.')
    } finally {
      setExporting(false)
    }
  }

  const currentPath = searchParams.get('path') || '/'
  const editorUrl = `/edit?project=${encodeURIComponent(projectId)}&path=${encodeURIComponent(currentPath)}`
  const previewUrl = `/preview?project=${encodeURIComponent(projectId)}&path=${encodeURIComponent(currentPath)}`

  if (loading) return <main className="mx-auto grid min-h-[60vh] max-w-3xl place-content-center text-center text-sm text-dp-muted" role="status" aria-live="polite">Preparing project...</main>
  if (!project) return <main className="mx-auto grid min-h-[60vh] max-w-3xl place-content-center gap-4 px-5 text-center"><h1 className="text-2xl font-semibold text-dp-black">Unable to load project</h1><p className="text-sm text-dp-muted" role="alert">{error || 'Project not found.'}</p><div className="flex justify-center gap-5"><button type="button" onClick={() => { setLoading(true); setError(''); setLoadAttempt((attempt) => attempt + 1) }} className="text-sm font-semibold underline">Retry</button><Link to="/dashboard/projects" className="text-sm font-semibold underline">Back to Projects</Link></div></main>

  const status = project.generationStatus || 'unknown'
  const ready = status === 'completed' && files.length > 0
  return <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-7 sm:py-12">
    <Link to={previewUrl} className="text-sm font-medium text-dp-muted hover:text-dp-black">← Project workspace</Link>
    <header className="mt-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d5dfc]">Project export</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-dp-black sm:text-4xl">Your project is ready to export</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-dp-muted">Download the current saved version of your generated application and its project files.</p></header>

    <section className="mt-8 rounded-2xl border border-[#e4e6e4] bg-white p-5 shadow-sm sm:p-7" aria-label="Project summary">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-wider text-dp-muted">Project</p><h2 className="mt-1 text-xl font-semibold text-dp-black">{project.projectName || 'Untitled Project'}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{status === 'completed' ? 'Generation completed' : status}</span></div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Files', files.length], ['Frontend', counts.frontend], ['Backend', counts.backend], ['Configuration', counts.config]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#f6f7f6] p-4"><p className="text-xs text-dp-muted">{label}</p><p className="mt-1 text-lg font-semibold text-dp-black">{value}</p></div>)}
      </div>
      <p className="mt-4 text-xs leading-5 text-dp-muted">{project.requirements?.projectType ? `Project type: ${project.requirements.projectType}. ` : ''}Stack: React, Vite, Node.js, Express, and MongoDB. Includes saved source, assets, configuration, and editor changes.</p>
    </section>

    <section className="mt-5 rounded-2xl border border-[#e4e6e4] bg-white p-5 shadow-sm sm:p-7" aria-label="Export project">
      <div><h2 className="text-lg font-semibold text-dp-black">Export your project</h2><p className="mt-1 text-sm text-dp-muted">Download your complete project as a ZIP file.</p></div>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-[#e8eae8] bg-[#fafbfa] px-4 py-3"><div><p className="text-sm font-semibold text-dp-black">ZIP archive</p><p className="mt-0.5 text-xs text-dp-muted">UTF-8 · complete project structure</p></div><span className="rounded-md bg-[#eeedff] px-2 py-1 text-xs font-bold text-[#5749dd]">ZIP</span></div>
      <ul className="mt-5 grid gap-2 text-sm text-[#454b47] sm:grid-cols-2">{['Generated frontend', 'Backend', 'Configuration files', 'Assets', 'Latest saved editor changes'].map((label) => <li key={label} className="flex items-center gap-2"><span className="font-bold text-emerald-600" aria-hidden="true">✓</span>{label}</li>)}</ul>
      {!ready && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900" role="status">This project does not have completed files to export yet.</p>}
      {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      {downloaded && !error && <p className="mt-5 text-sm font-medium text-emerald-700" role="status">Project exported successfully. You can download it again.</p>}
      <button type="button" onClick={handleExport} disabled={!ready || exporting} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#171918] px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        {exporting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}{exporting ? 'Preparing ZIP...' : error ? 'Retry download' : 'Download ZIP'}
      </button>
    </section>
    <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium" aria-label="Project navigation"><Link to={editorUrl} className="text-dp-black underline underline-offset-4">Back to Editor</Link><Link to={previewUrl} className="text-dp-black underline underline-offset-4">Back to Preview</Link><Link to="/dashboard/projects" className="text-dp-muted underline underline-offset-4">Projects</Link></nav>
  </main>
}
