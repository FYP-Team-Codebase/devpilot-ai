import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../services/authService'
import { getRecentProjects } from '../../services/projectService'
import UserMenu from '../Dashboard/components/UserMenu'

const SIDEBAR_WIDTH = 'w-[228px]'
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
    <div className="min-h-dvh overflow-x-hidden bg-[#FAFAF8] font-sans text-dp-near-black">
      <PromptSidebar
        isOpen={isSidebarOpen}
        recentProjects={recentProjects}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={handleNewProject}
      />

      <AnimatePresence>
        {isComposerExpanded && (
          <motion.div
            className="fixed inset-0 z-[55] bg-[#FAFAF8]/45 backdrop-blur-[3px]"
            aria-hidden="true"
            onClick={closeComposer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-dvh min-w-0 flex-col md:ml-[228px]">
        <PromptHeader user={user} onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="min-h-[calc(100dvh-60px)] px-6 py-8 max-lg:px-5 max-md:px-4 max-sm:px-3.5">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
            <motion.div
              className="w-full text-center"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: EASE }}
            >
              <h1 className="m-0 text-[clamp(2.1rem,4.2vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.045em] text-dp-black">
                What would you like to build today?
              </h1>
              <p className="mx-auto mt-3 max-w-[680px] text-[15.5px] leading-7 text-dp-text">
                Describe your idea and DevPilot AI will generate a complete, production-ready website.
              </p>
            </motion.div>

            <motion.form
              className={`relative z-[60] mt-8 w-full overflow-hidden rounded-xl border bg-white text-left transition-[border-color] duration-200 ${
                isComposerExpanded || isFocused ? 'border-neutral-500' : 'border-dp-border'
              }`}
              onSubmit={handleSubmit}
              aria-label="Describe what you want to build"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: isComposerExpanded && !shouldReduceMotion ? -2 : 0,
                height: isComposerExpanded ? 'auto' : 68,
                boxShadow: isComposerExpanded ? '0 20px 60px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.02)',
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence initial={false} mode="wait">
                {!isComposerExpanded ? (
                  <motion.button
                    key="collapsed"
                    type="button"
                    className="flex h-[68px] w-full cursor-pointer items-center gap-3 border-0 bg-white px-5 text-left text-dp-black outline-none transition-colors duration-200 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset max-sm:px-4"
                    onClick={openComposer}
                    onFocus={openComposer}
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dp-border bg-[#FAFAF8] text-dp-black" aria-hidden="true">
                      <PromptIcon name="spark" />
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[15px] font-medium ${value.trim() ? 'text-dp-black' : 'text-dp-muted'}`}>
                      {promptPreview}
                    </span>
                    <motion.span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-dp-border bg-white text-dp-muted"
                      aria-hidden="true"
                      animate={{ rotate: 0 }}
                      transition={buttonMotion}
                    >
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
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
                    <div className="relative px-5 pb-8 pt-5 max-sm:px-4">
                      <button
                        type="button"
                        className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-dp-border bg-white text-dp-muted transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
                          className="h-3 w-3"
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
                        className="min-h-[170px] w-full resize-none border-0 bg-transparent p-0 pr-10 font-sans text-base font-medium leading-7 text-dp-black outline-none placeholder:text-dp-muted disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[150px]"
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
                      <span id="prompt-count" className="absolute bottom-3 right-5 text-[12px] font-medium text-dp-muted max-sm:right-4">
                        {value.length}/{MAX_PROMPT_LENGTH}
                      </span>
                    </div>

                    <motion.div
                      className="flex items-center justify-between gap-3 border-t border-dp-border bg-[#FCFCFB] px-4 py-3 max-md:flex-wrap"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : 0.08, ease: 'easeOut' }}
                    >
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
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
              className="mt-7 text-center text-[14px] leading-6 text-dp-muted"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.32, delay: shouldReduceMotion ? 0 : 0.18, ease: EASE }}
            >
              Not sure what to build?{' '}
              <a
                href="/dashboard/inspiration"
                className="group inline-flex items-center gap-1 font-semibold text-dp-black underline decoration-dp-border underline-offset-4 transition-colors duration-200 hover:text-dp-black hover:decoration-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
              >
                Explore inspiration
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
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
    <header className="sticky top-0 z-30 border-b border-dp-border bg-[#FAFAF8]/95 backdrop-blur-xl">
      <div className="flex min-h-[60px] items-center justify-between gap-4 px-6 max-md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <motion.button
            type="button"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] md:hidden"
            aria-label="Open navigation"
            onClick={onMenuToggle}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          </motion.button>

          <div className="min-w-0">
            <p className="m-0 text-[15px] font-semibold tracking-[-0.02em] text-dp-black">Prompt Builder</p>
            <p className="m-0 mt-0.5 truncate text-[12.5px] leading-5 text-dp-muted">Start with a clear brief.</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2.5">
          <a
            href="/dashboard/pricing"
            className="hidden h-8 shrink-0 cursor-pointer items-center rounded-full border border-dp-border bg-white px-3 text-[12px] font-semibold text-dp-black no-underline transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] sm:inline-flex"
          >
            Pricing
          </a>
          <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-dp-border bg-white px-3 text-[12px] font-semibold text-dp-black">
            Free Plan
          </span>
          <motion.button
            type="button"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-text transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
            aria-label="Notifications"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
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
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen ${SIDEBAR_WIDTH} flex-col overflow-hidden border-r border-dp-border bg-white px-3 py-4 transition-transform duration-200 md:top-0 md:z-40 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Prompt Builder navigation"
      >
        <div className="flex h-9 items-center justify-between px-2">
          <a
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg text-dp-black no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-dp-black text-white" aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none" className="h-4.5 w-4.5">
                <rect x="4" y="10" width="22" height="22" rx="7" fill="currentColor" />
                <rect x="20" y="2" width="14" height="14" rx="5" fill="currentColor" />
              </svg>
            </span>
            <span className="text-[14px] font-semibold tracking-[-0.02em]">DevPilot AI</span>
          </a>

          <button
            type="button"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-dp-muted transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <motion.button
          type="button"
          className="mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dp-black bg-dp-black px-4 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          onClick={onNewProject}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
            <path d="M8 3v10M3 8h10" />
          </svg>
          New Project
        </motion.button>

        <nav className="mt-5 flex flex-col gap-1" aria-label="Sidebar">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === 'prompt'
            return (
              <motion.a
                key={item.id}
                href={item.href}
                className={`flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isActive
                    ? 'bg-dp-black text-white'
                    : 'text-dp-text hover:bg-dp-surface hover:text-dp-black'
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

        <div className="mt-6 min-h-0 flex-1">
          <p className="mb-2 px-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-dp-muted">Recent Projects</p>
          {recentProjects.length > 0 ? (
            <div className="grid gap-1.5">
              {recentProjects.map((project) => (
                <a
                  key={project.id}
                  href={project.href || '#'}
                  className="block rounded-lg px-3 py-2 text-dp-black no-underline transition-colors duration-150 hover:bg-dp-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <span className="block truncate text-[12.5px] font-semibold">{project.name}</span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-dp-muted">
                    {[project.status, formatRelative(project.updatedAt)].filter(Boolean).join(' ')}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dp-border bg-[#FAFAF8] px-3 py-4 text-center">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-lg border border-dp-border bg-white text-dp-black" aria-hidden="true">
                <PromptIcon name="projects" />
              </span>
              <p className="m-0 mt-3 text-[12.5px] font-semibold text-dp-black">No recent projects yet</p>
              <p className="m-0 mt-1 text-[11.5px] leading-5 text-dp-muted">Your generated websites will appear here.</p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-dp-border bg-[#FAFAF8] p-3">
          <div>
            <p className="m-0 text-[13px] font-semibold text-dp-black">Free Plan</p>
            <p className="m-0 mt-0.5 text-[11.5px] leading-5 text-dp-muted">Starter workspace</p>
          </div>
          <a
            href="/dashboard/pricing"
            className="mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-xl border border-dp-black bg-dp-black px-3 text-[12.5px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
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
    <label className="relative inline-flex h-10 min-w-[150px] cursor-pointer items-center rounded-xl border border-neutral-200 bg-white text-sm font-medium text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus-within:border-dp-black focus-within:ring-2 focus-within:ring-dp-black focus-within:ring-offset-2 focus-within:ring-offset-[#FCFCFB] has-disabled:cursor-not-allowed has-disabled:opacity-60 max-sm:min-w-full">
      <span className="sr-only">{label}</span>
      <select
        className="h-full w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent px-3 pr-8 text-dp-black outline-none disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 h-3 w-3 text-dp-muted" aria-hidden="true">
        <path d="M3 4.5l3 3 3-3" />
      </svg>
    </label>
  )
}

function GenerateButton({ isFilled, isSubmitting, shouldReduceMotion }) {
  return (
    <motion.button
      type="submit"
      className="group inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFCFB] disabled:cursor-not-allowed disabled:opacity-40 max-md:ml-auto max-sm:w-full"
      disabled={!isFilled || isSubmitting}
      whileHover={isFilled && !isSubmitting && !shouldReduceMotion ? { y: -1 } : undefined}
      whileTap={isFilled && !isSubmitting && !shouldReduceMotion ? { scale: 0.98 } : undefined}
      transition={buttonMotion}
    >
      {isSubmitting ? (
        <>
          <span className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse" aria-hidden="true" />
          Generating...
        </>
      ) : (
        <>
          Generate
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
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
      className="mt-5 flex w-full flex-wrap justify-center gap-2"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.34, delay: shouldReduceMotion ? 0 : 0.12, ease: EASE }}
    >
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion.label}
          type="button"
          className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-dp-black transition-colors duration-200 hover:border-dp-black hover:bg-dp-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-50"
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
      className="mt-8 grid w-full grid-cols-4 gap-px overflow-hidden rounded-xl border border-dp-border bg-dp-border max-lg:grid-cols-2 max-sm:grid-cols-1"
      aria-label="Prompt Builder features"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.16, ease: EASE }}
    >
      {FEATURES.map((feature) => (
        <div key={feature.title} className="bg-white p-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-dp-border bg-[#FAFAF8] text-dp-black" aria-hidden="true">
            <PromptIcon name={feature.icon} />
          </span>
          <h2 className="m-0 mt-3 text-[13.5px] font-bold tracking-[-0.02em] text-dp-black">{feature.title}</h2>
          <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">{feature.description}</p>
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
