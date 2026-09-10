import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { inspirationGalleryStyles } from './InspirationGallery.styles'

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
    <div className={inspirationGalleryStyles.page}>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: EASE }}
        className={inspirationGalleryStyles.headingRow}
      >
        <div>
          <h1 className={inspirationGalleryStyles.heading}>
            Inspiration Gallery
          </h1>
          <p className={inspirationGalleryStyles.intro}>
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
            className={inspirationGalleryStyles.primaryButton}
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
        <div className={inspirationGalleryStyles.bottomBar}>
          <div className={inspirationGalleryStyles.bottomInner}>
            <motion.button
              type="button"
              onClick={handleBack}
              className={inspirationGalleryStyles.secondaryButton}
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={buttonMotion}
            >
              {activeItem ? 'Close' : 'Back'}
            </motion.button>

            <div className={inspirationGalleryStyles.bottomActions}>
              <ValidationError>{validationError}</ValidationError>
              <motion.button
                type="button"
                onClick={handleContinue}
                className={inspirationGalleryStyles.primaryButton}
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
      className={inspirationGalleryStyles.modalOverlay}
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
        className={inspirationGalleryStyles.addModal}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: EASE }}
      >
        <div className={inspirationGalleryStyles.modalHeader}>
          <div>
            <h2 id="add-inspiration-title" className={inspirationGalleryStyles.modalTitle}>Add Inspiration</h2>
            <p className={inspirationGalleryStyles.modalCopy}>
              User inspiration uploads are not connected to persistent storage yet. This entry point is ready for image or website reference capture when that API is added.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={inspirationGalleryStyles.iconButton}
            aria-label="Close add inspiration dialog"
          >
            <InspirationIcon name="x" />
          </button>
        </div>
        <div className={inspirationGalleryStyles.modalNotice}>
          <p className={inspirationGalleryStyles.noticeTitle}>Upload service required</p>
          <p className={inspirationGalleryStyles.noticeText}>No inspiration will be saved from this screen until storage is implemented.</p>
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
      className={showSelectionPanel ? inspirationGalleryStyles.overviewGrid : inspirationGalleryStyles.overviewBlock}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: EASE }}
    >
      <section aria-label="Inspiration covers" className={inspirationGalleryStyles.coversSection}>
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
              <motion.div layout className={inspirationGalleryStyles.cardsGrid}>
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
          className={inspirationGalleryStyles.selectionPanel}
          aria-labelledby="selected-inspirations-heading"
        >
          <div className={inspirationGalleryStyles.selectionHeader}>
            <h2 id="selected-inspirations-heading" className={inspirationGalleryStyles.selectionTitle}>Selected</h2>
            <span className={inspirationGalleryStyles.selectionCount}>{selectedInspirations.length} selected</span>
          </div>
          <ValidationError>{validationError}</ValidationError>

          {selectedInspirations.length ? (
            <motion.div layout className={inspirationGalleryStyles.selectionGrid}>
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
            <div className={inspirationGalleryStyles.emptySelection}>
              <p className={inspirationGalleryStyles.noticeTitle}>No inspirations selected yet.</p>
              <p className={inspirationGalleryStyles.noticeText}>Open a cover and choose Use this inspiration.</p>
            </div>
          )}

          <div className={inspirationGalleryStyles.briefPanel}>
            <p className={inspirationGalleryStyles.noticeTitle}>Current brief</p>
            <RequirementSummary />
          </div>
        </aside>
      )}
    </motion.div>
  )
}

function CategoryFilterBar({ options, activeCategory, resultCount, onChange, shouldReduceMotion }) {
  return (
    <div className={inspirationGalleryStyles.filterWrap}>
      <div className={inspirationGalleryStyles.filterList} role="tablist" aria-label="Filter inspirations by category">
        {options.map((option) => {
          const isActive = option.key === activeCategory
          return (
            <motion.button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.key)}
              className={`${inspirationGalleryStyles.filterButtonBase} ${
                isActive
                  ? inspirationGalleryStyles.filterButtonActive
                  : inspirationGalleryStyles.filterButtonDefault
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
      <p className={inspirationGalleryStyles.resultCount}>
        {resultCount}
      </p>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className={inspirationGalleryStyles.skeletonGrid} aria-label="Loading inspirations">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={inspirationGalleryStyles.skeletonCard}>
          <div className={inspirationGalleryStyles.skeletonPreview} />
          <div className={inspirationGalleryStyles.skeletonBody}>
            <div className={inspirationGalleryStyles.skeletonLineTitle} />
            <div className={inspirationGalleryStyles.skeletonLineMeta} />
          </div>
        </div>
      ))}
    </div>
  )
}

function GalleryMessage({ title, body }) {
  return (
    <div className={inspirationGalleryStyles.message}>
      <p className={inspirationGalleryStyles.messageTitle}>{title}</p>
      <p className={inspirationGalleryStyles.messageBody}>{body}</p>
    </div>
  )
}

function CoverCard({ item, index, isSelected, onOpen, shouldReduceMotion }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onOpen}
      className={`${inspirationGalleryStyles.coverBase} ${
        isSelected ? inspirationGalleryStyles.coverSelected : inspirationGalleryStyles.coverDefault
      }`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.26, delay: shouldReduceMotion ? 0 : index * 0.035, ease: EASE }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
      aria-label={`Open ${item.title} inspiration details`}
    >
      <div className={inspirationGalleryStyles.coverMedia}>
        {item.galleryPreview ? (
          <GalleryPreviewImage item={item} loading={index < 3 ? 'eager' : 'lazy'} />
        ) : (
          <MissingPreview title={item.title} folder={item.folder} />
        )}
      </div>
      <div className={inspirationGalleryStyles.coverBody}>
        <div className="min-w-0">
          <h2 className={inspirationGalleryStyles.coverTitle}>{item.title}</h2>
          <p className={inspirationGalleryStyles.coverMeta}>{formatInspirationMeta(item)}</p>
        </div>
        {isSelected && (
          <span className={inspirationGalleryStyles.selectedBadge} aria-label="Selected">
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
      className={inspirationGalleryStyles.detailOverlay}
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
        className={inspirationGalleryStyles.detailModal}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.985, y: 8 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: EASE }}
      >
        <div className={inspirationGalleryStyles.detailHeader}>
          <motion.button
            type="button"
            onClick={onClose}
            className={inspirationGalleryStyles.detailBack}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <InspirationIcon name="arrow-left" />
            All covers
          </motion.button>
          <div className={inspirationGalleryStyles.detailMeta}>
            <span className="truncate">{item.category}</span>
            <span aria-hidden="true">/</span>
            <span className="truncate">{item.style}</span>
          </div>
        </div>

        <div className={inspirationGalleryStyles.detailGrid}>
          <div className={inspirationGalleryStyles.screensPane}>
            <h2 className={inspirationGalleryStyles.screensTitle}>Design Screens</h2>
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
              <div className={inspirationGalleryStyles.message}>
                <p className={inspirationGalleryStyles.messageTitle}>No screenshots found.</p>
                <p className={inspirationGalleryStyles.messageBody}>This inspiration folder is present, but it does not contain image files yet.</p>
              </div>
            )}
          </div>

          <aside className={inspirationGalleryStyles.detailAside}>
            <div tabIndex={-1} ref={titleRef} className={inspirationGalleryStyles.focusTarget}>
              <p className={inspirationGalleryStyles.detailCategory}>{item.category}</p>
              <h2 id="inspiration-detail-title" className={inspirationGalleryStyles.detailTitle}>
                {item.title}
              </h2>
              <p className={inspirationGalleryStyles.detailSubtitle}>{formatInspirationMeta(item)}</p>
            </div>

            <div className={inspirationGalleryStyles.detailSection}>
              <h3 className={inspirationGalleryStyles.detailSectionTitle}>Description</h3>
              <p className={inspirationGalleryStyles.detailSectionText}>{item.description}</p>
            </div>

            <div className={inspirationGalleryStyles.detailSection}>
              <h3 className={inspirationGalleryStyles.detailSectionTitle}>Design direction</h3>
              <p className={inspirationGalleryStyles.detailSectionText}>{item.designDirection}</p>
            </div>

            {showSelectionAction && (
              <motion.button
                type="button"
                onClick={onToggle}
                className={`${inspirationGalleryStyles.selectButtonBase} ${
                  isSelected
                    ? inspirationGalleryStyles.selectButtonActive
                    : inspirationGalleryStyles.selectButtonDefault
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
    <div className={inspirationGalleryStyles.carousel}>
      <div className={inspirationGalleryStyles.viewport}>
        <div
          ref={viewportRef}
          tabIndex={0}
          className={inspirationGalleryStyles.scrollArea}
          onKeyDown={handleViewerKeyDown}
          onWheel={handleWheel}
        >
          <AnimatePresence custom={direction} mode="wait" initial={false}>
            <motion.div
              key={activeImage.src}
              className={`${inspirationGalleryStyles.imageFrameBase} ${
                isFullPage ? inspirationGalleryStyles.imageFrameFull : inspirationGalleryStyles.imageFrameFit
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
                className={`${inspirationGalleryStyles.imageBase} ${isFullPage ? inspirationGalleryStyles.imageFull : inspirationGalleryStyles.imageFit}`}
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
          <div className={inspirationGalleryStyles.fullPageHint}>
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

      <div className={inspirationGalleryStyles.carouselCount}>
        {activeIndex + 1} / {images.length}
      </div>

      <div className={inspirationGalleryStyles.thumbnails} aria-label="Screenshot thumbnails">
        {images.map((image, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={image.src}
              type="button"
              onClick={() => onThumbnail(index)}
              className={`${inspirationGalleryStyles.thumbnailBase} ${
                isActive ? inspirationGalleryStyles.thumbnailActive : inspirationGalleryStyles.thumbnailDefault
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <img src={image.src} alt="" className={inspirationGalleryStyles.thumbnailImage} loading="lazy" draggable="false" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ZoomToolbar({ zoom, onZoomIn, onZoomOut, onFit }) {
  return (
    <div className={inspirationGalleryStyles.zoomToolbar}>
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM}
        className={`${inspirationGalleryStyles.zoomButton} ${inspirationGalleryStyles.zoomOutButton}`}
        aria-label="Zoom out"
      >
        -
      </button>
      <span className={inspirationGalleryStyles.zoomValue} aria-live="polite">
        {zoom}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM}
        className={`${inspirationGalleryStyles.zoomButton} ${inspirationGalleryStyles.zoomInButton}`}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={onFit}
        className={inspirationGalleryStyles.zoomFit}
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
      className={`${inspirationGalleryStyles.arrowBase} ${
        isPrevious ? inspirationGalleryStyles.arrowPrevious : inspirationGalleryStyles.arrowNext
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
      <div className={inspirationGalleryStyles.loadError}>
        Image unavailable
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${inspirationGalleryStyles.image} ${className}`}
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
    <div className={inspirationGalleryStyles.missingPreview}>
      <div>
        <p className={inspirationGalleryStyles.missingPreviewTitle}>{title}</p>
        <p className={inspirationGalleryStyles.missingPreviewText}>{folder} has no image files.</p>
      </div>
    </div>
  )
}

function SelectedItem({ item, onRemove, shouldReduceMotion }) {
  return (
    <motion.div
      layout
      className={inspirationGalleryStyles.selectedItem}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
    >
      {item.galleryPreview ? (
        <img src={item.galleryPreview} alt={`${item.title} selected preview`} className={inspirationGalleryStyles.selectedImage} loading="lazy" />
      ) : (
        <div className={inspirationGalleryStyles.selectedFallback}>
          No image
        </div>
      )}
      <div className={inspirationGalleryStyles.selectedText}>
        <p className={inspirationGalleryStyles.selectedTitle}>{item.title}</p>
        <p className={inspirationGalleryStyles.selectedCategory}>{item.category}</p>
      </div>
      <motion.button
        type="button"
        onClick={onRemove}
        className={inspirationGalleryStyles.selectedRemove}
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
    <ol className={inspirationGalleryStyles.progressList}>
      {FLOW_STEPS.map((step, index) => {
        const isActive = step === 'Inspiration'
        const isComplete = index < FLOW_STEPS.indexOf('Inspiration')
        return (
          <li key={step} className={inspirationGalleryStyles.progressItem}>
            <span className={`${inspirationGalleryStyles.progressPillBase} ${
              isActive
                ? inspirationGalleryStyles.progressActive
                : isComplete
                  ? inspirationGalleryStyles.progressComplete
                  : inspirationGalleryStyles.progressDefault
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
    <dl className={inspirationGalleryStyles.requirementSummary}>
      {rows.map(([label, value]) => (
        <div key={label} className={inspirationGalleryStyles.requirementSummaryItem}>
          <dt className={inspirationGalleryStyles.requirementSummaryTerm}>{label}</dt>
          <dd className={inspirationGalleryStyles.requirementSummaryValue}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ValidationError({ children }) {
  if (!children) return null

  return (
    <motion.p
      className={inspirationGalleryStyles.validationError}
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
