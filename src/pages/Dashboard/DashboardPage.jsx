import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link, NavLink, Outlet, useOutletContext } from 'react-router-dom'
import DashboardHeader from './components/DashboardHeader'
import PromptComposer from './components/PromptComposer'
import ProjectGrid from './components/ProjectGrid'
import ActivityFeed from './components/ActivityFeed'
import InspirationGallery from './components/InspirationGallery'
import { logout } from '../../services/authService'

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { id: 'projects', label: 'My Projects', href: '/dashboard/projects', icon: 'projects' },
  { id: 'assets', label: 'My Assets', href: '/dashboard/assets', icon: 'assets' },
  { id: 'inspiration', label: 'Inspiration Gallery', href: '/dashboard/inspiration', icon: 'inspiration' },
  { id: 'pricing', label: 'Pricing', href: '/dashboard/pricing', icon: 'pricing' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

const TIPS = [
  'Use clear sections in your prompt: audience, purpose, tone, and must-have content.',
  'Mention the type of website you want before adding visual direction.',
  'Short prompts work best when they include one specific goal.',
]

const buttonMotion = { duration: 0.2, ease: 'easeOut' }

const DASHBOARD_PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'For exploring DevPilot and turning your first ideas into working projects.',
    price: '$0',
    period: '',
    features: [
      'Prompt Builder',
      'Requirements flow',
      'Inspiration Gallery browsing',
      'Project dashboard',
      'Basic project setup',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For developers and builders who want to create, iterate, and ship faster.',
    price: '$19',
    period: '/ month',
    features: [
      'Everything in Free',
      'Increased AI generation capacity',
      'More project workspace room',
      'Advanced inspiration workflow',
      'Full code export',
      'Priority generation',
    ],
    featured: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams building and managing products together with DevPilot AI.',
    price: '$49',
    period: '/ month',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared projects',
      'Higher generation limits',
      'Team workspace',
      'Shared assets',
    ],
  },
]

const PLAN_COMPARISON = [
  ['Prompt Builder', 'Included', 'Included', 'Included'],
  ['Requirements flow', 'Included', 'Included', 'Included'],
  ['Inspiration Gallery', 'Browse library', 'Advanced workflow use', 'Shared references'],
  ['Projects', 'Starter workspace', 'Expanded workspace', 'Shared projects'],
  ['AI generations', 'Standard access', 'Increased capacity', 'Higher team limits'],
  ['Code export', 'Basic export', 'Full export', 'Full export'],
  ['Support', 'Standard', 'Priority', 'Team support'],
]

export default function DashboardPage({ user, content }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const displayUser = useMemo(() => user || {}, [user])

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('[aria-label="Search projects"]')?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleNavigate() {
    setIsSidebarOpen(false)
  }

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#FAFAF8] text-dp-near-black">
      <div className="flex min-h-dvh">
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col md:ml-[228px]">
          <DashboardHeader
            user={displayUser}
            onMenuToggle={() => setIsSidebarOpen(true)}
            onSearch={setSearchQuery}
          />

          <main className="min-h-[calc(100dvh-60px)]">
            <div className="mx-auto max-w-[1180px] px-6 py-5 max-lg:px-5 max-md:px-4 max-sm:px-3.5">
              {content || <Outlet context={{ searchQuery, user: displayUser }} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export function DashboardHome() {
  const { searchQuery } = useOutletContext()

  return (
    <>
      <PromptComposer />

      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5 max-lg:grid-cols-1">
        <div className="min-w-0">
          <ProjectGrid searchQuery={searchQuery} />
          <UpgradeBanner />
        </div>

        <aside className="grid min-w-0 gap-5">
          <AITipsCard />
          <ActivityFeed />
        </aside>
      </div>
    </>
  )
}

export function ProjectsPage() {
  const { searchQuery } = useOutletContext()

  return (
    <>
      <PageHeading title="My Projects" description="Your generated websites and saved builds." />
      <ProjectGrid searchQuery={searchQuery} />
    </>
  )
}

export function MyAssetsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const filters = ['All', 'Images', 'Logos', 'Other']

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <PageHeading title="My Assets" description="Manage reusable images, logos, and files for your projects." />
        <motion.button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          <DashboardIcon name="plus" />
          Upload Asset
        </motion.button>
      </div>

      <div className="mb-4 flex min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Filter assets by category">
        {filters.map((filter) => {
          const key = filter.toLowerCase()
          const isActive = activeFilter === key
          return (
            <motion.button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] ${
                isActive
                  ? 'border-dp-black bg-dp-black text-white'
                  : 'border-dp-border bg-white text-dp-black hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black'
              }`}
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={buttonMotion}
            >
              {filter}
            </motion.button>
          )
        })}
      </div>

      <section className="rounded-xl border border-dashed border-dp-border bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-dp-border bg-[#FAFAF8] text-dp-black" aria-hidden="true">
          <DashboardIcon name="assets" />
        </span>
        <h2 className="m-0 mt-4 text-[18px] font-bold tracking-[-0.03em] text-dp-black">No assets yet</h2>
        <p className="mx-auto m-0 mt-2 max-w-sm text-[13.5px] leading-6 text-dp-muted">
          Upload images, logos, and other reusable files for your projects.
        </p>
        <motion.button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          <DashboardIcon name="plus" />
          Upload Asset
        </motion.button>
      </section>

      <AnimatePresence>
        {isUploadOpen && (
          <AssetUploadModal onClose={() => setIsUploadOpen(false)} shouldReduceMotion={shouldReduceMotion} />
        )}
      </AnimatePresence>
    </>
  )
}

function AssetUploadModal({ onClose, shouldReduceMotion }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5 max-sm:p-3"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: 'easeOut' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-upload-title"
        className="w-[min(92vw,460px)] rounded-xl border border-dp-border bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="asset-upload-title" className="m-0 text-[20px] font-bold tracking-[-0.04em] text-dp-black">Upload Asset</h2>
            <p className="m-0 mt-2 text-[13.5px] leading-6 text-dp-text">
              Persistent asset storage is not configured yet. This entry point is ready for the upload service when it is available.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-neutral-200 bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Close upload dialog"
          >
            <DashboardIcon name="x" />
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] p-5 text-center">
          <p className="m-0 text-[13px] font-semibold text-dp-black">Upload backend required</p>
          <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">No files will be stored from this screen until asset storage is implemented.</p>
        </div>
      </motion.section>
    </motion.div>
  )
}

export function StandaloneInspirationPage() {
  return <InspirationGallery mode="standalone" />
}

export function GenerationInspirationPage() {
  return <InspirationGallery mode="generation" />
}

export function PricingPage() {
  const { user } = useOutletContext()
  const currentPlan = getCurrentPlanId(user)
  const shouldReduceMotion = useReducedMotion()
  const [isUpgradeNoticeOpen, setIsUpgradeNoticeOpen] = useState(false)
  const [isTeamNoticeOpen, setIsTeamNoticeOpen] = useState(false)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)

  return (
    <>
      <section className="mx-auto max-w-[980px] py-6 max-md:py-4" aria-labelledby="pricing-heading">
        <motion.div
          className="mx-auto max-w-[720px] text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.46, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-dp-muted">Pricing</p>
          <h1 id="pricing-heading" className="m-0 mt-4 text-[54px] font-bold leading-[0.95] tracking-[-0.055em] text-dp-black max-lg:text-[48px] max-sm:text-[38px]">
            Build more. Pay less.
          </h1>
          <p className="mx-auto m-0 mt-5 max-w-[560px] text-[18px] leading-7 text-dp-muted max-sm:text-[16px] max-sm:leading-6">
            Start free, then upgrade when your projects demand more.
          </p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-[1080px] grid-cols-3 items-stretch gap-7 max-xl:gap-5 max-lg:grid-cols-2 max-md:mt-9 max-md:grid-cols-1">
          {DASHBOARD_PLANS.map((plan, index) => (
            <PricingPlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              index={index}
              shouldReduceMotion={shouldReduceMotion}
              onUpgrade={() => setIsUpgradeNoticeOpen(true)}
              onTeamContact={() => setIsTeamNoticeOpen(true)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <motion.button
            type="button"
            onClick={() => setIsComparisonOpen((value) => !value)}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-dp-border bg-white px-4 py-2 text-[13px] font-semibold text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
            aria-expanded={isComparisonOpen}
            aria-controls="pricing-comparison"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            Compare plans
            <motion.span
              aria-hidden="true"
              animate={shouldReduceMotion ? undefined : { rotate: isComparisonOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-[13px] leading-none"
            >
              v
            </motion.span>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {isComparisonOpen && (
            <PlanComparison currentPlan={currentPlan} shouldReduceMotion={shouldReduceMotion} />
          )}
        </AnimatePresence>

        <p className="m-0 mt-4 text-center text-[12.5px] leading-5 text-dp-muted">
          You can upgrade when billing is connected to your DevPilot account.
        </p>
      </section>

      <AnimatePresence>
        {isUpgradeNoticeOpen && (
          <UpgradeUnavailableDialog
            onClose={() => setIsUpgradeNoticeOpen(false)}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTeamNoticeOpen && (
          <TeamUnavailableDialog
            onClose={() => setIsTeamNoticeOpen(false)}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function PricingPlanCard({ plan, currentPlan, index, shouldReduceMotion, onUpgrade, onTeamContact }) {
  const isCurrent = currentPlan === plan.id
  const isPro = plan.id === 'pro'
  const isTeam = plan.id === 'team'
  const isIncludedInTeam = currentPlan === 'team' && isPro
  const entrance = isPro ? { opacity: 0, y: 16, scale: 0.985 } : { opacity: 0, y: 10 }
  const hover = isPro ? { y: -5, scale: 1.005 } : { y: -3 }

  return (
    <motion.article
      className={`relative flex flex-col ${
        plan.featured
          ? 'min-h-[500px] rounded-[22px] border border-neutral-200 bg-white p-7 text-dp-black shadow-[0_24px_70px_rgba(0,0,0,0.10),0_2px_10px_rgba(0,0,0,0.04)] md:-mt-5 max-md:min-h-0 max-md:p-6'
          : 'min-h-[460px] border border-transparent bg-transparent px-4 py-7 text-dp-black max-md:min-h-0 max-md:rounded-[22px] max-md:border-dp-border max-md:bg-white max-md:p-6'
      }`}
      initial={shouldReduceMotion ? false : entrance}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion ? undefined : hover}
      transition={{ duration: shouldReduceMotion ? 0 : isPro ? 0.45 : 0.38, delay: shouldReduceMotion ? 0 : 0.05 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {isPro && (
        <motion.span
          className="absolute right-5 top-5 rounded-full bg-dp-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.28, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Most Popular
        </motion.span>
      )}

      <div className={`flex items-start justify-between gap-3 ${isPro ? 'pr-28 max-sm:pr-0' : ''}`}>
        <div className="min-w-0">
          <h2 className="m-0 text-[15px] font-bold uppercase tracking-[0.08em] text-dp-black">
            {plan.name}
          </h2>
        </div>

        {isCurrent && !isPro && <CurrentPlanPill />}
      </div>

      <p className={`m-0 mt-5 w-full text-[14px] leading-6 text-dp-muted ${isPro ? 'max-w-[300px]' : 'max-w-[320px]'}`}>
        {plan.description}
      </p>

      <div className={isPro ? 'mt-14' : 'mt-12'}>
        <div className="flex items-end gap-2">
          <span className={isPro ? 'text-[58px] font-bold leading-none tracking-[-0.07em] text-dp-black max-sm:text-[48px]' : 'text-[48px] font-bold leading-none tracking-[-0.07em] text-dp-black max-sm:text-[42px]'}>
            {plan.price}
          </span>
          <span className="pb-1.5 text-[14px] font-medium text-dp-muted">
            {plan.period}
          </span>
        </div>
      </div>

      <PricingFeatureList features={plan.features} shouldReduceMotion={shouldReduceMotion} indexOffset={index} />

      <div className="mt-auto pt-10">
        {isCurrent ? (
          <CurrentPlanButton primary={isPro} />
        ) : isIncludedInTeam ? (
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black"
          >
            Included in Team
          </button>
        ) : isPro ? (
          <motion.button
            type="button"
            onClick={onUpgrade}
            className="group inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            Upgrade to Pro
            <motion.span
              aria-hidden="true"
              className="text-[13px] transition-transform duration-200 group-hover:translate-x-0.5"
              whileHover={shouldReduceMotion ? undefined : { x: 2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              -&gt;
            </motion.span>
          </motion.button>
        ) : isTeam ? (
          <motion.button
            type="button"
            onClick={onTeamContact}
            className="group inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            Contact Us
            <motion.span
              aria-hidden="true"
              className="text-[13px] transition-transform duration-200 group-hover:translate-x-0.5"
              whileHover={shouldReduceMotion ? undefined : { x: 2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              -&gt;
            </motion.span>
          </motion.button>
        ) : (
          <Link
            to="/prompt"
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
          >
            Start Building
          </Link>
        )}
      </div>
    </motion.article>
  )
}

function CurrentPlanPill() {
  return (
    <span className="shrink-0 rounded-full border border-dp-border bg-white px-2.5 py-1 text-[11px] font-semibold text-dp-black">
      Current plan
    </span>
  )
}

function CurrentPlanButton({ primary }) {
  return (
    <button
      type="button"
      disabled
      className={`inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium ${
        primary
          ? 'border-dp-black bg-dp-black text-white'
          : 'border-dp-border bg-white text-dp-black'
      }`}
    >
      Current Plan
    </button>
  )
}

function PricingFeatureList({ features, shouldReduceMotion, indexOffset }) {
  return (
    <ul className="m-0 mt-14 grid gap-3.5 p-0 text-[14px] leading-5 text-dp-text">
      {features.map((feature, featureIndex) => (
        <motion.li
          key={feature}
          className="flex items-start gap-2.5"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24, delay: shouldReduceMotion ? 0 : 0.14 + indexOffset * 0.04 + featureIndex * 0.035, ease: 'easeOut' }}
        >
          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-dp-border text-dp-black" aria-hidden="true">
            <PlanCheckIcon />
          </span>
          <span>{feature}</span>
        </motion.li>
      ))}
    </ul>
  )
}

function PlanComparison({ currentPlan, shouldReduceMotion }) {
  return (
    <motion.section
      id="pricing-comparison"
      className="mx-auto mt-5 max-w-[900px] overflow-hidden rounded-2xl border border-dp-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      aria-labelledby="compare-plans-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, height: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="border-b border-dp-border px-5 py-4">
        <h2 id="compare-plans-heading" className="m-0 text-[16px] font-bold tracking-[-0.03em] text-dp-black">Compare plans</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-dp-border text-[11px] uppercase tracking-[0.12em] text-dp-muted">
              <th scope="col" className="px-5 py-3 font-semibold">Feature</th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Free {currentPlan === 'free' ? <span className="normal-case tracking-normal text-dp-black">(current)</span> : null}
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Pro {currentPlan === 'pro' ? <span className="normal-case tracking-normal text-dp-black">(current)</span> : null}
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Team {currentPlan === 'team' ? <span className="normal-case tracking-normal text-dp-black">(current)</span> : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON.map(([feature, freeValue, proValue, teamValue]) => (
              <tr key={feature} className="border-b border-dp-border last:border-b-0">
                <th scope="row" className="px-5 py-3.5 font-semibold text-dp-black">{feature}</th>
                <td className="px-5 py-3.5 text-dp-text">{freeValue}</td>
                <td className="px-5 py-3.5 text-dp-text">{proValue}</td>
                <td className="px-5 py-3.5 text-dp-text">{teamValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  )
}

function UpgradeUnavailableDialog({ onClose, shouldReduceMotion }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5 max-sm:p-3"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: 'easeOut' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-unavailable-title"
        className="w-[min(92vw,440px)] rounded-xl border border-dp-border bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upgrade-unavailable-title" className="m-0 text-[20px] font-bold tracking-[-0.04em] text-dp-black">Upgrade to Pro</h2>
            <p className="m-0 mt-2 text-[13.5px] leading-6 text-dp-text">
              Payment checkout is not connected yet. Your plan has not been changed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-neutral-200 bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Close upgrade dialog"
          >
            <DashboardIcon name="x" />
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] p-4">
          <p className="m-0 text-[13px] font-semibold text-dp-black">Billing backend required</p>
          <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">
            A real checkout or subscription endpoint needs to be added before upgrades can be processed.
          </p>
        </div>
      </motion.section>
    </motion.div>
  )
}

function TeamUnavailableDialog({ onClose, shouldReduceMotion }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5 max-sm:p-3"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: 'easeOut' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-unavailable-title"
        className="w-[min(92vw,440px)] rounded-xl border border-dp-border bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="team-unavailable-title" className="m-0 text-[20px] font-bold tracking-[-0.04em] text-dp-black">Contact Us</h2>
            <p className="m-0 mt-2 text-[13.5px] leading-6 text-dp-text">
              Team contact and provisioning are not connected yet. No workspace changes have been made.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-neutral-200 bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Close team dialog"
          >
            <DashboardIcon name="x" />
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] p-4">
          <p className="m-0 text-[13px] font-semibold text-dp-black">Team workflow required</p>
          <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">
            A real contact, sales, or team billing flow needs to be added before Team requests can be processed.
          </p>
        </div>
      </motion.section>
    </motion.div>
  )
}

function PlanCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
      <path d="M2.5 6.2l2.1 2.1 4.9-5" />
    </svg>
  )
}

function getCurrentPlanId(user) {
  const rawPlan =
    user?.selectedPlan ||
    user?.plan ||
    user?.subscriptionPlan ||
    user?.subscription?.plan ||
    user?.billing?.plan

  if (!rawPlan) return 'free'

  const normalized = String(rawPlan).trim().toLowerCase()
  if (normalized.includes('team')) return 'team'
  return normalized.includes('pro') ? 'pro' : 'free'
}

export function SettingsPage() {
  const { user } = useOutletContext()

  return (
    <>
      <PageHeading title="Settings" description="Manage your DevPilot workspace preferences." />
      <AccountPanel user={user} />
      <InfoPanel
        title="Notifications"
        rows={[
          ['Email updates', 'Account and verification emails only'],
          ['Product notifications', 'Not configured'],
        ]}
      />
      <InfoPanel
        title="Appearance"
        rows={[
          ['Theme', 'DevPilot default'],
          ['Visual system', 'Monochrome'],
        ]}
      />
    </>
  )
}

export function ProfilePage() {
  const { user } = useOutletContext()
  const initials = getInitials(user)

  return (
    <>
      <PageHeading title="Profile" description="Manage your personal account information." />
      <section className="rounded-xl border border-dp-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-4 border-b border-dp-border pb-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-dp-black text-[18px] font-bold tracking-wide text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <h2 className="m-0 truncate text-[20px] font-bold tracking-[-0.04em] text-dp-black">{user.name || '-'}</h2>
            <p className="m-0 mt-1 truncate text-[13.5px] leading-5 text-dp-muted">{user.email || '-'}</p>
          </div>
        </div>

        <div className="pt-5">
          <h3 className="m-0 mb-3.5 text-sm font-bold tracking-tight text-dp-black">Personal Information</h3>
          <DetailRow label="Full Name" value={user.name || '-'} />
          <DetailRow label="Email" value={user.email || '-'} />
          <DetailRow label="Avatar" value={user.avatar ? 'Configured' : initials} />
          <DetailRow label="Account plan" value={user.plan || 'Free Plan'} />
          <DetailRow label="User type" value={formatUserType(user.userType)} />
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] p-4">
          <p className="m-0 text-[13px] font-semibold text-dp-black">Profile editing is not available yet.</p>
          <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">
            The current backend exposes account data through authentication, but no profile update endpoint is present.
          </p>
        </div>
      </section>
    </>
  )
}

function AccountPanel({ user }) {
  return (
    <section className="mb-4 rounded-xl border border-dp-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <h3 className="m-0 mb-3.5 text-sm font-bold tracking-tight text-dp-black">Account</h3>
      <DetailRow label="Name" value={user.name || '-'} />
      <DetailRow label="Email" value={user.email || '-'} />
      <DetailRow label="Role" value={user.role || 'user'} />
      <DetailRow label="User type" value={formatUserType(user.userType)} />
    </section>
  )
}

function InfoPanel({ title, rows }) {
  return (
    <section className="mb-4 rounded-xl border border-dp-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] last:mb-0">
      <h3 className="m-0 mb-3.5 text-sm font-bold tracking-tight text-dp-black">{title}</h3>
      {rows.map(([label, value]) => (
        <DetailRow key={label} label={label} value={value} />
      ))}
    </section>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-dp-border py-2.5 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-dp-muted">{label}</span>
      <span className="min-w-0 text-right text-[13.5px] font-medium text-dp-black">{value}</span>
    </div>
  )
}

function getInitials(user) {
  const source = user?.name?.trim() || user?.email?.trim() || 'D'
  const parts = source.replace(/@.*/, '').split(/\s|\.|_/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'D'
}

function formatUserType(value) {
  if (!value) return '-'
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function DashboardSidebar({ isOpen, onClose, onNavigate, onLogout }) {
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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[228px] flex-col overflow-hidden border-r border-dp-border bg-white px-3 py-4 transition-transform duration-200 md:top-0 md:z-40 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Dashboard navigation"
      >
        <div className="flex h-9 items-center justify-between px-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-lg text-dp-black no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={onClose}
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-dp-black text-white" aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none" className="h-4.5 w-4.5">
                <rect x="4" y="10" width="22" height="22" rx="7" fill="currentColor" />
                <rect x="20" y="2" width="14" height="14" rx="5" fill="currentColor" />
              </svg>
            </span>
            <span className="text-[14px] font-semibold tracking-[-0.02em]">DevPilot AI</span>
          </Link>

          <button
            type="button"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-dp-muted transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-1" aria-label="Sidebar">
          {NAV_ITEMS.map((item) => {
            return (
              <NavLink
                key={item.id}
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) => `flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isActive
                    ? 'bg-dp-black text-white'
                    : 'text-dp-text hover:bg-dp-surface hover:text-dp-black'
                }`}
                onClick={onNavigate}
              >
                <DashboardIcon name={item.icon} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <motion.button
          type="button"
          className="mt-4 flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-3 text-left text-[13px] font-medium text-dp-text transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          onClick={onLogout}
          whileHover={shouldReduceMotion ? undefined : { x: 2 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          <DashboardIcon name="logout" />
          <span>Logout</span>
        </motion.button>
      </aside>
    </>
  )
}

function DashboardIcon({ name }) {
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

  if (name === 'assets') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
        <rect x="3" y="4" width="14" height="12" rx="2" />
        <path d="M6.5 12.5l2-2 1.6 1.6 2.4-3.1 3 3.5" />
        <circle cx="7.2" cy="7.6" r="1" />
      </svg>
    )
  }

  if (name === 'plus') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={common} aria-hidden="true">
        <path d="M8 3.5v9M3.5 8h9" />
      </svg>
    )
  }

  if (name === 'x') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={common} aria-hidden="true">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    )
  }

  if (name === 'inspiration') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
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

  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
      <path d="M8 4H5.8A1.8 1.8 0 0 0 4 5.8v8.4A1.8 1.8 0 0 0 5.8 16H8" />
      <path d="M11.5 6.5L15 10l-3.5 3.5M15 10H8" />
    </svg>
  )
}

function AITipsCard() {
  const [tipIndex, setTipIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      className="flex min-h-[218px] flex-col rounded-xl border border-white/10 bg-[linear-gradient(135deg,#10172B_0%,#171A3B_52%,#27205A_100%)] p-5 text-white shadow-[0_8px_20px_rgba(16,23,43,0.18)]"
      aria-labelledby="ai-tip-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2">
        <motion.span
          className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white"
          aria-hidden="true"
          whileHover={shouldReduceMotion ? undefined : { rotate: 6, scale: 1.05 }}
          transition={buttonMotion}
        >
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path d="M9 2.5l.8 3.1L12.5 4l-1.6 2.8 3.1.7-3.1.8 1.6 2.7-2.7-1.6L9 12.5l-.8-3.1L5.5 11l1.6-2.7L4 7.5l3.1-.7L5.5 4l2.7 1.6L9 2.5Z" />
          </svg>
        </motion.span>
        <h2 id="ai-tip-heading" className="m-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/85">AI Tip</h2>
      </div>

      <p className="mt-5 text-[14px] font-medium leading-6 text-white/88">{TIPS[tipIndex]}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {TIPS.map((_, index) => (
            <motion.span
              key={index}
              className="h-1.5 rounded-full bg-white"
              animate={{
                width: index === tipIndex ? 20 : 6,
                opacity: index === tipIndex ? 1 : 0.35,
              }}
              transition={buttonMotion}
            />
          ))}
        </div>
        <motion.button
          type="button"
          className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors duration-200 hover:border-white/20 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171A3B]"
          onClick={() => setTipIndex((index) => (index + 1) % TIPS.length)}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          Next Tip
        </motion.button>
      </div>
    </motion.section>
  )
}

function UpgradeBanner() {
  const features = ['Unlimited AI Generations', 'Faster generation', 'Premium templates', 'Priority support']
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      className="rounded-xl border border-dp-black bg-dp-black p-5 text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]"
      aria-labelledby="upgrade-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-5 max-md:grid-cols-1">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-white" aria-hidden="true">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                <path d="M9 2.5l1.8 4 4.2.4-3.1 2.8.9 4.1L9 11.7l-3.8 2.1.9-4.1L3 6.9l4.2-.4L9 2.5Z" />
              </svg>
            </span>
            <div>
              <h2 id="upgrade-heading" className="m-0 text-[18px] font-bold leading-tight tracking-[-0.03em] text-white">Upgrade to Pro</h2>
              <p className="m-0 mt-1 text-[13px] leading-5 text-white/65">Unlock more capacity for serious builds.</p>
            </div>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 p-0 text-[13px] text-white/85 max-sm:grid-cols-1">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-white" aria-hidden="true">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="M2.5 6.2l2.1 2.1 4.9-5" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/dashboard/pricing"
          className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:bg-neutral-100 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dp-black max-md:w-fit"
        >
          Upgrade to Pro
        </Link>
      </div>
    </motion.section>
  )
}

function PageHeading({ title, description }) {
  return (
    <div className="mb-5">
      <h1 className="m-0 text-[24px] font-bold leading-tight tracking-[-0.03em] text-dp-black">{title}</h1>
      <p className="mt-1.5 text-sm leading-6 text-dp-text">{description}</p>
    </div>
  )
}
