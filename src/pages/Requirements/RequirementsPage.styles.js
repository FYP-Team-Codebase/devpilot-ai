export const requirementsPageStyles = {
  page: 'min-h-dvh overflow-x-hidden bg-dp-page font-sans text-dp-near-black',
  shell: 'flex min-h-dvh min-w-0 flex-col md:ml-dp-sidebar',
  main:
    'min-h-[calc(100dvh-var(--spacing-dp-header))] px-6 pb-24 pt-7 max-lg:px-5 max-md:px-4 max-sm:px-3.5',
  content: 'mx-auto w-full max-w-dp-content',
  introRow: 'flex flex-wrap items-end justify-between gap-4',
  heading:
    'm-0 text-[clamp(2rem,3.4vw,2.5rem)] font-bold leading-tight tracking-[-0.045em] text-dp-black',
  introText: 'm-0 mt-2 max-w-[620px] text-[15px] leading-6 text-dp-text',
  bodyGrid:
    'mt-6 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 max-lg:grid-cols-1',
  formStack: 'grid min-w-0 gap-5',
  initialPrompt:
    'mb-4 rounded-dp-control border border-dp-border bg-dp-page px-4 py-3',
  initialPromptLabel:
    'm-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  initialPromptText: 'm-0 mt-1 line-clamp-2 text-[13px] leading-5 text-dp-text',
  twoColumn: 'grid grid-cols-2 gap-4 max-md:grid-cols-1',
  fieldSpacing: 'mt-4',
  twoColumnLoose: 'mt-5 grid grid-cols-2 gap-5 max-md:grid-cols-1',
  assetGrid: 'grid grid-cols-3 gap-3 max-md:grid-cols-1',
  assetCard:
    'rounded-dp-control border border-dashed border-dp-border bg-dp-page p-4',
  assetIcon:
    'grid h-9 w-9 place-items-center rounded-lg border border-dp-border bg-white text-dp-black',
  assetTitle: 'm-0 mt-3 text-[13.5px] font-semibold text-dp-black',
  assetDescription: 'm-0 mt-1 text-[12.5px] leading-5 text-dp-muted',
  assetStatus: 'm-0 mt-3 text-[11.5px] font-medium text-dp-muted',
  tileSpacing: 'mt-3',
  notesTextareaBase:
    'min-h-[132px] w-full resize-none rounded-dp-control border bg-white px-3.5 py-3 font-sans text-sm leading-6 text-dp-black outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-dp-muted focus:border-neutral-500 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.035)]',
  errorBorder: 'border-red-700',
  defaultBorder: 'border-dp-border',
  sideRail: 'sticky top-24 grid gap-5 max-lg:static',
  bottomBar:
    'sticky bottom-0 z-20 border-t border-dp-border bg-dp-page/92 px-6 py-3 backdrop-blur-sm max-md:px-4 max-sm:px-3.5',
  bottomInner:
    'mx-auto flex w-full max-w-dp-content items-center justify-between gap-3',
  backButton:
    'inline-flex min-h-10 cursor-pointer items-center justify-center rounded-dp-control border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  continueButton:
    'group inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  continueIcon:
    'h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5',
  header: 'sticky top-0 z-30 border-b border-dp-border bg-dp-page/95 backdrop-blur-xl',
  headerInner:
    'flex min-h-dp-header items-center justify-between gap-4 px-6 max-md:px-4',
  headerLeft: 'flex min-w-0 items-center gap-3',
  menuButton:
    'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page md:hidden',
  headerText: 'min-w-0',
  headerTitle: 'm-0 text-[15px] font-semibold tracking-[-0.02em] text-dp-black',
  headerSubtitle: 'm-0 mt-0.5 truncate text-[12.5px] leading-5 text-dp-muted',
  headerActions: 'flex min-w-0 items-center justify-end gap-2.5',
  pricingLink:
    'hidden h-8 shrink-0 cursor-pointer items-center rounded-full border border-dp-border bg-white px-3 text-[12px] font-semibold text-dp-black no-underline transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page sm:inline-flex',
  planPill:
    'inline-flex h-8 shrink-0 items-center rounded-full border border-dp-border bg-white px-3 text-[12px] font-semibold text-dp-black',
  notificationButton:
    'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-text transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  mobileOverlay: 'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 md:hidden',
  mobileOverlayOpen: 'opacity-100',
  mobileOverlayClosed: 'pointer-events-none opacity-0',
  sidebarBase:
    'fixed inset-y-0 left-0 z-50 flex h-screen w-dp-sidebar flex-col overflow-hidden border-r border-dp-border bg-white px-3 py-4 transition-transform duration-200 md:top-0 md:z-40 md:translate-x-0',
  sidebarOpen: 'translate-x-0',
  sidebarClosed: '-translate-x-full',
  sidebarTop: 'flex h-9 items-center justify-between px-2',
  brand:
    'flex items-center gap-2 rounded-lg text-dp-black no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  brandMark: 'grid h-7 w-7 place-items-center rounded-lg bg-dp-black text-white',
  brandIcon: 'h-4.5 w-4.5',
  brandText: 'text-[14px] font-semibold tracking-[-0.02em]',
  closeButton:
    'grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-dp-muted transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden',
  newProjectLink:
    'mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-4 text-[13px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  nav: 'mt-5 flex flex-col gap-1',
  navItem:
    'flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium text-dp-text no-underline transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  sidebarStatus:
    'mt-6 rounded-dp-control border border-dp-border bg-dp-page p-3',
  sidebarPlan:
    'mt-auto rounded-dp-control border border-dp-border bg-dp-page p-3',
  sidebarTitle: 'm-0 text-[13px] font-semibold text-dp-black',
  sidebarText: 'm-0 mt-1 text-[11.5px] leading-5 text-dp-muted',
  sidebarPlanText: 'm-0 mt-0.5 text-[11.5px] leading-5 text-dp-muted',
  upgradeLink:
    'mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-dp-control border border-dp-black bg-dp-black px-3 text-[12.5px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  progressList: 'flex flex-wrap items-center gap-2 p-0',
  progressItem: 'flex items-center gap-2',
  progressPillBase:
    'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold',
  progressActive: 'border-dp-black bg-dp-black text-white',
  progressComplete: 'border-dp-border bg-white text-dp-black',
  progressDefault: 'border-dp-border bg-white text-dp-muted',
  sectionCard:
    'rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-card max-sm:p-4',
  sectionHeader: 'mb-4',
  sectionTitleRow: 'flex items-baseline justify-between gap-3',
  sectionTitle:
    'm-0 text-[18px] font-bold leading-tight tracking-[-0.03em] text-dp-black',
  optional: 'shrink-0 text-[11.5px] font-medium text-dp-muted',
  sectionDescription: 'm-0 mt-1 text-[13px] leading-5 text-dp-muted',
  field: 'block',
  validationError: 'm-0 mt-1.5 text-[12px] font-medium text-red-700',
  fieldLabel:
    'mb-2 flex items-baseline justify-between gap-2 text-[12.5px] font-semibold text-dp-black',
  fieldMeta: 'text-[11.5px] font-medium text-dp-muted',
  inputBase:
    'h-10 w-full rounded-dp-control border bg-white px-3.5 font-sans text-sm text-dp-black outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-dp-muted focus:border-neutral-500 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.035)]',
  tileGrid: 'grid grid-cols-3 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1',
  tileBase:
    'flex min-h-12 cursor-pointer items-center gap-2.5 rounded-dp-control border px-3.5 py-3 text-left text-[13px] font-semibold transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  tileSelected: 'border-dp-black bg-dp-black text-white',
  tileDefault:
    'border-dp-border bg-white text-dp-black hover:border-neutral-400 hover:bg-neutral-50 hover:text-dp-black',
  colorGrid: 'grid grid-cols-2 gap-2',
  colorButtonBase:
    'flex h-10 cursor-pointer items-center gap-2 rounded-dp-control border bg-white px-3 text-left text-[12.5px] font-semibold text-dp-black transition-[border-color,box-shadow] duration-200 hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  colorSelected: 'border-dp-black shadow-[0_0_0_1px_rgba(0,0,0,0.08)]',
  colorSwatch:
    'grid h-5 w-5 shrink-0 place-items-center rounded-full border border-black/10',
  colorCheck:
    'h-3 w-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]',
  summary:
    'rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-card',
  summaryPanel:
    'rounded-dp-control border border-dp-border bg-dp-page p-4',
  summaryHeading:
    'm-0 text-[16px] font-bold tracking-[-0.03em] text-dp-black',
  summaryList: 'm-0 mt-4 grid gap-2 p-0',
  summaryStep: 'flex items-start gap-2 text-[13px] leading-5 text-dp-text',
  summaryStepIcon: 'mt-0.5 text-dp-black',
  summaryBlock: 'mt-5',
  summaryDefinitionList: 'm-0 mt-3 grid gap-3',
  summaryItem: 'border-t border-dp-border pt-3 first:border-t-0 first:pt-0',
  summaryTerm:
    'text-[11px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  summaryValue:
    'm-0 mt-1 line-clamp-2 text-[13px] font-medium leading-5 text-dp-black',
  icon: 'h-4 w-4 shrink-0',
}
