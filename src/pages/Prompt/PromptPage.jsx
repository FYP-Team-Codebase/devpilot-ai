import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../services/authService'
import { getRecentProjects } from '../../services/projectService'
import UserMenu from '../Dashboard/components/UserMenu'
import { promptPageStyles } from './PromptPage.styles'

const EASE = [0.16, 1, 0.3, 1]
const buttonMotion = { duration: 0.2, ease: 'easeOut' }
const MAX_PROMPT_LENGTH = 3000

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { id: 'projects', label: 'My Projects', href: '/dashboard/projects', icon: 'projects' },
  { id: 'prompt', label: 'Prompt Builder', href: '/prompt', icon: 'prompt' },
  { id: 'inspiration', label: 'Inspiration Gallery', href: '/dashboard/inspiration', icon: 'inspiration' },
  { id: 'pricing', label: 'Pricing', href: '/dashboard/pricing', icon: 'pricing' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

const USER_TYPES = [
  { value: 'non-technical', label: 'Non-Technical' },
  { value: 'designer', label: 'Designer' },
  { value: 'technical', label: 'Developer' },
]

const MODELS = [
  { value: 'devpilot-default', label: 'DevPilot Default' },
]

const SUGGESTIONS = [
  {
    label: 'Restaurant',
    prompt: 'Build a modern restaurant website with a menu, reservations, location information, opening hours, and contact section.',
  },
  {
    label: 'Portfolio',
    prompt: 'Build a modern portfolio website for a creative professional with projects, about, experience, and contact sections.',
  },
  {
    label: 'SaaS',
    prompt: 'Build a modern SaaS landing page with a hero section, features, workflow, pricing, testimonials, and call to action.',
  },
  {
    label: 'Hospital',
    prompt: 'Build a clean hospital website with services, doctor profiles, appointments, patient information, location, and contact sections.',
  },
  {
    label: 'Learning Platform',
    prompt: 'Build a learning platform website with course categories, instructor highlights, pricing, testimonials, and student dashboard preview.',
  },
  {
    label: 'Ecommerce',
    prompt: 'Build a modern ecommerce website with featured products, categories, product details, cart flow, customer reviews, and checkout sections.',
  },
]

const FEATURES = [
  {
    title: 'AI-Powered',
    description: 'Advanced AI models understand your requirements.',
    icon: 'spark',
  },
  {
    title: 'Full Stack Generated',
    description: 'Frontend, backend and database included.',
    icon: 'stack',
  },
  {
    title: 'Instant Preview',
    description: 'See your website come to life.',
    icon: 'preview',
  },
  {
    title: 'Export & Own',
    description: 'Export your code and own your project.',
    icon: 'export',
  },
]

function getInitialUserType(user) {
  const value = user?.userType
  return USER_TYPES.some((type) => type.value === value) ? value : 'non-technical'
}

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

function normalizeProject(p) {
  return {
    id: p.id || p._id || p.slug || p.name,
    name: p.name || p.title || 'Untitled website',
    updatedAt: p.updatedAt || p.lastUpdated || p.createdAt,
    status: p.status || '',
    href: p.href || p.url || p.editUrl || '',
  }
}

export default function PromptPage() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentProjects, setRecentProjects] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposerExpanded, setIsComposerExpanded] = useState(false)
  const [userType, setUserType] = useState(() => getInitialUserType(user))
  const [model, setModel] = useState(MODELS[0].value)
  const textareaRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const isFilled = value.trim().length > 0
  const promptPreview = value.trim() || 'Describe the website you want to build...'
  useEffect(() => {
    getRecentProjects()
      .then((result) => {
        const projects = (result.projects || []).map(normalizeProject).filter((p) => p.id)
        setRecentProjects(projects.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isSubmitting) return
    const id = window.setTimeout(() => {
      sessionStorage.setItem('devpilot-prompt', value.trim())
      navigate('/requirements')
    }, 800)
    return () => window.clearTimeout(id)
  }, [isSubmitting, navigate, value])

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSidebarOpen(false)
        setIsComposerExpanded(true)
        window.setTimeout(() => textareaRef.current?.focus(), shouldReduceMotion ? 0 : 110)
        return
      }

      if (e.key === 'Escape' && isComposerExpanded && !isSubmitting) {
        e.preventDefault()
        setIsComposerExpanded(false)
        setIsFocused(false)
        textareaRef.current?.blur()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isComposerExpanded, isSubmitting, shouldReduceMotion])

  function openComposer() {
    setIsSidebarOpen(false)
    setIsComposerExpanded(true)
    window.setTimeout(() => textareaRef.current?.focus(), shouldReduceMotion ? 0 : 110)
  }

  function closeComposer() {
    if (isSubmitting) return
    setIsComposerExpanded(false)
    setIsFocused(false)
    textareaRef.current?.blur()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!isFilled || isSubmitting) return
    setIsSubmitting(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isFilled && !isSubmitting) setIsSubmitting(true)
    }
  }

  function handleSuggestionClick(prompt) {
    setValue(prompt)
    openComposer()
  }

  function handleNewProject() {
    setValue('')
    setIsSubmitting(false)
    setIsSidebarOpen(false)
    openComposer()
  }

  return (
    <div className={promptPageStyles.page}>
      <PromptSidebar
        isOpen={isSidebarOpen}
        recentProjects={recentProjects}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={handleNewProject}
      />

      <AnimatePresence>
        {isComposerExpanded && (
          <motion.div
            className={promptPageStyles.overlay}
            aria-hidden="true"
            onClick={closeComposer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <div className={promptPageStyles.shell}>
        <PromptHeader user={user} onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className={promptPageStyles.main}>
          <div className={promptPageStyles.content}>
            <motion.div
              className={promptPageStyles.intro}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: EASE }}
            >
              <h1 className={promptPageStyles.heading}>
                What would you like to build today?
              </h1>
              <p className={promptPageStyles.introText}>
                Describe your idea and DevPilot AI will generate a complete, production-ready website.
              </p>
            </motion.div>

            <motion.form
              className={`${promptPageStyles.formBase} ${
                isComposerExpanded || isFocused ? promptPageStyles.formFocused : promptPageStyles.formDefault
              }`}
              onSubmit={handleSubmit}
              aria-label="Describe what you want to build"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: isComposerExpanded && !shouldReduceMotion ? -2 : 0,
                height: isComposerExpanded ? 'auto' : 68,
                boxShadow: isComposerExpanded ? '0 20px 60px rgba(0,0,0,0.08)' : 'var(--shadow-dp-card)',
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence initial={false} mode="wait">
                {!isComposerExpanded ? (
                  <motion.button
                    key="collapsed"
                    type="button"
                    className={promptPageStyles.collapsedButton}
                    onClick={openComposer}
                    onFocus={openComposer}
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                  >
                    <span className={promptPageStyles.collapsedIcon} aria-hidden="true">
                      <PromptIcon name="spark" />
                    </span>
                    <span className={`${promptPageStyles.collapsedPreviewBase} ${value.trim() ? promptPageStyles.collapsedPreviewFilled : promptPageStyles.collapsedPreviewEmpty}`}>
                      {promptPreview}
                    </span>
                    <motion.span
                      className={promptPageStyles.chevronButton}
                      aria-hidden="true"
                      animate={{ rotate: 0 }}
                      transition={buttonMotion}
                    >
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={promptPageStyles.chevronIcon}>
                        <path d="M3 4.5l3 3 3-3" />
                      </svg>
                    </motion.span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="expanded"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                  >
                    <div className={promptPageStyles.expandedBody}>
                      <button
                        type="button"
                        className={promptPageStyles.collapseButton}
                        aria-label="Collapse prompt composer"
                        onClick={closeComposer}
                        disabled={isSubmitting}
                      >
                        <motion.svg
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={promptPageStyles.chevronIcon}
                          aria-hidden="true"
                          animate={{ rotate: 180 }}
                          transition={buttonMotion}
                        >
                          <path d="M3 4.5l3 3 3-3" />
                        </motion.svg>
                      </button>
                      <label htmlFor="prompt-input" className="sr-only">Describe the website you want to build</label>
                      <textarea
                        id="prompt-input"
                        ref={textareaRef}
                        className={promptPageStyles.textarea}
                        value={value}
                        maxLength={MAX_PROMPT_LENGTH}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Describe the website you want to build..."
                        aria-describedby="prompt-count"
                        disabled={isSubmitting}
                      />
                      <span id="prompt-count" className={promptPageStyles.count}>
                        {value.length}/{MAX_PROMPT_LENGTH}
                      </span>
                    </div>

                    <motion.div
                      className={promptPageStyles.controlsBar}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : 0.08, ease: 'easeOut' }}
                    >
                      <div className={promptPageStyles.controlsLeft}>
                        <SelectControl
                          label="User type"
                          value={userType}
                          options={USER_TYPES}
                          onChange={setUserType}
                          disabled={isSubmitting}
                        />
                        <SelectControl
                          label="AI model"
                          value={model}
                          options={MODELS}
                          onChange={setModel}
                          disabled={isSubmitting}
                        />
                      </div>

                      <GenerateButton isFilled={isFilled} isSubmitting={isSubmitting} shouldReduceMotion={shouldReduceMotion} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>

            <PromptSuggestions
              suggestions={SUGGESTIONS}
              onSelect={handleSuggestionClick}
              disabled={isSubmitting}
              shouldReduceMotion={shouldReduceMotion}
            />

            <FeatureStrip shouldReduceMotion={shouldReduceMotion} />

            <motion.p
              className={promptPageStyles.footerNote}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.32, delay: shouldReduceMotion ? 0 : 0.18, ease: EASE }}
            >
              Not sure what to build?{' '}
              <a
                href="/dashboard/inspiration"
                className={promptPageStyles.inspirationLink}
              >
                Explore inspiration
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={promptPageStyles.inspirationIcon} aria-hidden="true">
                  <path d="M2.5 6h7M6.5 2.5L10 6 6.5 9.5" />
                </svg>
              </a>
            </motion.p>
          </div>
        </main>
      </div>
    </div>
  )
}

function PromptHeader({ user, onMenuToggle }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <header className={promptPageStyles.header}>
      <div className={promptPageStyles.headerInner}>
        <div className={promptPageStyles.headerLeft}>
          <motion.button
            type="button"
            className={promptPageStyles.menuButton}
            aria-label="Open navigation"
            onClick={onMenuToggle}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={promptPageStyles.icon} aria-hidden="true">
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          </motion.button>

          <div className={promptPageStyles.headerText}>
            <p className={promptPageStyles.headerTitle}>Prompt Builder</p>
            <p className={promptPageStyles.headerSubtitle}>Start with a clear brief.</p>
          </div>
        </div>

        <div className={promptPageStyles.headerActions}>
          <a
            href="/dashboard/pricing"
            className={promptPageStyles.pricingLink}
          >
            Pricing
          </a>
          <span className={promptPageStyles.planPill}>
            Free Plan
          </span>
          <motion.button
            type="button"
            className={promptPageStyles.notificationButton}
            aria-label="Notifications"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={promptPageStyles.icon} aria-hidden="true">
              <path d="M5.5 7.5a3.5 3.5 0 1 1 7 0c0 4 1.5 4.5 1.5 4.5H4s1.5-.5 1.5-4.5Z" />
              <path d="M7.8 14a1.4 1.4 0 0 0 2.4 0" />
            </svg>
          </motion.button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}

function PromptSidebar({ isOpen, recentProjects, onClose, onNewProject }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      <div
        className={`${promptPageStyles.mobileOverlay} ${
          isOpen ? promptPageStyles.mobileOverlayOpen : promptPageStyles.mobileOverlayClosed
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={`${promptPageStyles.sidebarBase} ${
          isOpen ? promptPageStyles.sidebarOpen : promptPageStyles.sidebarClosed
        }`}
        aria-label="Prompt Builder navigation"
      >
        <div className={promptPageStyles.sidebarTop}>
          <a
            href="/dashboard"
            className={promptPageStyles.brand}
          >
            <span className={promptPageStyles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none" className={promptPageStyles.brandIcon}>
                <rect x="4" y="10" width="22" height="22" rx="7" fill="currentColor" />
                <rect x="20" y="2" width="14" height="14" rx="5" fill="currentColor" />
              </svg>
            </span>
            <span className={promptPageStyles.brandText}>DevPilot AI</span>
          </a>

          <button
            type="button"
            className={promptPageStyles.closeButton}
            aria-label="Close navigation"
            onClick={onClose}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={promptPageStyles.icon} aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <motion.button
          type="button"
          className={promptPageStyles.newProjectButton}
          onClick={onNewProject}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={promptPageStyles.icon} aria-hidden="true">
            <path d="M8 3v10M3 8h10" />
          </svg>
          New Project
        </motion.button>

        <nav className={promptPageStyles.nav} aria-label="Sidebar">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === 'prompt'
            return (
              <motion.a
                key={item.id}
                href={item.href}
                className={`${promptPageStyles.navItemBase} ${
                  isActive
                    ? promptPageStyles.navItemActive
                    : promptPageStyles.navItemDefault
                }`}
                whileHover={!isActive && !shouldReduceMotion ? { x: 2 } : undefined}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <PromptIcon name={item.icon} />
                <span className="truncate">{item.label}</span>
              </motion.a>
            )
          })}
        </nav>

        <div className={promptPageStyles.sidebarProjects}>
          <p className={promptPageStyles.sidebarSectionLabel}>Recent Projects</p>
          {recentProjects.length > 0 ? (
            <div className={promptPageStyles.recentGrid}>
              {recentProjects.map((project) => (
                <a
                  key={project.id}
                  href={project.href || '#'}
                  className={promptPageStyles.recentProject}
                >
                  <span className={promptPageStyles.recentName}>{project.name}</span>
                  <span className={promptPageStyles.recentMeta}>
                    {[project.status, formatRelative(project.updatedAt)].filter(Boolean).join(' ')}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className={promptPageStyles.sidebarEmpty}>
              <span className={promptPageStyles.sidebarEmptyIcon} aria-hidden="true">
                <PromptIcon name="projects" />
              </span>
              <p className={promptPageStyles.sidebarEmptyTitle}>No recent projects yet</p>
              <p className={promptPageStyles.sidebarEmptyText}>Your generated websites will appear here.</p>
            </div>
          )}
        </div>

        <div className={promptPageStyles.sidebarPlan}>
          <div>
            <p className={promptPageStyles.sidebarPlanTitle}>Free Plan</p>
            <p className={promptPageStyles.sidebarPlanText}>Starter workspace</p>
          </div>
          <a
            href="/dashboard/pricing"
            className={promptPageStyles.upgradeLink}
          >
            Upgrade
          </a>
        </div>
      </aside>
    </>
  )
}

function SelectControl({ label, value, options, onChange, disabled }) {
  return (
    <label className={promptPageStyles.selectLabel}>
      <span className="sr-only">{label}</span>
      <select
        className={promptPageStyles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={promptPageStyles.selectIcon} aria-hidden="true">
        <path d="M3 4.5l3 3 3-3" />
      </svg>
    </label>
  )
}

function GenerateButton({ isFilled, isSubmitting, shouldReduceMotion }) {
  return (
    <motion.button
      type="submit"
      className={promptPageStyles.generateButton}
      disabled={!isFilled || isSubmitting}
      whileHover={isFilled && !isSubmitting && !shouldReduceMotion ? { y: -1 } : undefined}
      whileTap={isFilled && !isSubmitting && !shouldReduceMotion ? { scale: 0.98 } : undefined}
      transition={buttonMotion}
    >
      {isSubmitting ? (
        <>
          <span className={promptPageStyles.pulseDot} aria-hidden="true" />
          Generating...
        </>
      ) : (
        <>
          Generate
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={promptPageStyles.generateIcon} aria-hidden="true">
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </>
      )}
    </motion.button>
  )
}

function PromptSuggestions({ suggestions, onSelect, disabled, shouldReduceMotion }) {
  return (
    <motion.div
      className={promptPageStyles.suggestions}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.34, delay: shouldReduceMotion ? 0 : 0.12, ease: EASE }}
    >
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion.label}
          type="button"
          className={promptPageStyles.suggestionButton}
          onClick={() => onSelect(suggestion.prompt)}
          disabled={disabled}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.28, delay: shouldReduceMotion ? 0 : 0.14 + index * 0.025, ease: EASE }}
          whileHover={!disabled && !shouldReduceMotion ? { y: -1 } : undefined}
          whileTap={!disabled && !shouldReduceMotion ? { scale: 0.97 } : undefined}
        >
          {suggestion.label}
        </motion.button>
      ))}
    </motion.div>
  )
}

function FeatureStrip({ shouldReduceMotion }) {
  return (
    <motion.section
      className={promptPageStyles.featureStrip}
      aria-label="Prompt Builder features"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.16, ease: EASE }}
    >
      {FEATURES.map((feature) => (
        <div key={feature.title} className={promptPageStyles.featureCard}>
          <span className={promptPageStyles.featureIconWrap} aria-hidden="true">
            <PromptIcon name={feature.icon} />
          </span>
          <h2 className={promptPageStyles.featureTitle}>{feature.title}</h2>
          <p className={promptPageStyles.featureText}>{feature.description}</p>
        </div>
      ))}
    </motion.section>
  )
}

function PromptIcon({ name }) {
  const common = 'h-4 w-4 shrink-0'

  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
        <rect x="3" y="3" width="5.5" height="5.5" rx="1.5" />
        <rect x="11.5" y="3" width="5.5" height="5.5" rx="1.5" />
        <rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5" />
        <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.5" />
      </svg>
    )
  }

  if (name === 'projects') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
        <path d="M3 5.5h5l1.4 2H17v7.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 14.7V5.5Z" />
        <path d="M3 7.5h14" />
      </svg>
    )
  }

  if (name === 'prompt') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M4 4.5h12v8H8l-4 3v-11Z" />
        <path d="M7 8h6M7 10.5h4" />
      </svg>
    )
  }

  if (name === 'inspiration' || name === 'spark') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M10 2.8l1.4 4 4 .2-3.1 2.5 1.1 4-3.4-2.3-3.4 2.3 1.1-4L4.6 7l4-.2L10 2.8Z" />
        <path d="M5 16.5h10" />
      </svg>
    )
  }

  if (name === 'pricing') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
        <path d="M4 5.5h12M5.5 9h9M7 12.5h6" />
        <rect x="3" y="3" width="14" height="14" rx="3" />
      </svg>
    )
  }

  if (name === 'settings') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
        <circle cx="10" cy="10" r="2.4" />
        <path d="M10 3v2M10 15v2M4.1 6.6l1.7 1M14.2 12.4l1.7 1M4.1 13.4l1.7-1M14.2 7.6l1.7-1" />
      </svg>
    )
  }

  if (name === 'stack') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M10 3l6 3.2-6 3.2-6-3.2L10 3Z" />
        <path d="M4 9.2l6 3.2 6-3.2M4 12.4l6 3.2 6-3.2" />
      </svg>
    )
  }

  if (name === 'preview') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <rect x="3" y="4" width="14" height="10" rx="2" />
        <path d="M8 17h4M10 14v3" />
      </svg>
    )
  }

  if (name === 'export') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M10 3v9M6.5 8.5L10 12l3.5-3.5" />
        <path d="M4 14.5v1A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-1" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
      <circle cx="10" cy="10" r="6" />
    </svg>
  )
}
