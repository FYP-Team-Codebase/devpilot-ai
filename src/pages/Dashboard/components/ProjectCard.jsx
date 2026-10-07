import { useEffect, useRef } from 'react'
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

export default function ProjectCard({ project, index = 0, onOpen, onRename, onExport, onDelete, menuOpen = false, onMenuToggle, onMenuClose, deleteDisabled = false }) {
  const relative = formatRelative(project.updatedAt)
  const menuRef = useRef(null)

  function handleOpen() {
    onOpen?.(project)
  }

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    handleOpen()
  }

  function stopCardOpen(event) {
    event.stopPropagation()
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) onMenuClose?.()
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onMenuClose?.()
        menuRef.current?.querySelector('button[aria-haspopup="menu"]')?.focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, onMenuClose])

  function handleAction(event, action) {
    stopCardOpen(event)
    onMenuClose?.()
    action?.(project)
  }

  const hasGeneratedFiles = Array.isArray(project.generatedFiles)
    ? project.generatedFiles.length > 0
    : Boolean(project.generatedFiles && typeof project.generatedFiles === 'object' && Object.keys(project.generatedFiles).length)

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.name}`}
      className={projectCardStyles.card}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
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
        </div>
        <div className={projectCardStyles.meta}>
          {project.status && <span>{project.status}</span>}
          {relative && <span>{relative}</span>}
        </div>
        <div className={projectCardStyles.actionRow}>
          <span className={projectCardStyles.open}>
            Open project
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={projectCardStyles.openIcon}>
              <path d="M4.5 2.5l4 4-4 4" />
            </svg>
          </span>
          <div ref={menuRef} className={projectCardStyles.menuContainer}>
            <button
              type="button"
              className={projectCardStyles.menuButton}
              aria-label={`More actions for ${project.name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={(event) => { stopCardOpen(event); onMenuToggle?.(project.id) }}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className={projectCardStyles.menuIcon}>
                <circle cx="8" cy="3" r="1.2" />
                <circle cx="8" cy="8" r="1.2" />
                <circle cx="8" cy="13" r="1.2" />
              </svg>
            </button>
            {menuOpen && (
              <div role="menu" aria-label={`${project.name} actions`} className={projectCardStyles.menuDropdown}>
                <button type="button" role="menuitem" className={projectCardStyles.menuItem} onClick={(event) => handleAction(event, onRename)}>Rename</button>
                {hasGeneratedFiles && (
                  <button type="button" role="menuitem" className={projectCardStyles.menuItem} onClick={(event) => handleAction(event, onExport)}>Export ZIP</button>
                )}
                <button type="button" role="menuitem" className={projectCardStyles.menuItemDestructive} disabled={deleteDisabled} onClick={(event) => handleAction(event, onDelete)}>Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
