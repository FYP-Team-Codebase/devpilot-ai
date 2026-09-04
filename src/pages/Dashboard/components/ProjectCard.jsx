function formatRelative(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now - date
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}

export default function ProjectCard({ project, index = 0 }) {
  const relative = formatRelative(project.updatedAt)

  return (
    <a
      className="group flex flex-col overflow-hidden rounded-xl border border-dp-border bg-white text-inherit no-underline shadow-[0_1px_2px_rgba(0,0,0,0.02)] animate-[fadeUp_0.35s_ease_both] transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-px hover:border-dp-border-dark hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      href={project.href || '#'}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="aspect-[16/10] overflow-hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px),var(--color-dp-off-white)] bg-[size:20px_20px]">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={`${project.name} preview`} className="w-full h-full object-cover" />
        ) : (
          <div className="grid place-items-center w-full h-full text-dp-border-dark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 opacity-40">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 15l4-4a2 2 0 012.8 0L15 16.2" />
              <path d="M14 14l1-1a2 2 0 012.8 0L21 16" />
              <circle cx="8.5" cy="8.5" r="1.5" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-3.5 pb-3.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="m-0 text-[13px] font-semibold tracking-tight text-dp-black overflow-hidden text-ellipsis whitespace-nowrap">{project.name}</h3>
          <button type="button" className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-dp-muted transition-[background-color,color] duration-100 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-1 focus-visible:ring-offset-white" aria-label="More actions" onClick={(e) => e.preventDefault()}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <circle cx="8" cy="3" r="1.2" />
              <circle cx="8" cy="8" r="1.2" />
              <circle cx="8" cy="13" r="1.2" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-dp-muted">
          {project.status && <span>{project.status}</span>}
          {relative && <span>{relative}</span>}
        </div>
        <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-dp-text transition-colors duration-150 group-hover:text-dp-black">
          Open project
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M4.5 2.5l4 4-4 4" />
          </svg>
        </span>
      </div>
    </a>
  )
}
