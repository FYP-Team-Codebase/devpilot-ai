export const promptPageStyles = {
  page: 'min-h-dvh overflow-x-hidden bg-dp-page font-sans text-dp-near-black',
  overlay: 'fixed inset-0 z-[55] bg-dp-page/45 backdrop-blur-[3px]',
  shell: 'flex min-h-dvh min-w-0 flex-col md:ml-dp-sidebar',
  main:
    'min-h-[calc(100dvh-var(--spacing-dp-header))] px-6 py-8 max-lg:px-5 max-md:px-4 max-sm:px-3.5',
  content: 'mx-auto flex w-full max-w-5xl flex-col items-center',
  intro: 'w-full text-center',
  heading:
    'm-0 text-[clamp(2.1rem,4.2vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.045em] text-dp-black',
  introText: 'mx-auto mt-3 max-w-[680px] text-[15.5px] leading-7 text-dp-text',
  formBase:
    'relative z-[60] mt-8 w-full overflow-hidden rounded-dp-control border bg-white text-left transition-[border-color] duration-200',
  formFocused: 'border-neutral-500',
  formDefault: 'border-dp-border',
  collapsedButton:
    'flex h-[68px] w-full cursor-pointer items-center gap-3 border-0 bg-white px-5 text-left text-dp-black outline-none transition-colors duration-200 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset max-sm:px-4',
  collapsedIcon:
    'grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dp-border bg-dp-page text-dp-black',
  collapsedPreviewBase: 'min-w-0 flex-1 truncate text-[15px] font-medium',
  collapsedPreviewFilled: 'text-dp-black',
  collapsedPreviewEmpty: 'text-dp-muted',
  chevronButton:
    'grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-dp-border bg-white text-dp-muted',
  chevronIcon: 'h-3 w-3',
  expandedBody: 'relative px-5 pb-8 pt-5 max-sm:px-4',
  collapseButton:
    'absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-dp-border bg-white text-dp-muted transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  textarea:
    'min-h-[170px] w-full resize-none border-0 bg-transparent p-0 pr-10 font-sans text-base font-medium leading-7 text-dp-black outline-none placeholder:text-dp-muted disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[150px]',
  count:
    'absolute bottom-3 right-5 text-[12px] font-medium text-dp-muted max-sm:right-4',
  controlsBar:
    'flex items-center justify-between gap-3 border-t border-dp-border bg-dp-panel px-4 py-3 max-md:flex-wrap',
  controlsLeft: 'flex min-w-0 flex-wrap items-center gap-2',
  footerNote: 'mt-7 text-center text-sm leading-6 text-dp-muted',
  inspirationLink:
    'group inline-flex items-center gap-1 font-semibold text-dp-black underline decoration-dp-border underline-offset-4 transition-colors duration-200 hover:text-dp-black hover:decoration-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  inspirationIcon:
    'h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5',
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
  newProjectButton:
    'mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-4 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  nav: 'mt-5 flex flex-col gap-1',
  navItemBase:
    'flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  navItemActive: 'bg-dp-black text-white',
  navItemDefault: 'text-dp-text hover:bg-dp-surface hover:text-dp-black',
  sidebarProjects: 'mt-6 min-h-0 flex-1',
  sidebarSectionLabel:
    'mb-2 px-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-dp-muted',
  recentGrid: 'grid gap-1.5',
  recentProject:
    'block rounded-lg px-3 py-2 text-dp-black no-underline transition-colors duration-150 hover:bg-dp-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  recentName: 'block truncate text-[12.5px] font-semibold',
  recentMeta: 'mt-0.5 block truncate text-[11.5px] text-dp-muted',
  sidebarEmpty:
    'rounded-dp-control border border-dp-border bg-dp-page px-3 py-4 text-center',
  sidebarEmptyIcon:
    'mx-auto grid h-9 w-9 place-items-center rounded-lg border border-dp-border bg-white text-dp-black',
  sidebarEmptyTitle: 'm-0 mt-3 text-[12.5px] font-semibold text-dp-black',
  sidebarEmptyText: 'm-0 mt-1 text-[11.5px] leading-5 text-dp-muted',
  sidebarPlan: 'mt-4 rounded-dp-control border border-dp-border bg-dp-page p-3',
  sidebarPlanTitle: 'm-0 text-[13px] font-semibold text-dp-black',
  sidebarPlanText: 'm-0 mt-0.5 text-[11.5px] leading-5 text-dp-muted',
  upgradeLink:
    'mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-dp-control border border-dp-black bg-dp-black px-3 text-[12.5px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  selectLabel:
    'relative inline-flex h-10 min-w-[150px] cursor-pointer items-center rounded-dp-control border border-dp-border bg-white text-sm font-medium text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 focus-within:border-dp-black focus-within:ring-2 focus-within:ring-dp-black focus-within:ring-offset-2 focus-within:ring-offset-dp-panel has-disabled:cursor-not-allowed has-disabled:opacity-60 max-sm:min-w-full',
  select:
    'h-full w-full cursor-pointer appearance-none rounded-dp-control border-0 bg-transparent px-3 pr-8 text-dp-black outline-none disabled:cursor-not-allowed',
  selectIcon: 'pointer-events-none absolute right-3 h-3 w-3 text-dp-muted',
  generateButton:
    'group inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-panel disabled:cursor-not-allowed disabled:opacity-40 max-md:ml-auto max-sm:w-full',
  pulseDot: 'h-2 w-2 rounded-full bg-white motion-safe:animate-pulse',
  generateIcon:
    'h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5',
  suggestions:
    'mt-5 flex w-full flex-wrap justify-center gap-2',
  suggestionButton:
    'cursor-pointer rounded-dp-control border border-dp-border bg-white px-3.5 py-2 text-[12.5px] font-semibold text-dp-black transition-colors duration-200 hover:border-dp-black hover:bg-dp-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page disabled:cursor-not-allowed disabled:opacity-50',
  featureStrip:
    'mt-8 grid w-full grid-cols-4 gap-px overflow-hidden rounded-dp-control border border-dp-border bg-dp-border max-lg:grid-cols-2 max-sm:grid-cols-1',
  featureCard: 'bg-white p-4',
  featureIconWrap:
    'grid h-9 w-9 place-items-center rounded-lg border border-dp-border bg-dp-page text-dp-black',
  featureTitle:
    'm-0 mt-3 text-[13.5px] font-bold tracking-[-0.02em] text-dp-black',
  featureText: 'm-0 mt-1 text-[12.5px] leading-5 text-dp-muted',
  icon: 'h-4 w-4 shrink-0',
}
