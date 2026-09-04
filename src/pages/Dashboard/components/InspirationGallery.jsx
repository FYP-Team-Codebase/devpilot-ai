import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EASE = [0.16, 1, 0.3, 1]
const buttonMotion = { duration: 0.2, ease: 'easeOut' }
const MANIFEST_URL = '/inspirations/manifest.json'
const SWIPE_THRESHOLD = 85
const SWIPE_VELOCITY_THRESHOLD = 520
const FULL_PAGE_RATIO_THRESHOLD = 1.9
const DEFAULT_ZOOM = 100
const MIN_ZOOM = 50
const MAX_ZOOM = 200
const ZOOM_STEP = 25
const ALL_CATEGORIES = 'all'

const FLOW_STEPS = ['Prompt', 'Requirements', 'Inspiration', 'Generation']

function getDetailImages(item) {
  const seen = new Set()
  const sectionImages = Array.isArray(item.images) ? item.images : []
  return [
    item.fullPage ? { src: item.fullPage, label: 'Full page screenshot' } : null,
    ...sectionImages,
  ].filter(Boolean).filter((image) => {
    if (seen.has(image.src)) return false
    seen.add(image.src)
    return true
  })
}

function getStoredSelected(availableInspirations) {
  try {
    const stored = sessionStorage.getItem('devpilot-inspirations')
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => availableInspirations.find((inspiration) => inspiration.id === item.id))
      .filter(Boolean)
  } catch {
    return []
  }
}

function isTypingTarget(target) {
  const tagName = target?.tagName?.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable
}

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function categoryKey(category) {
  return String(category || 'Other').trim().toLowerCase() || 'other'
}

function formatInspirationMeta(item) {
  return [item.category, item.style].filter(Boolean).join(' / ') || item.type || 'Website'
}

function pluralizeInspirations(count) {
  return `${count} ${count === 1 ? 'inspiration' : 'inspirations'}`
}

function getGalleryPreviewImage(item) {
  if (!Array.isArray(item.images)) return null
  return item.images.find((image) => image.src === item.galleryPreview) || null
}

function resolvePreviewFit(item, imageSize) {
  const configuredFit = String(item.previewFit || '').toLowerCase()
  if (configuredFit === 'cover' || configuredFit === 'contain') return configuredFit

  if (!imageSize?.width || !imageSize?.height) return 'cover'

  const ratio = imageSize.width / imageSize.height
  if (ratio >= 1.75) return 'contain'
  return 'cover'
}

function resolvePreviewPosition(item, fit) {
  const configuredPosition = String(item.previewPosition || '').toLowerCase()
  if (configuredPosition === 'center') return 'object-center'
  if (configuredPosition === 'top') return 'object-top'
  return fit === 'contain' ? 'object-center' : 'object-top'
}

export default function InspirationGallery({ mode = 'standalone' }) {
  const isGenerationMode = mode === 'generation'
  const [inspirations, setInspirations] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [selectedInspirations, setSelectedInspirations] = useState([])
  const [selectionReady, setSelectionReady] = useState(false)
  const [activeItem, setActiveItem] = useState(null)
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES)
  const [validationError, setValidationError] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const selectedPanelRef = useRef(null)
  const modalTitleRef = useRef(null)
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    let isMounted = true

    async function loadManifest() {
      setLoadState('loading')
      setLoadError('')

      try {
        const response = await fetch(MANIFEST_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Manifest request failed with ${response.status}`)
        const manifest = await response.json()
        const nextInspirations = Array.isArray(manifest) ? manifest : manifest.inspirations

        if (!Array.isArray(nextInspirations)) {
          throw new Error('Manifest does not contain an inspirations array')
        }

        if (!isMounted) return
        setInspirations(nextInspirations)
        setLoadState('success')
        setSelectedInspirations(isGenerationMode ? getStoredSelected(nextInspirations) : [])
        setSelectionReady(true)
      } catch (error) {
        if (!isMounted) return
        console.error('[inspirations] Failed to load manifest', error)
        setLoadError("Inspirations couldn't be loaded.")
        setLoadState('error')
        setSelectionReady(true)
      }
    }

    loadManifest()

    return () => {
      isMounted = false
    }
  }, [isGenerationMode])

  useEffect(() => {
    if (!isGenerationMode) return
    if (!selectionReady) return
    sessionStorage.setItem('devpilot-inspirations', JSON.stringify(selectedInspirations))
  }, [isGenerationMode, selectedInspirations, selectionReady])

  useEffect(() => {
    if (!activeItem) return undefined
    modalTitleRef.current?.focus()
  }, [activeItem])

  const isSelected = useCallback(
    (id) => selectedInspirations.some((item) => item.id === id),
    [selectedInspirations],
  )

  const categoryOptions = useMemo(() => {
    const categories = new Map()

    inspirations.forEach((item) => {
      const label = item.category || 'Other'
      const key = categoryKey(label)
      if (!categories.has(key)) categories.set(key, label)
    })

    return [
      { key: ALL_CATEGORIES, label: 'All' },
      ...Array.from(categories, ([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label)),
    ]
  }, [inspirations])

  const filteredInspirations = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) return inspirations
    return inspirations.filter((item) => categoryKey(item.category) === activeCategory)
  }, [activeCategory, inspirations])

  const activeCategoryLabel = categoryOptions.find((option) => option.key === activeCategory)?.label || 'All'
  const resultCount = activeCategory === ALL_CATEGORIES
    ? pluralizeInspirations(inspirations.length)
    : `${pluralizeInspirations(filteredInspirations.length)} in ${activeCategoryLabel}`

  const removeSelection = useCallback((id) => {
    setSelectedInspirations((current) => current.filter((item) => item.id !== id))
  }, [])

  const toggleInspiration = useCallback((item) => {
    if (!isGenerationMode) return
    setSelectedInspirations((current) => {
      if (current.some((selected) => selected.id === item.id)) {
        return current.filter((selected) => selected.id !== item.id)
      }

      return [...current, item]
    })
    setValidationError('')
  }, [isGenerationMode])

  function handleBack() {
    if (activeItem) {
      setActiveItem(null)
      return
    }

    navigate('/requirements')
  }

  function handleContinue() {
    if (!selectedInspirations.length) {
      setValidationError('Select at least one inspiration to continue.')
      selectedPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => selectedPanelRef.current?.focus(), 240)
      return
    }

    try {
      const storedRequirements = sessionStorage.getItem('devpilot-requirements')
      const requirements = storedRequirements ? JSON.parse(storedRequirements) : {}
      sessionStorage.setItem('devpilot-requirements', JSON.stringify({
        ...requirements,
        selectedInspirations,
      }))
    } catch {
      sessionStorage.setItem('devpilot-requirements', JSON.stringify({ selectedInspirations }))
    }

    sessionStorage.setItem('devpilot-inspirations', JSON.stringify(selectedInspirations))
    navigate('/#try')
  }

  return (
    <div className="pb-20">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: EASE }}
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="m-0 text-[clamp(2rem,3.4vw,2.5rem)] font-bold leading-tight tracking-[-0.045em] text-dp-black">
            Inspiration Gallery
          </h1>
          <p className="m-0 mt-2 max-w-[620px] text-[15px] leading-6 text-dp-text">
            {isGenerationMode
              ? 'Open a cover to inspect its screens, details, and reusable design direction.'
              : 'Explore design references or add your own inspiration.'}
          </p>
        </div>
        {isGenerationMode ? (
          <ProgressSteps />
        ) : (
          <motion.button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <InspirationIcon name="plus" />
            Add Inspiration
          </motion.button>
        )}
      </motion.div>

      <GalleryOverview
        inspirations={inspirations}
        visibleInspirations={filteredInspirations}
        categoryOptions={categoryOptions}
        activeCategory={activeCategory}
        resultCount={resultCount}
        loadState={loadState}
        loadError={loadError}
        selectedInspirations={selectedInspirations}
        validationError={validationError}
        panelRef={selectedPanelRef}
        showSelectionPanel={isGenerationMode}
        onOpen={setActiveItem}
        onRemove={removeSelection}
        onCategoryChange={setActiveCategory}
        isSelected={isSelected}
        shouldReduceMotion={shouldReduceMotion}
      />

      <AnimatePresence>
        {activeItem && (
          <InspirationDetailModal
            key={activeItem.id}
            item={activeItem}
            titleRef={modalTitleRef}
            isSelected={isSelected(activeItem.id)}
            onClose={() => setActiveItem(null)}
            onToggle={() => toggleInspiration(activeItem)}
            showSelectionAction={isGenerationMode}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddOpen && (
          <AddInspirationModal onClose={() => setIsAddOpen(false)} shouldReduceMotion={shouldReduceMotion} />
        )}
      </AnimatePresence>

      {isGenerationMode && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-dp-border bg-[#FAFAF8]/92 px-6 py-3 backdrop-blur-sm md:left-[228px] max-md:px-4 max-sm:px-3.5">
          <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3">
            <motion.button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={buttonMotion}
            >
              {activeItem ? 'Close' : 'Back'}
            </motion.button>

            <div className="flex min-w-0 flex-col items-end">
              <ValidationError>{validationError}</ValidationError>
              <motion.button
                type="button"
                onClick={handleContinue}
                className="group inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={buttonMotion}
              >
                Continue to Generation
                <InspirationIcon name="arrow-right" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddInspirationModal({ onClose, shouldReduceMotion }) {
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
        aria-labelledby="add-inspiration-title"
        className="w-[min(92vw,480px)] rounded-xl border border-dp-border bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: EASE }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-inspiration-title" className="m-0 text-[20px] font-bold tracking-[-0.04em] text-dp-black">Add Inspiration</h2>
            <p className="m-0 mt-2 text-[13.5px] leading-6 text-dp-text">
              User inspiration uploads are not connected to persistent storage yet. This entry point is ready for image or website reference capture when that API is added.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-neutral-200 bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Close add inspiration dialog"
          >
            <InspirationIcon name="x" />
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] p-5 text-center">
          <p className="m-0 text-[13px] font-semibold text-dp-black">Upload service required</p>
          <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">No inspiration will be saved from this screen until storage is implemented.</p>
        </div>
      </motion.section>
    </motion.div>
  )
}

function GalleryOverview({
  inspirations,
  visibleInspirations,
  categoryOptions,
  activeCategory,
  resultCount,
  loadState,
  loadError,
  selectedInspirations,
  validationError,
  panelRef,
  showSelectionPanel,
  onOpen,
  onRemove,
  onCategoryChange,
  isSelected,
  shouldReduceMotion,
}) {
  return (
    <motion.div
      className={`${showSelectionPanel ? 'grid grid-cols-[minmax(0,1fr)_286px] items-start gap-5 max-lg:grid-cols-1' : 'block'}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: EASE }}
    >
      <section aria-label="Inspiration covers" className="min-w-0">
        {loadState === 'loading' && <GallerySkeleton />}
        {loadState === 'error' && <GalleryMessage title={loadError} body="Check that the inspirations manifest was generated successfully." />}
        {loadState === 'success' && inspirations.length === 0 && (
          <GalleryMessage title="No inspiration assets found." body="Add image folders under public/inspirations to populate the gallery." />
        )}
        {loadState === 'success' && inspirations.length > 0 && (
          <>
            <CategoryFilterBar
              options={categoryOptions}
              activeCategory={activeCategory}
              resultCount={resultCount}
              onChange={onCategoryChange}
              shouldReduceMotion={shouldReduceMotion}
            />

            {visibleInspirations.length ? (
              <motion.div layout className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
                <AnimatePresence>
                  {visibleInspirations.map((item, index) => (
                    <CoverCard
                      key={item.id}
                      item={item}
                      index={index}
                      isSelected={isSelected(item.id)}
                      onOpen={() => onOpen(item)}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <GalleryMessage title="No inspirations found in this category." body="Choose another category or return to All." />
            )}
          </>
        )}
      </section>

      {showSelectionPanel && (
        <aside
          ref={panelRef}
          tabIndex={-1}
          className="sticky top-20 min-w-0 rounded-xl border border-dp-border bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none max-lg:static"
          aria-labelledby="selected-inspirations-heading"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="selected-inspirations-heading" className="m-0 text-[16px] font-bold tracking-[-0.03em] text-dp-black">Selected</h2>
            <span className="shrink-0 text-[12px] font-medium text-dp-muted">{selectedInspirations.length} selected</span>
          </div>
          <ValidationError>{validationError}</ValidationError>

          {selectedInspirations.length ? (
            <motion.div layout className="mt-4 grid gap-3 max-lg:grid-cols-3 max-md:flex max-md:overflow-x-auto max-md:pb-1">
              <AnimatePresence initial={false}>
                {selectedInspirations.map((item) => (
                  <SelectedItem
                    key={item.id}
                    item={item}
                    onRemove={() => onRemove(item.id)}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] p-4">
              <p className="m-0 text-[13px] font-semibold text-dp-black">No inspirations selected yet.</p>
              <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">Open a cover and choose Use this inspiration.</p>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-dp-border bg-[#FAFAF8] p-4">
            <p className="m-0 text-[13px] font-semibold text-dp-black">Current brief</p>
            <RequirementSummary />
          </div>
        </aside>
      )}
    </motion.div>
  )
}

function CategoryFilterBar({ options, activeCategory, resultCount, onChange, shouldReduceMotion }) {
  return (
    <div className="mb-4 flex min-w-0 items-center justify-between gap-3 max-sm:block">
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter inspirations by category">
        {options.map((option) => {
          const isActive = option.key === activeCategory
          return (
            <motion.button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.key)}
              className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] ${
                isActive
                  ? 'border-dp-black bg-dp-black text-white'
                  : 'border-dp-border bg-white text-dp-black hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black'
              }`}
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={buttonMotion}
            >
              {option.label}
            </motion.button>
          )
        })}
      </div>
      <p className="m-0 shrink-0 text-[12.5px] font-medium text-dp-muted max-sm:mt-2">
        {resultCount}
      </p>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1" aria-label="Loading inspirations">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-dp-border bg-white">
          <div className="aspect-[4/3] bg-neutral-100 motion-safe:animate-pulse" />
          <div className="p-3.5">
            <div className="h-4 w-32 rounded bg-neutral-100 motion-safe:animate-pulse" />
            <div className="mt-2 h-3 w-40 rounded bg-neutral-100 motion-safe:animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function GalleryMessage({ title, body }) {
  return (
    <div className="rounded-xl border border-dashed border-dp-border bg-white p-6 text-center">
      <p className="m-0 text-[14px] font-semibold text-dp-black">{title}</p>
      <p className="m-0 mt-2 text-[13px] leading-5 text-dp-muted">{body}</p>
    </div>
  )
}

function CoverCard({ item, index, isSelected, onOpen, shouldReduceMotion }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onOpen}
      className={`group min-w-0 cursor-pointer overflow-hidden rounded-xl border bg-white p-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] ${
        isSelected ? 'border-dp-black' : 'border-dp-border hover:border-neutral-300'
      }`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.26, delay: shouldReduceMotion ? 0 : index * 0.035, ease: EASE }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
      aria-label={`Open ${item.title} inspiration details`}
    >
      <div className="aspect-[4/3] overflow-hidden border-b border-dp-border bg-neutral-100">
        {item.galleryPreview ? (
          <GalleryPreviewImage item={item} loading={index < 3 ? 'eager' : 'lazy'} />
        ) : (
          <MissingPreview title={item.title} folder={item.folder} />
        )}
      </div>
      <div className="grid min-h-[82px] grid-cols-[1fr_auto] items-start gap-3 p-3.5">
        <div className="min-w-0">
          <h2 className="m-0 truncate text-[16px] font-bold leading-tight tracking-[-0.03em] text-dp-black">{item.title}</h2>
          <p className="m-0 mt-1 truncate text-[13px] leading-5 text-dp-muted">{formatInspirationMeta(item)}</p>
        </div>
        {isSelected && (
          <span className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg bg-dp-black px-2.5 text-[12px] font-semibold text-white" aria-label="Selected">
            <InspirationIcon name="check" />
            Selected
          </span>
        )}
      </div>
    </motion.button>
  )
}

function GalleryPreviewImage({ item, loading }) {
  const manifestImage = getGalleryPreviewImage(item)
  const [imageSize, setImageSize] = useState(
    manifestImage?.width && manifestImage?.height
      ? { width: manifestImage.width, height: manifestImage.height }
      : null,
  )
  const fit = resolvePreviewFit(item, imageSize)
  const positionClass = resolvePreviewPosition(item, fit)
  const fitClass = fit === 'contain'
    ? `h-full w-full object-contain ${positionClass}`
    : `h-full w-full object-cover ${positionClass} transition-transform duration-300 ease-out group-hover:scale-[1.015]`

  return (
    <LoadableImage
      src={item.galleryPreview}
      alt={`${item.title} website preview`}
      className={fitClass}
      loading={loading}
      onLoad={(event) => {
        const { naturalWidth, naturalHeight } = event.currentTarget
        if (!naturalWidth || !naturalHeight) return
        setImageSize({ width: naturalWidth, height: naturalHeight })
      }}
    />
  )
}

function InspirationDetailModal({ item, titleRef, isSelected, onClose, onToggle, showSelectionAction, shouldReduceMotion }) {
  const detailImages = getDetailImages(item)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [viewerResetKey, setViewerResetKey] = useState(0)
  const safeActiveIndex = detailImages.length ? Math.min(activeIndex, detailImages.length - 1) : 0
  const activeImage = detailImages[safeActiveIndex]

  const showImage = useCallback((nextIndex, nextDirection) => {
    if (!detailImages.length) return
    setZoom(DEFAULT_ZOOM)
    setViewerResetKey((current) => current + 1)
    setDirection(nextDirection)
    setActiveIndex((nextIndex + detailImages.length) % detailImages.length)
  }, [detailImages.length])

  const showNext = useCallback(() => {
    showImage(safeActiveIndex + 1, 1)
  }, [safeActiveIndex, showImage])

  const showPrevious = useCallback(() => {
    showImage(safeActiveIndex - 1, -1)
  }, [safeActiveIndex, showImage])

  const showThumbnail = useCallback((index) => {
    if (index === safeActiveIndex) return
    showImage(index, index > safeActiveIndex ? 1 : -1)
  }, [safeActiveIndex, showImage])

  const zoomIn = useCallback(() => {
    setZoom((current) => clampZoom(current + ZOOM_STEP))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((current) => clampZoom(current - ZOOM_STEP))
  }, [])

  const fitImage = useCallback(() => {
    setZoom(DEFAULT_ZOOM)
    setViewerResetKey((current) => current + 1)
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (isTypingTarget(event.target)) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, showNext, showPrevious])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5 max-sm:p-3"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspiration-detail-title"
        className="flex h-[90dvh] w-[min(94vw,1400px)] min-w-0 flex-col overflow-hidden rounded-xl border border-dp-border bg-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.985, y: 8 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: EASE }}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-dp-border px-5 py-4 max-sm:px-4">
          <motion.button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <InspirationIcon name="arrow-left" />
            All covers
          </motion.button>
          <div className="flex min-w-0 items-center gap-2 text-[12.5px] font-medium text-dp-muted">
            <span className="truncate">{item.category}</span>
            <span aria-hidden="true">/</span>
            <span className="truncate">{item.style}</span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_390px] max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:block max-lg:overflow-y-auto">
          <div className="flex min-h-0 flex-col border-r border-dp-border bg-[#FAFAF8] p-5 max-lg:border-r-0 max-lg:border-b max-sm:p-4">
            <h2 className="m-0 mb-4 text-[15px] font-bold tracking-[-0.02em] text-dp-black">Design Screens</h2>
            {detailImages.length ? (
              <ScreenshotCarousel
                title={item.title}
                images={detailImages}
                activeImage={activeImage}
                activeIndex={safeActiveIndex}
                direction={direction}
                fullPageSrc={item.fullPage}
                zoom={zoom}
                resetKey={viewerResetKey}
                onNext={showNext}
                onPrevious={showPrevious}
                onThumbnail={showThumbnail}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onFit={fitImage}
                shouldReduceMotion={shouldReduceMotion}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-dp-border bg-white p-6 text-center">
                <p className="m-0 text-[14px] font-semibold text-dp-black">No screenshots found.</p>
                <p className="m-0 mt-2 text-[13px] leading-5 text-dp-muted">This inspiration folder is present, but it does not contain image files yet.</p>
              </div>
            )}
          </div>

          <aside className="min-h-0 overflow-y-auto p-5 max-lg:overflow-visible max-sm:p-4">
            <div tabIndex={-1} ref={titleRef} className="outline-none">
              <p className="m-0 text-[13px] font-semibold text-dp-muted">{item.category}</p>
              <h2 id="inspiration-detail-title" className="m-0 mt-1 text-[26px] font-bold leading-tight tracking-[-0.045em] text-dp-black">
                {item.title}
              </h2>
              <p className="m-0 mt-2 text-[13px] font-medium leading-5 text-dp-text">{formatInspirationMeta(item)}</p>
            </div>

            <div className="mt-7 border-t border-dp-border pt-5">
              <h3 className="m-0 text-[14px] font-bold tracking-[-0.02em] text-dp-black">Description</h3>
              <p className="m-0 mt-3 text-[13.5px] leading-6 text-dp-text">{item.description}</p>
            </div>

            <div className="mt-7 border-t border-dp-border pt-5">
              <h3 className="m-0 text-[14px] font-bold tracking-[-0.02em] text-dp-black">Design direction</h3>
              <p className="m-0 mt-3 text-[13.5px] leading-6 text-dp-text">{item.designDirection}</p>
            </div>

            {showSelectionAction && (
              <motion.button
                type="button"
                onClick={onToggle}
                className={`mt-7 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isSelected
                    ? 'border-dp-black bg-white text-dp-black hover:bg-neutral-50 hover:text-dp-black'
                    : 'border-dp-black bg-dp-black text-white hover:bg-neutral-800 hover:text-white'
                }`}
                aria-label={isSelected ? 'Remove this inspiration' : 'Use this inspiration'}
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={buttonMotion}
              >
                <InspirationIcon name={isSelected ? 'check' : 'plus'} />
                {isSelected ? 'Selected' : 'Use this inspiration'}
              </motion.button>
            )}
          </aside>
        </div>
      </motion.section>
    </motion.div>
  )
}

function ScreenshotCarousel({
  title,
  images,
  activeImage,
  activeIndex,
  direction,
  fullPageSrc,
  zoom,
  resetKey,
  onNext,
  onPrevious,
  onThumbnail,
  onZoomIn,
  onZoomOut,
  onFit,
  shouldReduceMotion,
}) {
  const viewportRef = useRef(null)
  const [loadedSizes, setLoadedSizes] = useState({})
  const loadedSize = loadedSizes[activeImage.src]
  const imageWidth = loadedSize?.width || activeImage.width || 0
  const imageHeight = loadedSize?.height || activeImage.height || 0
  const imageRatio = imageWidth ? imageHeight / imageWidth : 0
  const isFullPage = activeImage.src === fullPageSrc || imageRatio >= FULL_PAGE_RATIO_THRESHOLD
  const imageStyle = isFullPage
    ? {
        width: `${zoom}%`,
        maxWidth: 'none',
        transition: shouldReduceMotion ? undefined : 'width 120ms ease-out',
      }
    : {
        maxWidth: `${zoom}%`,
        maxHeight: `${zoom}%`,
        transition: shouldReduceMotion ? undefined : 'max-width 120ms ease-out, max-height 120ms ease-out',
      }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      viewportRef.current?.scrollTo({ top: 0, left: 0 })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeImage.src, resetKey])

  function handleImageLoad(event) {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (!naturalWidth || !naturalHeight) return

    setLoadedSizes((current) => {
      const existing = current[activeImage.src]
      if (existing?.width === naturalWidth && existing?.height === naturalHeight) return current
      return {
        ...current,
        [activeImage.src]: { width: naturalWidth, height: naturalHeight },
      }
    })
  }

  function handleViewerKeyDown(event) {
    if (isTypingTarget(event.target)) return

    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      onZoomIn()
    }

    if (event.key === '-') {
      event.preventDefault()
      onZoomOut()
    }

    if (event.key === '0') {
      event.preventDefault()
      onFit()
    }
  }

  function handleWheel(event) {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()

    if (event.deltaY < 0) {
      onZoomIn()
    } else {
      onZoomOut()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative h-[320px] overflow-hidden rounded-xl border border-dp-border bg-neutral-100 sm:h-[420px] lg:h-[min(56dvh,560px)] xl:h-[min(60dvh,620px)]">
        <div
          ref={viewportRef}
          tabIndex={0}
          className="absolute inset-0 overflow-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset"
          onKeyDown={handleViewerKeyDown}
          onWheel={handleWheel}
        >
          <AnimatePresence custom={direction} mode="wait" initial={false}>
            <motion.div
              key={activeImage.src}
              className={`min-h-full min-w-full p-3 sm:p-4 ${
                isFullPage ? 'flex items-start justify-center touch-pan-y' : 'flex h-full items-center justify-center touch-pan-y'
              }`}
              custom={direction}
              drag={shouldReduceMotion ? false : 'x'}
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              style={{ touchAction: 'pan-y' }}
              onDragEnd={(_, info) => {
                const hasHorizontalOffset = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.2
                const hasHorizontalVelocity = Math.abs(info.velocity.x) > Math.abs(info.velocity.y) * 1.2
                if (!hasHorizontalOffset && !hasHorizontalVelocity) return

                if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
                  onNext()
                } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
                  onPrevious()
                }
              }}
              initial={shouldReduceMotion ? false : { x: direction > 0 ? 30 : -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { x: direction > 0 ? -30 : 30, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
            >
              <img
                src={activeImage.src}
                alt={`${title} screenshot ${activeIndex + 1} of ${images.length}: ${activeImage.label}`}
                className={`block h-auto object-contain ${isFullPage ? 'max-w-none object-top' : 'w-auto object-center'}`}
                style={imageStyle}
                loading="lazy"
                draggable="false"
                onLoad={handleImageLoad}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <ZoomToolbar
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFit={onFit}
        />

        {isFullPage && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-dp-border bg-white/92 px-3 py-1 text-[11px] font-medium text-dp-muted shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
            Scroll to explore full page
          </div>
        )}

        {images.length > 1 && (
          <>
            <CarouselArrow label="Previous image" direction="previous" onClick={onPrevious} shouldReduceMotion={shouldReduceMotion} />
            <CarouselArrow label="Next image" direction="next" onClick={onNext} shouldReduceMotion={shouldReduceMotion} />
          </>
        )}
      </div>

      <div className="mt-3 text-center text-[12.5px] font-medium text-dp-muted">
        {activeIndex + 1} / {images.length}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Screenshot thumbnails">
        {images.map((image, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={image.src}
              type="button"
              onClick={() => onThumbnail(index)}
              className={`h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-white p-0 transition-[border-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] max-sm:h-14 max-sm:w-20 ${
                isActive ? 'border-dp-black opacity-100' : 'border-dp-border opacity-65 hover:border-neutral-300 hover:opacity-90'
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <img src={image.src} alt="" className="h-full w-full object-cover object-top" loading="lazy" draggable="false" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ZoomToolbar({ zoom, onZoomIn, onZoomOut, onFit }) {
  return (
    <div className="absolute right-3 top-3 z-20 inline-flex items-center overflow-hidden rounded-xl border border-dp-border bg-white/95 text-dp-black shadow-[0_6px_18px_rgba(0,0,0,0.10)]">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM}
        className="grid h-9 w-9 cursor-pointer place-items-center border-r border-dp-border text-[16px] font-semibold transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-dp-muted disabled:opacity-45"
        aria-label="Zoom out"
      >
        -
      </button>
      <span className="min-w-14 px-2 text-center text-[12px] font-semibold text-dp-black" aria-live="polite">
        {zoom}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM}
        className="grid h-9 w-9 cursor-pointer place-items-center border-l border-r border-dp-border text-[16px] font-semibold transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-dp-muted disabled:opacity-45"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={onFit}
        className="h-9 cursor-pointer px-3 text-[12px] font-semibold text-dp-black transition-colors duration-200 hover:bg-neutral-50"
        aria-label="Fit image"
      >
        Fit
      </button>
    </div>
  )
}

function CarouselArrow({ label, direction, onClick, shouldReduceMotion }) {
  const isPrevious = direction === 'previous'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`absolute top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-dp-border bg-white/92 text-dp-black shadow-[0_6px_18px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors duration-200 hover:border-neutral-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        isPrevious ? 'left-3' : 'right-3'
      }`}
      aria-label={label}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      transition={buttonMotion}
    >
      <InspirationIcon name={isPrevious ? 'arrow-left' : 'arrow-right'} />
    </motion.button>
  )
}

function LoadableImage({ src, alt, className, loading, onLoad }) {
  const [hasFailed, setHasFailed] = useState(false)

  if (hasFailed) {
    return (
      <div className="grid h-full w-full place-items-center px-4 text-center text-[12.5px] font-medium text-dp-muted">
        Image unavailable
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`block ${className}`}
      loading={loading}
      decoding="async"
      draggable="false"
      onLoad={onLoad}
      onError={() => setHasFailed(true)}
    />
  )
}

function MissingPreview({ title, folder }) {
  return (
    <div className="grid h-full w-full place-items-center px-4 text-center">
      <div>
        <p className="m-0 text-[14px] font-semibold text-dp-black">{title}</p>
        <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">{folder} has no image files.</p>
      </div>
    </div>
  )
}

function SelectedItem({ item, onRemove, shouldReduceMotion }) {
  return (
    <motion.div
      layout
      className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)_32px] items-center gap-3 rounded-xl border border-dp-border bg-[#FAFAF8] p-2 max-md:min-w-[240px]"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
    >
      {item.galleryPreview ? (
        <img src={item.galleryPreview} alt={`${item.title} selected preview`} className="h-12 w-[72px] rounded-lg border border-dp-border object-cover object-top" loading="lazy" />
      ) : (
        <div className="grid h-12 w-[72px] place-items-center rounded-lg border border-dp-border bg-white text-[10px] font-semibold text-dp-muted">
          No image
        </div>
      )}
      <div className="min-w-0">
        <p className="m-0 truncate text-[13px] font-semibold text-dp-black">{item.title}</p>
        <p className="m-0 mt-0.5 truncate text-[12px] text-dp-muted">{item.category}</p>
      </div>
      <motion.button
        type="button"
        onClick={onRemove}
        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-neutral-200 bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
        aria-label={`Remove ${item.title}`}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={buttonMotion}
      >
        <InspirationIcon name="x" />
      </motion.button>
    </motion.div>
  )
}

function ProgressSteps() {
  return (
    <ol className="flex flex-wrap items-center gap-2 p-0">
      {FLOW_STEPS.map((step, index) => {
        const isActive = step === 'Inspiration'
        const isComplete = index < FLOW_STEPS.indexOf('Inspiration')
        return (
          <li key={step} className="flex items-center gap-2">
            <span className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold ${
              isActive
                ? 'border-dp-black bg-dp-black text-white'
                : isComplete
                  ? 'border-dp-border bg-white text-dp-black'
                  : 'border-dp-border bg-white text-dp-muted'
            }`}>
              {isComplete && <InspirationIcon name="check-small" />}
              {step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function RequirementSummary() {
  const requirements = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('devpilot-requirements')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }, [])

  const rows = [
    ['Industry', requirements.industry || 'Not selected'],
    ['Style', requirements.style || 'Not selected'],
    ['Pages', Array.isArray(requirements.pages) && requirements.pages.length ? requirements.pages.join(', ') : 'None selected'],
  ]

  return (
    <dl className="m-0 mt-3 grid gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0 border-t border-dp-border pt-2 first:border-t-0 first:pt-0">
          <dt className="text-[11px] font-semibold text-dp-muted">{label}</dt>
          <dd className="m-0 mt-0.5 line-clamp-2 text-[12.5px] font-medium leading-5 text-dp-black">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ValidationError({ children }) {
  if (!children) return null

  return (
    <motion.p
      className="m-0 mb-2 text-[12px] font-medium text-red-700"
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      {children}
    </motion.p>
  )
}

function InspirationIcon({ name }) {
  const common = name === 'arrow-right' || name === 'arrow-left' ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0'

  if (name === 'check' || name === 'check-small') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M3.5 8.2l2.8 2.8 6.2-6.5" />
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

  if (name === 'plus') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={common} aria-hidden="true">
        <path d="M8 3.5v9M3.5 8h9" />
      </svg>
    )
  }

  if (name === 'arrow-left') {
    return (
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M11 7H3M6 4L3 7l3 3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
      <path d="M3 7h8M8 4l3 3-3 3" />
    </svg>
  )
}
