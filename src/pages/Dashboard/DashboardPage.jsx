import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link, NavLink, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import DashboardHeader from './components/DashboardHeader'
import PromptComposer from './components/PromptComposer'
import ProjectGrid from './components/ProjectGrid'
import ActivityFeed from './components/ActivityFeed'
import { logout } from '../../services/authService'
import AssetUploader from '../../components/AssetUploader'
import { deleteAsset, formatAssetSize, listAssets } from '../../services/assetService'
import { dashboardPageStyles } from './DashboardPage.styles'
import { setCurrentUser, useCurrentUser } from '../../services/authService'
import { cancelDemoSubscription, refreshDemoSubscription } from '../../services/subscriptionService'
import { getCurrentPlanId, hasActiveProSubscription } from '../../utils/subscription'

const InspirationGallery = lazy(() => import('./components/InspirationGallery'))

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
    <div className={dashboardPageStyles.page}>
      <div className={dashboardPageStyles.appFrame}>
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <div className={dashboardPageStyles.shell}>
          <DashboardHeader
            user={displayUser}
            onMenuToggle={() => setIsSidebarOpen(true)}
            onSearch={setSearchQuery}
          />

          <main className={dashboardPageStyles.main}>
            <div className={dashboardPageStyles.mainInner}>
              {content || <Outlet context={{ searchQuery, user: displayUser }} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export function DashboardHome() {
  const { searchQuery, user } = useOutletContext()

  return (
    <>
      <PromptComposer user={user} />

      <div className={dashboardPageStyles.homeGrid}>
        <div className={dashboardPageStyles.homeMain}>
          <ProjectGrid searchQuery={searchQuery} />
          <UpgradeBanner user={user} />
        </div>

        <aside className={dashboardPageStyles.homeAside}>
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
  const [assets, setAssets] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const shouldReduceMotion = useReducedMotion()
  const filters = ['All', 'Images', 'Logos', 'Other']

  async function refreshAssets() {
    setLoadState('loading')
    try { setAssets(await listAssets()); setLoadState('success'); setLoadError('') }
    catch (error) { setLoadError(error.message || 'Could not load assets.'); setLoadState('error') }
  }

  useEffect(() => {
    let isMounted = true
    listAssets().then((items) => {
      if (!isMounted) return
      setAssets(items)
      setLoadState('success')
    }).catch((error) => {
      if (!isMounted) return
      setLoadError(error.message || 'Could not load assets.')
      setLoadState('error')
    })
    return () => { isMounted = false }
  }, [])
  const filteredAssets = assets.filter((asset) => activeFilter === 'all'
    || (activeFilter === 'images' && asset.resourceType === 'image')
    || (activeFilter === 'logos' && /logo/i.test(asset.originalFilename))
    || (activeFilter === 'other' && asset.resourceType !== 'image'))

  async function handleDelete(asset) {
    if (!window.confirm(`Delete ${asset.originalFilename}?`)) return
    setDeleteError('')
    try { await deleteAsset(asset.id); await refreshAssets() }
    catch (error) { setDeleteError(error.message || 'Could not delete asset.') }
  }

  return (
    <>
      <div className={dashboardPageStyles.toolbar}>
        <PageHeading title="My Assets" description="Manage reusable images, logos, and files for your projects." />
        <motion.button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className={dashboardPageStyles.primaryButton}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          <DashboardIcon name="plus" />
          Upload Asset
        </motion.button>
      </div>

      <div className={dashboardPageStyles.filterBar} aria-label="Filter assets by category">
        {filters.map((filter) => {
          const key = filter.toLowerCase()
          const isActive = activeFilter === key
          return (
            <motion.button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`${dashboardPageStyles.filterButtonBase} ${
                isActive
                  ? dashboardPageStyles.filterButtonActive
                  : dashboardPageStyles.filterButtonDefault
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

      {loadState === 'loading' && <p role="status" className="py-8 text-sm text-dp-muted">Loading assets…</p>}
      {loadState === 'error' && <p role="alert" className="py-8 text-sm text-red-600">{loadError}</p>}
      {deleteError && <p role="alert" className="py-3 text-sm text-red-600">{deleteError}</p>}
      {loadState === 'success' && assets.length === 0 && <section className={dashboardPageStyles.emptyPanel}>
        <span className={dashboardPageStyles.emptyIcon} aria-hidden="true">
          <DashboardIcon name="assets" />
        </span>
        <h2 className={dashboardPageStyles.emptyTitle}>No assets yet</h2>
        <p className={dashboardPageStyles.emptyText}>
          Upload images, logos, and other reusable files for your projects.
        </p>
        <motion.button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className={dashboardPageStyles.primaryButtonWhiteOffset}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={buttonMotion}
        >
          <DashboardIcon name="plus" />
          Upload Asset
        </motion.button>
      </section>}

      {loadState === 'success' && filteredAssets.length > 0 && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredAssets.map((asset) => <article key={asset.id} className="overflow-hidden rounded-xl border border-dp-line bg-white">
          {asset.resourceType === 'image' ? <img src={asset.secureUrl} alt={asset.originalFilename} className="h-40 w-full object-cover" loading="lazy" /> : <div className="flex h-40 items-center justify-center bg-dp-surface text-3xl font-semibold text-dp-muted">PDF</div>}
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{asset.originalFilename}</p><p className="mt-1 text-xs text-dp-muted">{asset.format.toUpperCase()} · {formatAssetSize(asset.size)}{asset.status === 'delete_pending' ? ' · Cleanup pending' : ''}</p></div>
            <button type="button" onClick={() => handleDelete(asset)} className="text-sm text-red-600 underline">Delete</button>
          </div>
        </article>)}
      </section>}

      <AnimatePresence>
        {isUploadOpen && (
          <AssetUploadModal onClose={() => setIsUploadOpen(false)} onUploaded={() => refreshAssets()} shouldReduceMotion={shouldReduceMotion} />
        )}
      </AnimatePresence>
    </>
  )
}

function AssetUploadModal({ onClose, onUploaded, shouldReduceMotion }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      className={dashboardPageStyles.modalOverlay}
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
        className={dashboardPageStyles.modalPanel}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={dashboardPageStyles.modalHeader}>
          <div>
            <h2 id="asset-upload-title" className={dashboardPageStyles.modalTitle}>Upload Asset</h2>
            <p className={dashboardPageStyles.modalCopy}>Upload reusable images and PDFs to your private asset library.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={dashboardPageStyles.modalClose}
            aria-label="Close upload dialog"
          >
            <DashboardIcon name="x" />
          </button>
        </div>
        <div className="p-5"><AssetUploader category="general" onUploaded={onUploaded} /></div>
      </motion.section>
    </motion.div>
  )
}

export function StandaloneInspirationPage() {
  return (
    <Suspense fallback={<DashboardRouteLoader />}>
      <InspirationGallery mode="standalone" />
    </Suspense>
  )
}

export function GenerationInspirationPage() {
  return (
    <Suspense fallback={<DashboardRouteLoader />}>
      <InspirationGallery mode="generation" />
    </Suspense>
  )
}

function DashboardRouteLoader() {
  return (
    <div className="sr-only" role="status" aria-live="polite">
      Loading dashboard section...
    </div>
  )
}

export function PricingPage() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const currentPlan = getCurrentPlanId(user)
  const shouldReduceMotion = useReducedMotion()
  const [isTeamNoticeOpen, setIsTeamNoticeOpen] = useState(false)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  return (
    <>
      <section className={dashboardPageStyles.pricingSection} aria-labelledby="pricing-heading">
        <motion.div
          className={dashboardPageStyles.pricingIntro}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.46, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className={dashboardPageStyles.pricingEyebrow}>Pricing</p>
          <h1 id="pricing-heading" className={dashboardPageStyles.pricingHeading}>
            Build more. Pay less.
          </h1>
          <p className={dashboardPageStyles.pricingCopy}>
            Start free, then upgrade when your projects demand more.
          </p>
        </motion.div>

        <div className={dashboardPageStyles.pricingGrid}>
          {DASHBOARD_PLANS.map((plan, index) => (
            <PricingPlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              index={index}
              shouldReduceMotion={shouldReduceMotion}
              onUpgrade={() => navigate('/checkout', { state: { checkoutFrom: '/dashboard/pricing' } })}
              onTeamContact={() => setIsTeamNoticeOpen(true)}
            />
          ))}
        </div>

        <div className={dashboardPageStyles.pricingFooter}>
          <motion.button
            type="button"
            onClick={() => setIsComparisonOpen((value) => !value)}
            className={dashboardPageStyles.compareButton}
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

        <p className={dashboardPageStyles.pricingNote}>
          Pro checkout is a simulated university demo. No payment is processed.
        </p>
        <ManageSubscriptionSection />
      </section>

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
      className={`${dashboardPageStyles.planCardBase} ${
        plan.featured
          ? dashboardPageStyles.planCardFeatured
          : dashboardPageStyles.planCardDefault
      }`}
      initial={shouldReduceMotion ? false : entrance}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion ? undefined : hover}
      transition={{ duration: shouldReduceMotion ? 0 : isPro ? 0.45 : 0.38, delay: shouldReduceMotion ? 0 : 0.05 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {isPro && (
        <motion.span
          className={dashboardPageStyles.popularBadge}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.28, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Most Popular
        </motion.span>
      )}

      <div className={`${dashboardPageStyles.planHeaderBase} ${isPro ? dashboardPageStyles.planHeaderFeatured : ''}`}>
        <div className="min-w-0">
          <h2 className={dashboardPageStyles.planName}>
            {plan.name}
          </h2>
        </div>

        {isCurrent && !isPro && <CurrentPlanPill />}
      </div>

      <p className={`${dashboardPageStyles.planDescriptionBase} ${isPro ? dashboardPageStyles.planDescriptionFeatured : dashboardPageStyles.planDescriptionDefault}`}>
        {plan.description}
      </p>

      <div className={isPro ? dashboardPageStyles.planPriceWrapPro : dashboardPageStyles.planPriceWrapDefault}>
        <div className="flex items-end gap-2">
          <span className={isPro ? dashboardPageStyles.planPricePro : dashboardPageStyles.planPriceDefault}>
            {plan.price}
          </span>
          <span className={dashboardPageStyles.planPeriod}>
            {plan.period}
          </span>
        </div>
      </div>

      <PricingFeatureList features={plan.features} shouldReduceMotion={shouldReduceMotion} indexOffset={index} />

      <div className={dashboardPageStyles.planActions}>
        {isCurrent ? (
          <CurrentPlanButton primary={isPro} />
        ) : isIncludedInTeam ? (
          <button
            type="button"
            disabled
            className={dashboardPageStyles.currentButton}
          >
            Included in Team
          </button>
        ) : isPro ? (
          <motion.button
            type="button"
            onClick={onUpgrade}
            className={dashboardPageStyles.darkPlanButton}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            Upgrade to Pro
            <motion.span
              aria-hidden="true"
              className={dashboardPageStyles.planButtonIcon}
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
            className={dashboardPageStyles.lightPlanButton}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            Contact Us
            <motion.span
              aria-hidden="true"
              className={dashboardPageStyles.planButtonIcon}
              whileHover={shouldReduceMotion ? undefined : { x: 2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              -&gt;
            </motion.span>
          </motion.button>
        ) : (
          <Link
            to="/prompt"
            className={dashboardPageStyles.contactButton}
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
    <span className={dashboardPageStyles.currentPill}>
      Current plan
    </span>
  )
}

function CurrentPlanButton({ primary }) {
  return (
    <button
      type="button"
      disabled
      className={`${dashboardPageStyles.currentPlanButtonBase} ${
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
    <ul className={dashboardPageStyles.featureList}>
      {features.map((feature, featureIndex) => (
        <motion.li
          key={feature}
          className={dashboardPageStyles.featureItem}
          initial={shouldReduceMotion ? false : { opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24, delay: shouldReduceMotion ? 0 : 0.14 + indexOffset * 0.04 + featureIndex * 0.035, ease: 'easeOut' }}
        >
          <span className={dashboardPageStyles.featureCheck} aria-hidden="true">
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
      className={dashboardPageStyles.comparison}
      aria-labelledby="compare-plans-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, height: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={dashboardPageStyles.comparisonHeader}>
        <h2 id="compare-plans-heading" className={dashboardPageStyles.comparisonHeading}>Compare plans</h2>
      </div>

      <div className={dashboardPageStyles.tableWrap}>
        <table className={dashboardPageStyles.table}>
          <thead>
            <tr className={dashboardPageStyles.tableHeadRow}>
              <th scope="col" className={dashboardPageStyles.tableHeader}>Feature</th>
              <th scope="col" className={dashboardPageStyles.tableHeader}>
                Free {currentPlan === 'free' ? <span className={dashboardPageStyles.tableCurrent}>(current)</span> : null}
              </th>
              <th scope="col" className={dashboardPageStyles.tableHeader}>
                Pro {currentPlan === 'pro' ? <span className={dashboardPageStyles.tableCurrent}>(current)</span> : null}
              </th>
              <th scope="col" className={dashboardPageStyles.tableHeader}>
                Team {currentPlan === 'team' ? <span className={dashboardPageStyles.tableCurrent}>(current)</span> : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON.map(([feature, freeValue, proValue, teamValue]) => (
              <tr key={feature} className={dashboardPageStyles.tableRow}>
                <th scope="row" className={dashboardPageStyles.tableFeature}>{feature}</th>
                <td className={dashboardPageStyles.tableCell}>{freeValue}</td>
                <td className={dashboardPageStyles.tableCell}>{proValue}</td>
                <td className={dashboardPageStyles.tableCell}>{teamValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
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
      className={dashboardPageStyles.modalOverlay}
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
        className={dashboardPageStyles.modalPanelNarrow}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={dashboardPageStyles.modalHeader}>
          <div>
            <h2 id="team-unavailable-title" className={dashboardPageStyles.modalTitle}>Contact Us</h2>
            <p className={dashboardPageStyles.modalCopy}>
              Team contact and provisioning are not connected yet. No workspace changes have been made.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={dashboardPageStyles.modalClose}
            aria-label="Close team dialog"
          >
            <DashboardIcon name="x" />
          </button>
        </div>
        <div className={dashboardPageStyles.modalNoticeCompact}>
          <p className={dashboardPageStyles.modalNoticeTitle}>Team workflow required</p>
          <p className={dashboardPageStyles.modalNoticeText}>
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
      <section className={dashboardPageStyles.profileCard}>
        <div className={dashboardPageStyles.profileHeader}>
          <span className={dashboardPageStyles.profileAvatar}>
            {initials}
          </span>
          <div className={dashboardPageStyles.profileIdentity}>
            <h2 className={dashboardPageStyles.profileName}>{user.name || '-'}</h2>
            <p className={dashboardPageStyles.profileEmail}>{user.email || '-'}</p>
          </div>
        </div>

        <div className={dashboardPageStyles.profileBody}>
          <h3 className={dashboardPageStyles.panelTitle}>Personal Information</h3>
          <DetailRow label="Full Name" value={user.name || '-'} />
          <DetailRow label="Email" value={user.email || '-'} />
          <DetailRow label="Avatar" value={user.avatar ? 'Configured' : initials} />
          <DetailRow label="Account plan" value={`${getCurrentPlanId(user).charAt(0).toUpperCase()}${getCurrentPlanId(user).slice(1)} Plan`} />
          <DetailRow label="User type" value={formatUserType(user.userType)} />
        </div>

        <div className={dashboardPageStyles.unavailable}>
          <p className={dashboardPageStyles.modalNoticeTitle}>Profile editing is not available yet.</p>
          <p className={dashboardPageStyles.modalNoticeText}>
            The current backend exposes account data through authentication, but no profile update endpoint is present.
          </p>
        </div>
      </section>
      <ManageSubscriptionSection />
    </>
  )
}

function ManageSubscriptionSection() {
  const user = useCurrentUser()
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const cancelInFlight = useRef(false)
  const planId = getCurrentPlanId(user)
  const activePro = hasActiveProSubscription(user)
  const subscriptionStatus = user?.subscription?.status

  useEffect(() => {
    let mounted = true
    refreshDemoSubscription()
      .then(() => { if (mounted) setLoadState('ready') })
      .catch((error) => { if (mounted) { setLoadError(error.message || 'Unable to load subscription details.'); setLoadState('error') } })
    return () => { mounted = false }
  }, [])

  async function retryRefresh() {
    setLoadError('')
    setLoadState('loading')
    try {
      await refreshDemoSubscription()
      setLoadState('ready')
    } catch (error) {
      setLoadError(error.message || 'Unable to load subscription details.')
      setLoadState('error')
    }
  }

  async function handleCancel() {
    if (cancelInFlight.current || busy || !hasActiveProSubscription(user)) return
    cancelInFlight.current = true
    setBusy(true)
    setCancelError('')
    setNotice('')
    try {
      const result = await cancelDemoSubscription()
      setCurrentUser({ ...user, subscription: result.subscription })
      setNotice(result.message)
      setConfirmOpen(false)
    } catch (error) {
      setCancelError(error.message || 'Unable to cancel your demo subscription. Please try again.')
    } finally {
      setBusy(false)
      cancelInFlight.current = false
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-[#e5e5e1] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="manage-subscription-title">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777]">Account billing</p>
          <h2 id="manage-subscription-title" className="mt-2 text-xl font-semibold">Manage Subscription</h2>
          {loadState === 'loading' ? <p className="mt-3 text-sm text-[#666]" role="status">Checking your saved subscription…</p> : loadState === 'error' ? <div className="mt-3" role="alert"><p className="text-sm text-red-800">{loadError}</p><button type="button" onClick={retryRefresh} className="mt-2 min-h-9 text-sm font-medium underline underline-offset-4">Retry</button></div> : <div className="mt-3 space-y-1 text-sm" aria-live="polite"><p><span className="font-medium">Current Plan:</span> {`${planId.charAt(0).toUpperCase()}${planId.slice(1)}`}</p><p><span className="font-medium">Subscription status:</span> {activePro ? 'Active' : subscriptionStatus === 'canceled' ? 'Canceled' : 'No active subscription'}</p></div>}
        </div>
        {loadState === 'ready' && activePro && <button type="button" onClick={() => { setCancelError(''); setConfirmOpen(true) }} className="min-h-11 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-800 hover:border-red-400 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800">Cancel Subscription</button>}
      </div>
      {notice && <p className="mt-4 text-sm text-[#555]" role="status">{notice}</p>}
      {confirmOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setConfirmOpen(false) }}>
        <section role="dialog" aria-modal="true" aria-labelledby="cancel-subscription-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <h3 id="cancel-subscription-title" className="text-xl font-semibold">Cancel Pro subscription?</h3>
          <p className="mt-3 text-sm leading-6 text-[#60605c]">This is a simulated subscription. No real money was charged. Confirming cancellation removes Pro access and returns this account to Free.</p>
          {cancelError && <p className="mt-4 text-sm text-red-700" role="alert">{cancelError}</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={busy} onClick={handleCancel} className="min-h-11 rounded-xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Canceling…' : 'Confirm Cancellation'}</button>
            <button type="button" disabled={busy} onClick={() => setConfirmOpen(false)} className="min-h-11 rounded-xl border border-[#d9d9d4] px-4 py-3 text-sm font-medium disabled:opacity-60">Keep Subscription</button>
          </div>
        </section>
      </div>}
    </section>
  )
}

function AccountPanel({ user }) {
  return (
    <section className={dashboardPageStyles.panel}>
      <h3 className={dashboardPageStyles.panelTitle}>Account</h3>
      <DetailRow label="Name" value={user.name || '-'} />
      <DetailRow label="Email" value={user.email || '-'} />
      <DetailRow label="Role" value={user.role || 'user'} />
      <DetailRow label="User type" value={formatUserType(user.userType)} />
    </section>
  )
}

function InfoPanel({ title, rows }) {
  return (
    <section className={dashboardPageStyles.panelLast}>
      <h3 className={dashboardPageStyles.panelTitle}>{title}</h3>
      {rows.map(([label, value]) => (
        <DetailRow key={label} label={label} value={value} />
      ))}
    </section>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className={dashboardPageStyles.detailRow}>
      <span className={dashboardPageStyles.detailLabel}>{label}</span>
      <span className={dashboardPageStyles.detailValue}>{value}</span>
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
        className={`${dashboardPageStyles.sidebarOverlay} ${
          isOpen ? dashboardPageStyles.sidebarOverlayOpen : dashboardPageStyles.sidebarOverlayClosed
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={`${dashboardPageStyles.sidebarBase} ${
          isOpen ? dashboardPageStyles.sidebarOpen : dashboardPageStyles.sidebarClosed
        }`}
        aria-label="Dashboard navigation"
      >
        <div className={dashboardPageStyles.sidebarTop}>
          <Link
            to="/dashboard"
            className={dashboardPageStyles.brand}
            onClick={onClose}
          >
            <span className={dashboardPageStyles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none" className={dashboardPageStyles.brandIcon}>
                <rect x="4" y="10" width="22" height="22" rx="7" fill="currentColor" />
                <rect x="20" y="2" width="14" height="14" rx="5" fill="currentColor" />
              </svg>
            </span>
            <span className={dashboardPageStyles.brandText}>DevPilot AI</span>
          </Link>

          <button
            type="button"
            className={dashboardPageStyles.sidebarClose}
            aria-label="Close navigation"
            onClick={onClose}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <nav className={dashboardPageStyles.sidebarNav} aria-label="Sidebar">
          {NAV_ITEMS.map((item) => {
            return (
              <NavLink
                key={item.id}
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) => `${dashboardPageStyles.sidebarNavItemBase} ${
                  isActive
                    ? dashboardPageStyles.sidebarNavItemActive
                    : dashboardPageStyles.sidebarNavItemDefault
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
          className={dashboardPageStyles.logoutButton}
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
      className={dashboardPageStyles.aiTips}
      aria-labelledby="ai-tip-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={dashboardPageStyles.aiTipsHeader}>
        <motion.span
          className={dashboardPageStyles.aiTipsIcon}
          aria-hidden="true"
          whileHover={shouldReduceMotion ? undefined : { rotate: 6, scale: 1.05 }}
          transition={buttonMotion}
        >
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path d="M9 2.5l.8 3.1L12.5 4l-1.6 2.8 3.1.7-3.1.8 1.6 2.7-2.7-1.6L9 12.5l-.8-3.1L5.5 11l1.6-2.7L4 7.5l3.1-.7L5.5 4l2.7 1.6L9 2.5Z" />
          </svg>
        </motion.span>
        <h2 id="ai-tip-heading" className={dashboardPageStyles.aiTipsTitle}>AI Tip</h2>
      </div>

      <p className={dashboardPageStyles.aiTipsCopy}>{TIPS[tipIndex]}</p>

      <div className={dashboardPageStyles.aiTipsFooter}>
        <div className={dashboardPageStyles.aiTipsDots} aria-hidden="true">
          {TIPS.map((_, index) => (
            <motion.span
              key={index}
              className={dashboardPageStyles.aiTipsDot}
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
          className={dashboardPageStyles.aiTipsButton}
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

function UpgradeBanner({ user }) {
  const features = ['Unlimited AI Generations', 'Faster generation', 'Premium templates', 'Priority support']
  const shouldReduceMotion = useReducedMotion()

  if (hasActiveProSubscription(user)) return null

  return (
    <motion.section
      className={dashboardPageStyles.upgrade}
      aria-labelledby="upgrade-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={dashboardPageStyles.upgradeGrid}>
        <div className={dashboardPageStyles.upgradeContent}>
          <div className={dashboardPageStyles.upgradeHeader}>
            <span className={dashboardPageStyles.upgradeIcon} aria-hidden="true">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                <path d="M9 2.5l1.8 4 4.2.4-3.1 2.8.9 4.1L9 11.7l-3.8 2.1.9-4.1L3 6.9l4.2-.4L9 2.5Z" />
              </svg>
            </span>
            <div>
              <h2 id="upgrade-heading" className={dashboardPageStyles.upgradeTitle}>Upgrade to Pro</h2>
              <p className={dashboardPageStyles.upgradeCopy}>Unlock more capacity for serious builds.</p>
            </div>
          </div>

          <ul className={dashboardPageStyles.upgradeList}>
            {features.map((feature) => (
              <li key={feature} className={dashboardPageStyles.upgradeFeature}>
                <span className={dashboardPageStyles.upgradeFeatureIcon} aria-hidden="true">
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
          to="/checkout"
            state={{ checkoutFrom: '/dashboard' }}
          className={dashboardPageStyles.upgradeLink}
        >
          Upgrade to Pro
        </Link>
      </div>
    </motion.section>
  )
}

function PageHeading({ title, description }) {
  return (
    <div className={dashboardPageStyles.pageHeading}>
      <h1 className={dashboardPageStyles.pageTitle}>{title}</h1>
      <p className={dashboardPageStyles.pageDescription}>{description}</p>
    </div>
  )
}
