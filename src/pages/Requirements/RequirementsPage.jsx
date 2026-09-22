import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../services/authService'
import { updateProject } from '../../services/projectService'
import UserMenu from '../Dashboard/components/UserMenu'
import { requirementsPageStyles } from './RequirementsPage.styles'

const EASE = [0.16, 1, 0.3, 1]
const buttonMotion = { duration: 0.2, ease: 'easeOut' }

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { id: 'projects', label: 'My Projects', href: '/dashboard/projects', icon: 'projects' },
  { id: 'prompt', label: 'Prompt Builder', href: '/prompt', icon: 'prompt' },
  { id: 'inspiration', label: 'Inspiration Gallery', href: '/dashboard/inspiration', icon: 'inspiration' },
  { id: 'pricing', label: 'Pricing', href: '/dashboard/pricing', icon: 'pricing' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

const FLOW_STEPS = ['Prompt', 'Requirements', 'Inspiration', 'Generation']

const INDUSTRIES = [
  'Restaurant',
  'Portfolio',
  'SaaS',
  'Healthcare',
  'Education',
  'Ecommerce',
  'Agency',
  'Real Estate',
]

const STYLES = ['Modern', 'Minimal', 'Corporate']

const COLORS = [
  { name: 'Blue', value: '#2563EB' },
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Amber', value: '#D97706' },
  { name: 'Rose', value: '#E11D48' },
  { name: 'Slate', value: '#334155' },
  { name: 'Cyan', value: '#0891B2' },
  { name: 'Orange', value: '#EA580C' },
]

const PAGES = ['Home', 'About', 'Services', 'Pricing', 'Portfolio', 'Blog', 'FAQ', 'Contact', 'Dashboard']
const FEATURES = ['Authentication', 'CMS', 'Payment Integration', 'AI Chat', 'Admin Panel', 'Analytics', 'Notifications', 'Search']
const DEVICES = ['Desktop', 'Tablet', 'Mobile']

const ASSET_TYPES = [
  { title: 'Logo', description: 'PNG, SVG or JPG' },
  { title: 'Inspiration Images', description: 'Sites or designs you like' },
  { title: 'Brand Assets', description: 'Fonts, colors, guidelines' },
]

const EMPTY_REQUIREMENTS = {
  projectName: '',
  industry: '',
  targetAudience: '',
  style: '',
  primaryColor: '',
  secondaryColor: '',
  pages: [],
  features: [],
  devices: [],
  assets: [],
  assetsSkipped: false,
  notes: '',
  noAdditionalNotes: false,
}

const LEGACY_DEFAULT_REQUIREMENTS = {
  industry: '',
  targetAudience: '',
  style: 'Modern',
  primaryColor: 'Slate',
  secondaryColor: 'Blue',
  pages: ['Home', 'Contact'],
  features: [],
  devices: ['Desktop', 'Tablet', 'Mobile'],
  notes: '',
}

function sameItems(value, expected) {
  return Array.isArray(value) && value.length === expected.length && expected.every((item) => value.includes(item))
}

function isLegacyPrefilledRequirements(value) {
  return (
    value.industry === LEGACY_DEFAULT_REQUIREMENTS.industry &&
    value.targetAudience === LEGACY_DEFAULT_REQUIREMENTS.targetAudience &&
    value.style === LEGACY_DEFAULT_REQUIREMENTS.style &&
    value.primaryColor === LEGACY_DEFAULT_REQUIREMENTS.primaryColor &&
    value.secondaryColor === LEGACY_DEFAULT_REQUIREMENTS.secondaryColor &&
    value.notes === LEGACY_DEFAULT_REQUIREMENTS.notes &&
    sameItems(value.pages, LEGACY_DEFAULT_REQUIREMENTS.pages) &&
    sameItems(value.features, LEGACY_DEFAULT_REQUIREMENTS.features) &&
    sameItems(value.devices, LEGACY_DEFAULT_REQUIREMENTS.devices)
  )
}

function getStoredRequirements() {
  const fallback = EMPTY_REQUIREMENTS

  try {
    const stored = sessionStorage.getItem('devpilot-requirements')
    if (!stored) return fallback
    const parsed = JSON.parse(stored)
    const normalized = {
      ...fallback,
      ...parsed,
      pages: Array.isArray(parsed.pages) ? parsed.pages : fallback.pages,
      features: Array.isArray(parsed.features) ? parsed.features : fallback.features,
      devices: Array.isArray(parsed.devices) ? parsed.devices : fallback.devices,
      assets: Array.isArray(parsed.assets) ? parsed.assets : fallback.assets,
      assetsSkipped: Boolean(parsed.assetsSkipped),
      noAdditionalNotes: Boolean(parsed.noAdditionalNotes),
    }
    if (isLegacyPrefilledRequirements(normalized)) {
      return {
        ...normalized,
        style: '',
        primaryColor: '',
        secondaryColor: '',
        pages: [],
        devices: [],
      }
    }

    return normalized
  } catch {
    return fallback
  }
}

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function getValidationErrors(value) {
  const nextErrors = {}

  if (!hasText(value.projectName)) nextErrors.projectName = 'Enter a project name.'
  if (!value.industry) nextErrors.industry = 'Select an industry.'
  if (!hasText(value.targetAudience)) nextErrors.targetAudience = 'Enter the target audience.'
  if (!value.style) nextErrors.style = 'Select a design style.'
  if (!value.primaryColor) nextErrors.primaryColor = 'Select a primary color.'
  if (!value.secondaryColor) nextErrors.secondaryColor = 'Select a secondary color.'
  if (!value.pages.length) nextErrors.pages = 'Select at least one page.'
  if (!value.features.length) nextErrors.features = 'Select at least one feature.'
  if (!value.devices.length) nextErrors.devices = 'Select at least one target device.'
  if (!value.assets.length && !value.assetsSkipped) nextErrors.assets = 'Upload at least one asset or choose Skip assets.'
  if (!hasText(value.notes) && !value.noAdditionalNotes) nextErrors.notes = 'Enter additional notes or choose No additional notes.'

  return nextErrors
}

function isRequirementFieldValid(field, value) {
  if (field === 'projectName' || field === 'targetAudience') return hasText(value[field])
  if (field === 'notes') return hasText(value.notes) || value.noAdditionalNotes
  if (field === 'industry' || field === 'style' || field === 'primaryColor' || field === 'secondaryColor') return Boolean(value[field])
  if (field === 'pages' || field === 'features' || field === 'devices') return value[field].length > 0
  if (field === 'assets' || field === 'assetsSkipped') return value.assets.length > 0 || value.assetsSkipped
  if (field === 'noAdditionalNotes') return hasText(value.notes) || value.noAdditionalNotes
  return true
}

const VALIDATION_ORDER = [
  'projectName',
  'industry',
  'targetAudience',
  'style',
  'primaryColor',
  'secondaryColor',
  'pages',
  'features',
  'devices',
  'assets',
  'notes',
]

function getColorLabel(colorName) {
  const color = COLORS.find((item) => item.name === colorName)
  return color ? `${color.name} (${color.value})` : colorName
}

function pushPreference(preferences, label, value) {
  if (hasText(value)) {
    preferences.push(`${label}: ${value.trim()}`)
  }
}

function mapRequirementsToProjectPayload(value) {
  const designPreferences = []
  const projectName = value.projectName.trim()

  pushPreference(designPreferences, 'Style', value.style)
  pushPreference(designPreferences, 'Primary Color', getColorLabel(value.primaryColor))
  pushPreference(designPreferences, 'Secondary Color', getColorLabel(value.secondaryColor))

  const payload = {
    requirements: {
      projectType: value.industry,
      designPreferences,
      pages: value.pages,
      features: value.features,
      devices: value.devices,
      notes: value.noAdditionalNotes ? '' : value.notes.trim(),
    },
  }

  if (projectName) {
    payload.projectName = projectName
  }

  return payload
}

export default function RequirementsPage() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [requirements, setRequirements] = useState(getStoredRequirements)
  const [initialPrompt] = useState(() => sessionStorage.getItem('devpilot-prompt') || '')
  const [errors, setErrors] = useState({})
  const [continueError, setContinueError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const projectInfoSectionRef = useRef(null)
  const designSectionRef = useRef(null)
  const pagesSectionRef = useRef(null)
  const featuresSectionRef = useRef(null)
  const devicesSectionRef = useRef(null)
  const assetsSectionRef = useRef(null)
  const notesSectionRef = useRef(null)
  const projectNameRef = useRef(null)
  const industryRef = useRef(null)
  const targetAudienceRef = useRef(null)
  const styleRef = useRef(null)
  const primaryColorRef = useRef(null)
  const secondaryColorRef = useRef(null)
  const pagesRef = useRef(null)
  const featuresRef = useRef(null)
  const devicesRef = useRef(null)
  const assetsRef = useRef(null)
  const notesRef = useRef(null)
  const continueInFlightRef = useRef(false)
  const shouldReduceMotion = useReducedMotion()

  const summary = useMemo(() => ({
    Project: requirements.projectName || 'Untitled project',
    Industry: requirements.industry || 'Not selected',
    Style: requirements.style || 'Not selected',
    Pages: requirements.pages.length ? requirements.pages.join(', ') : 'None selected',
    Features: requirements.features.length ? requirements.features.join(', ') : 'None selected',
    Devices: requirements.devices.length ? requirements.devices.join(', ') : 'None selected',
  }), [requirements])

  useEffect(() => {
    sessionStorage.setItem('devpilot-requirements', JSON.stringify(requirements))
    window.dispatchEvent(new Event('devpilot-requirements-changed'))
  }, [requirements])

  function updateField(field, value) {
    setContinueError('')
    setRequirements((current) => {
      const next = { ...current, [field]: value }

      if (field === 'notes' && hasText(value)) {
        next.noAdditionalNotes = false
      }

      setErrors((currentErrors) => {
        const fieldsToCheck = field === 'notes' || field === 'noAdditionalNotes'
          ? ['notes']
          : field === 'assets' || field === 'assetsSkipped'
            ? ['assets']
            : [field]

        if (!fieldsToCheck.some((errorField) => currentErrors[errorField] && isRequirementFieldValid(errorField, next))) {
          return currentErrors
        }

        return fieldsToCheck.reduce((updatedErrors, errorField) => {
          if (isRequirementFieldValid(errorField, next)) {
            updatedErrors[errorField] = ''
          }
          return updatedErrors
        }, { ...currentErrors })
      })

      return next
    })
  }

  async function handleContinue() {
    if (continueInFlightRef.current) return

    const validationErrors = getValidationErrors(requirements)

    if (Object.keys(validationErrors).length) {
      const firstInvalidField = VALIDATION_ORDER.find((field) => validationErrors[field])
      const sectionRefs = {
        projectName: projectInfoSectionRef,
        industry: projectInfoSectionRef,
        targetAudience: projectInfoSectionRef,
        style: designSectionRef,
        primaryColor: designSectionRef,
        secondaryColor: designSectionRef,
        pages: pagesSectionRef,
        features: featuresSectionRef,
        devices: devicesSectionRef,
        assets: assetsSectionRef,
        notes: notesSectionRef,
      }
      const controlRefs = {
        projectName: projectNameRef,
        industry: industryRef,
        targetAudience: targetAudienceRef,
        style: styleRef,
        primaryColor: primaryColorRef,
        secondaryColor: secondaryColorRef,
        pages: pagesRef,
        features: featuresRef,
        devices: devicesRef,
        assets: assetsRef,
        notes: notesRef,
      }

      setErrors(validationErrors)
      setContinueError('')
      sectionRefs[firstInvalidField]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.setTimeout(() => controlRefs[firstInvalidField]?.current?.focus(), 260)
      return
    }

    const requirementsDraft = { ...requirements, initialPrompt }
    sessionStorage.setItem('devpilot-requirements', JSON.stringify(requirementsDraft))
    window.dispatchEvent(new Event('devpilot-requirements-changed'))

    const projectId = sessionStorage.getItem('devpilot-current-project-id')

    if (!projectId) {
      setContinueError('Current project session could not be found. Please start again from Prompt.')
      return
    }

    continueInFlightRef.current = true
    setIsSaving(true)
    setContinueError('')

    try {
      await updateProject(projectId, mapRequirementsToProjectPayload(requirements))
      navigate('/inspiration')
    } catch (error) {
      setContinueError(error?.message || 'Could not save requirements. Please try again.')
      setIsSaving(false)
      continueInFlightRef.current = false
    }
  }

  return (
    <div className={requirementsPageStyles.page}>
      <RequirementsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={requirementsPageStyles.shell}>
        <RequirementsHeader user={user} onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className={requirementsPageStyles.main}>
          <div className={requirementsPageStyles.content}>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.36, ease: EASE }}
            >
              <div className={requirementsPageStyles.introRow}>
                <div>
                  <h1 className={requirementsPageStyles.heading}>
                    Project Requirements
                  </h1>
                  <p className={requirementsPageStyles.introText}>
                    Help DevPilot understand your project so it can generate a better website.
                  </p>
                </div>
                <ProgressSteps />
              </div>
            </motion.div>

            <div className={requirementsPageStyles.bodyGrid}>
              <div className={requirementsPageStyles.formStack}>
                <SectionCard title="Project Information" sectionRef={projectInfoSectionRef} delay={0.04} shouldReduceMotion={shouldReduceMotion}>
                  {initialPrompt && (
                    <div className={requirementsPageStyles.initialPrompt}>
                      <p className={requirementsPageStyles.initialPromptLabel}>Initial Prompt</p>
                      <p className={requirementsPageStyles.initialPromptText}>{initialPrompt}</p>
                    </div>
                  )}
                  <div className={requirementsPageStyles.twoColumn}>
                    <Field label="Project Name" error={errors.projectName} errorId="project-name-error">
                      <input
                        ref={projectNameRef}
                        value={requirements.projectName}
                        onChange={(e) => updateField('projectName', e.target.value)}
                        placeholder="e.g. Bella Vista Restaurant"
                        className={inputClass(errors.projectName)}
                        aria-invalid={Boolean(errors.projectName)}
                        aria-describedby={errors.projectName ? 'project-name-error' : undefined}
                      />
                    </Field>

                    <Field label="Industry" error={errors.industry} errorId="industry-error">
                      <select
                        ref={industryRef}
                        value={requirements.industry}
                        onChange={(e) => updateField('industry', e.target.value)}
                        className={inputClass(errors.industry)}
                        aria-invalid={Boolean(errors.industry)}
                        aria-describedby={errors.industry ? 'industry-error' : undefined}
                      >
                        <option value="">Select industry</option>
                        {INDUSTRIES.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className={requirementsPageStyles.fieldSpacing}>
                    <Field label="Target Audience" error={errors.targetAudience} errorId="target-audience-error">
                      <input
                        ref={targetAudienceRef}
                        value={requirements.targetAudience}
                        onChange={(e) => updateField('targetAudience', e.target.value)}
                        placeholder="e.g. Young professionals in urban areas"
                        className={inputClass(errors.targetAudience)}
                        aria-invalid={Boolean(errors.targetAudience)}
                        aria-describedby={errors.targetAudience ? 'target-audience-error' : undefined}
                      />
                    </Field>
                  </div>
                </SectionCard>

                <SectionCard title="Design Preferences" sectionRef={designSectionRef} delay={0.08} shouldReduceMotion={shouldReduceMotion}>
                  <FieldLabel>Style</FieldLabel>
                  <TileGrid>
                    {STYLES.map((style, index) => (
                      <SelectTile
                        key={style}
                        buttonRef={index === 0 ? styleRef : undefined}
                        label={style}
                        selected={requirements.style === style}
                        onClick={() => updateField('style', style)}
                        icon="spark"
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </TileGrid>
                  <ValidationError id="design-style-error">{errors.style}</ValidationError>

                  <div className={requirementsPageStyles.twoColumnLoose}>
                    <ColorPicker
                      label="Primary Color"
                      value={requirements.primaryColor}
                      onChange={(color) => updateField('primaryColor', color)}
                      error={errors.primaryColor}
                      errorId="primary-color-error"
                      firstButtonRef={primaryColorRef}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={requirements.secondaryColor}
                      onChange={(color) => updateField('secondaryColor', color)}
                      error={errors.secondaryColor}
                      errorId="secondary-color-error"
                      firstButtonRef={secondaryColorRef}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Required Pages" sectionRef={pagesSectionRef} description="Select every page you'd like included." delay={0.12} shouldReduceMotion={shouldReduceMotion}>
                  <TileGrid>
                    {PAGES.map((page, index) => (
                      <SelectTile
                        key={page}
                        buttonRef={index === 0 ? pagesRef : undefined}
                        label={page}
                        selected={requirements.pages.includes(page)}
                        onClick={() => updateField('pages', toggleValue(requirements.pages, page))}
                        icon="page"
                        multi
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </TileGrid>
                  <ValidationError id="pages-error">{errors.pages}</ValidationError>
                </SectionCard>

                <SectionCard title="Features" sectionRef={featuresSectionRef} delay={0.16} shouldReduceMotion={shouldReduceMotion}>
                  <TileGrid>
                    {FEATURES.map((feature, index) => (
                      <SelectTile
                        key={feature}
                        buttonRef={index === 0 ? featuresRef : undefined}
                        label={feature}
                        selected={requirements.features.includes(feature)}
                        onClick={() => updateField('features', toggleValue(requirements.features, feature))}
                        icon="feature"
                        multi
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </TileGrid>
                  <ValidationError id="features-error">{errors.features}</ValidationError>
                </SectionCard>

                <SectionCard title="Target Devices" sectionRef={devicesSectionRef} delay={0.2} shouldReduceMotion={shouldReduceMotion}>
                  <TileGrid>
                    {DEVICES.map((device, index) => (
                      <SelectTile
                        key={device}
                        buttonRef={index === 0 ? devicesRef : undefined}
                        label={device}
                        selected={requirements.devices.includes(device)}
                        onClick={() => updateField('devices', toggleValue(requirements.devices, device))}
                        icon={device.toLowerCase()}
                        multi
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </TileGrid>
                  <ValidationError id="devices-error">{errors.devices}</ValidationError>
                </SectionCard>

                <SectionCard title="Upload Assets" sectionRef={assetsSectionRef} description="Helps the AI match your existing brand." delay={0.24} shouldReduceMotion={shouldReduceMotion}>
                  <div className={requirementsPageStyles.assetGrid}>
                    {ASSET_TYPES.map((asset) => (
                      <div key={asset.title} className={requirementsPageStyles.assetCard}>
                        <span className={requirementsPageStyles.assetIcon} aria-hidden="true">
                          <RequirementsIcon name="upload" />
                        </span>
                        <p className={requirementsPageStyles.assetTitle}>{asset.title}</p>
                        <p className={requirementsPageStyles.assetDescription}>{asset.description}</p>
                        <p className={requirementsPageStyles.assetStatus}>Upload not configured</p>
                      </div>
                    ))}
                  </div>
                  <div className={requirementsPageStyles.tileSpacing}>
                    <SelectTile
                      buttonRef={assetsRef}
                      label="Skip assets"
                      selected={requirements.assetsSkipped}
                      onClick={() => updateField('assetsSkipped', !requirements.assetsSkipped)}
                      icon="check"
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </div>
                  <ValidationError id="assets-error">{errors.assets}</ValidationError>
                </SectionCard>

                <SectionCard title="Additional Notes" sectionRef={notesSectionRef} delay={0.28} shouldReduceMotion={shouldReduceMotion}>
                  <label htmlFor="requirement-notes" className="sr-only">Additional Notes</label>
                  <textarea
                    id="requirement-notes"
                    ref={notesRef}
                    value={requirements.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Anything else you'd like DevPilot AI to know before generating your website?"
                    className={`${requirementsPageStyles.notesTextareaBase} ${
                      errors.notes ? requirementsPageStyles.errorBorder : requirementsPageStyles.defaultBorder
                    }`}
                    aria-invalid={Boolean(errors.notes)}
                    aria-describedby={errors.notes ? 'notes-error' : undefined}
                  />
                  <div className={requirementsPageStyles.tileSpacing}>
                    <SelectTile
                      label="No additional notes"
                      selected={requirements.noAdditionalNotes}
                      onClick={() => updateField('noAdditionalNotes', !requirements.noAdditionalNotes)}
                      icon="check"
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </div>
                  <ValidationError id="notes-error">{errors.notes}</ValidationError>
                </SectionCard>
              </div>

              <aside className={requirementsPageStyles.sideRail}>
                <SummaryPanel
                  summary={summary}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </aside>
            </div>
          </div>
        </main>

        <div className={requirementsPageStyles.bottomBar}>
          <div className={requirementsPageStyles.bottomInner}>
            <motion.button
              type="button"
              onClick={() => navigate('/prompt')}
              className={requirementsPageStyles.backButton}
              disabled={isSaving}
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={buttonMotion}
            >
              Back
            </motion.button>

            <motion.button
              type="button"
              onClick={handleContinue}
              className={requirementsPageStyles.continueButton}
              disabled={isSaving}
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={buttonMotion}
            >
              {isSaving ? 'Saving...' : 'Continue to Inspiration'}
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={requirementsPageStyles.continueIcon} aria-hidden="true">
                <path d="M3 7h8M8 4l3 3-3 3" />
              </svg>
            </motion.button>
            <ValidationError id="requirements-save-error">{continueError}</ValidationError>
          </div>
        </div>
      </div>
    </div>
  )
}

function RequirementsHeader({ user, onMenuToggle }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <header className={requirementsPageStyles.header}>
      <div className={requirementsPageStyles.headerInner}>
        <div className={requirementsPageStyles.headerLeft}>
          <motion.button
            type="button"
            className={requirementsPageStyles.menuButton}
            aria-label="Open navigation"
            onClick={onMenuToggle}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={requirementsPageStyles.icon} aria-hidden="true">
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          </motion.button>

          <div className={requirementsPageStyles.headerText}>
            <p className={requirementsPageStyles.headerTitle}>Project Requirements</p>
            <p className={requirementsPageStyles.headerSubtitle}>Refine the build brief.</p>
          </div>
        </div>

        <div className={requirementsPageStyles.headerActions}>
          <a
            href="/dashboard/pricing"
            className={requirementsPageStyles.pricingLink}
          >
            Pricing
          </a>
          <span className={requirementsPageStyles.planPill}>
            Free Plan
          </span>
          <motion.button
            type="button"
            className={requirementsPageStyles.notificationButton}
            aria-label="Notifications"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={buttonMotion}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={requirementsPageStyles.icon} aria-hidden="true">
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

function RequirementsSidebar({ isOpen, onClose }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      <div
        className={`${requirementsPageStyles.mobileOverlay} ${
          isOpen ? requirementsPageStyles.mobileOverlayOpen : requirementsPageStyles.mobileOverlayClosed
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={`${requirementsPageStyles.sidebarBase} ${
          isOpen ? requirementsPageStyles.sidebarOpen : requirementsPageStyles.sidebarClosed
        }`}
        aria-label="Requirements navigation"
      >
        <div className={requirementsPageStyles.sidebarTop}>
          <a
            href="/dashboard"
            className={requirementsPageStyles.brand}
          >
            <span className={requirementsPageStyles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none" className={requirementsPageStyles.brandIcon}>
                <rect x="4" y="10" width="22" height="22" rx="7" fill="currentColor" />
                <rect x="20" y="2" width="14" height="14" rx="5" fill="currentColor" />
              </svg>
            </span>
            <span className={requirementsPageStyles.brandText}>DevPilot AI</span>
          </a>

          <button
            type="button"
            className={requirementsPageStyles.closeButton}
            aria-label="Close navigation"
            onClick={onClose}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={requirementsPageStyles.icon} aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <a
          href="/prompt"
          className={requirementsPageStyles.newProjectLink}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={requirementsPageStyles.icon} aria-hidden="true">
            <path d="M8 3v10M3 8h10" />
          </svg>
          New Project
        </a>

        <nav className={requirementsPageStyles.nav} aria-label="Sidebar">
          {NAV_ITEMS.map((item) => (
            <motion.a
              key={item.id}
              href={item.href}
              className={requirementsPageStyles.navItem}
              whileHover={shouldReduceMotion ? undefined : { x: 2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <RequirementsIcon name={item.icon} />
              <span className="truncate">{item.label}</span>
            </motion.a>
          ))}
        </nav>

        <div className={requirementsPageStyles.sidebarStatus}>
          <p className={requirementsPageStyles.sidebarTitle}>Requirements</p>
          <p className={requirementsPageStyles.sidebarText}>Current build step</p>
        </div>

        <div className={requirementsPageStyles.sidebarPlan}>
          <p className={requirementsPageStyles.sidebarTitle}>Free Plan</p>
          <p className={requirementsPageStyles.sidebarPlanText}>Starter workspace</p>
          <a
            href="/dashboard/pricing"
            className={requirementsPageStyles.upgradeLink}
          >
            Upgrade
          </a>
        </div>
      </aside>
    </>
  )
}

function ProgressSteps() {
  return (
    <ol className={requirementsPageStyles.progressList}>
      {FLOW_STEPS.map((step, index) => {
        const isActive = step === 'Requirements'
        const isComplete = index === 0
        return (
          <li key={step} className={requirementsPageStyles.progressItem}>
            <span className={`${requirementsPageStyles.progressPillBase} ${
              isActive
                ? requirementsPageStyles.progressActive
                : isComplete
                  ? requirementsPageStyles.progressComplete
                  : requirementsPageStyles.progressDefault
            }`}>
              {isComplete && <RequirementsIcon name="check" />}
              {step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function SectionCard({ title, description, optional, children, delay, sectionRef, shouldReduceMotion }) {
  return (
    <motion.section
      ref={sectionRef}
      className={requirementsPageStyles.sectionCard}
      aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.34, delay: shouldReduceMotion ? 0 : delay, ease: EASE }}
    >
      <div className={requirementsPageStyles.sectionHeader}>
        <div className={requirementsPageStyles.sectionTitleRow}>
          <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`} className={requirementsPageStyles.sectionTitle}>
            {title}
          </h2>
          {optional && <span className={requirementsPageStyles.optional}>Optional</span>}
        </div>
        {description && <p className={requirementsPageStyles.sectionDescription}>{description}</p>}
      </div>
      {children}
    </motion.section>
  )
}

function Field({ label, meta, error, errorId, children }) {
  return (
    <label className={requirementsPageStyles.field}>
      <FieldLabel meta={meta}>{label}</FieldLabel>
      {children}
      <ValidationError id={errorId}>{error}</ValidationError>
    </label>
  )
}

function ValidationError({ id, children }) {
  if (!children) return null

  return (
    <motion.p
      id={id}
      className={requirementsPageStyles.validationError}
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      {children}
    </motion.p>
  )
}

function FieldLabel({ children, meta }) {
  return (
    <span className={requirementsPageStyles.fieldLabel}>
      <span>{children}</span>
      {meta && <span className={requirementsPageStyles.fieldMeta}>{meta}</span>}
    </span>
  )
}

function inputClass(hasError) {
  return `${requirementsPageStyles.inputBase} ${
    hasError ? requirementsPageStyles.errorBorder : requirementsPageStyles.defaultBorder
  }`
}

function TileGrid({ children }) {
  return <div className={requirementsPageStyles.tileGrid}>{children}</div>
}

function SelectTile({ label, selected, onClick, icon, buttonRef, shouldReduceMotion }) {
  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className={`${requirementsPageStyles.tileBase} ${
        selected
          ? requirementsPageStyles.tileSelected
          : requirementsPageStyles.tileDefault
      }`}
      onClick={onClick}
      aria-pressed={selected}
      whileHover={shouldReduceMotion ? undefined : { y: -1 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={buttonMotion}
    >
      <RequirementsIcon name={icon} />
      <span className="truncate">{label}</span>
    </motion.button>
  )
}

function ColorPicker({ label, value, onChange, error, errorId, firstButtonRef, shouldReduceMotion }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={requirementsPageStyles.colorGrid}>
        {COLORS.map((color, index) => {
          const selected = value === color.name
          return (
            <motion.button
              key={color.name}
              ref={index === 0 ? firstButtonRef : undefined}
              type="button"
              className={`${requirementsPageStyles.colorButtonBase} ${
                selected ? requirementsPageStyles.colorSelected : error ? requirementsPageStyles.errorBorder : requirementsPageStyles.defaultBorder
              }`}
              onClick={() => onChange(color.name)}
              aria-pressed={selected}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              transition={buttonMotion}
            >
              <span className={requirementsPageStyles.colorSwatch} style={{ backgroundColor: color.value }}>
                {selected && (
                  <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={requirementsPageStyles.colorCheck} aria-hidden="true">
                    <path d="M2.5 6.2l2.1 2.1 4.9-5" />
                  </svg>
                )}
              </span>
              <span className="truncate">{color.name}</span>
            </motion.button>
          )
        })}
      </div>
      <ValidationError id={errorId}>{error}</ValidationError>
    </div>
  )
}

function SummaryPanel({ summary, shouldReduceMotion }) {
  const nextSteps = [
    'AI analyzes your requirements',
    'Generates frontend',
    'Creates backend',
    'Creates database',
    'Builds live preview',
  ]

  return (
    <motion.section
      className={requirementsPageStyles.summary}
      aria-label="Project requirements summary"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.34, delay: shouldReduceMotion ? 0 : 0.1, ease: EASE }}
    >
      <div className={requirementsPageStyles.summaryPanel}>
        <h2 className={requirementsPageStyles.summaryHeading}>What happens next?</h2>
        <ul className={requirementsPageStyles.summaryList}>
          {nextSteps.map((step) => (
            <li key={step} className={requirementsPageStyles.summaryStep}>
              <span className={requirementsPageStyles.summaryStepIcon} aria-hidden="true"><RequirementsIcon name="check" /></span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={requirementsPageStyles.summaryBlock}>
        <h2 className={requirementsPageStyles.summaryHeading}>Project Summary</h2>
        <dl className={requirementsPageStyles.summaryDefinitionList}>
          {Object.entries(summary).map(([label, value]) => (
            <motion.div
              key={label}
              className={requirementsPageStyles.summaryItem}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
            >
              <dt className={requirementsPageStyles.summaryTerm}>{label}</dt>
              <dd className={requirementsPageStyles.summaryValue}>{value}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </motion.section>
  )
}

function RequirementsIcon({ name }) {
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

  if (name === 'projects' || name === 'page') {
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

  if (name === 'feature') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M10 3l6 3.2-6 3.2-6-3.2L10 3Z" />
        <path d="M4 9.2l6 3.2 6-3.2M4 12.4l6 3.2 6-3.2" />
      </svg>
    )
  }

  if (name === 'desktop') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <rect x="3" y="4" width="14" height="10" rx="2" />
        <path d="M8 17h4M10 14v3" />
      </svg>
    )
  }

  if (name === 'tablet') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <rect x="5" y="2.5" width="10" height="15" rx="2" />
        <path d="M9 14.5h2" />
      </svg>
    )
  }

  if (name === 'mobile') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <rect x="6.5" y="2.5" width="7" height="15" rx="2" />
        <path d="M9 14.5h2" />
      </svg>
    )
  }

  if (name === 'upload') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={common} aria-hidden="true">
        <path d="M10 13V4M6.5 7.5L10 4l3.5 3.5" />
        <path d="M4 14.5v1A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-1" />
      </svg>
    )
  }

  if (name === 'check') {
    return (
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
        <path d="M2.5 6.2l2.1 2.1 4.9-5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={common} aria-hidden="true">
      <circle cx="10" cy="10" r="6" />
    </svg>
  )
}
