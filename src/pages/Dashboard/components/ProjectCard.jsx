import { projectCardStyles } from './ProjectCard.styles'

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
      className={projectCardStyles.card}
      href={project.href || '#'}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={projectCardStyles.preview}>
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={`${project.name} preview`} className={projectCardStyles.thumbnail} />
        ) : (
          <div className={projectCardStyles.placeholder} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={projectCardStyles.placeholderIcon}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 15l4-4a2 2 0 012.8 0L15 16.2" />
              <path d="M14 14l1-1a2 2 0 012.8 0L21 16" />
              <circle cx="8.5" cy="8.5" r="1.5" />
            </svg>
          </div>
        )}
      </div>

      <div className={projectCardStyles.body}>
        <div className={projectCardStyles.header}>
          <h3 className={projectCardStyles.title}>{project.name}</h3>
          <button type="button" className={projectCardStyles.menuButton} aria-label="More actions" onClick={(e) => e.preventDefault()}>
            <svg viewBox="0 0 16 16" fill="currentColor" className={projectCardStyles.menuIcon}>
              <circle cx="8" cy="3" r="1.2" />
              <circle cx="8" cy="8" r="1.2" />
              <circle cx="8" cy="13" r="1.2" />
            </svg>
          </button>
        </div>
        <div className={projectCardStyles.meta}>
          {project.status && <span>{project.status}</span>}
          {relative && <span>{relative}</span>}
        </div>
        <span className={projectCardStyles.open}>
          Open project
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={projectCardStyles.openIcon}>
            <path d="M4.5 2.5l4 4-4 4" />
          </svg>
        </span>
      </div>
    </a>
  )
}
