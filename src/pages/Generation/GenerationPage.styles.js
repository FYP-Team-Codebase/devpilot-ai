export const generationPageStyles = {
  page: 'mx-auto w-full max-w-dp-content px-0 py-1 text-dp-near-black',
  hero:
    'rounded-dp-panel border border-dp-border bg-white p-6 shadow-dp-card max-md:p-5 max-sm:p-4',
  heroTop: 'flex flex-wrap items-start justify-between gap-4',
  eyebrow:
    'm-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-dp-muted',
  title:
    'm-0 mt-3 text-[clamp(2rem,4vw,3.15rem)] font-bold leading-[0.98] tracking-[-0.055em] text-dp-black',
  intro: 'm-0 mt-4 max-w-[680px] text-[15px] leading-6 text-dp-text',
  statusBase:
    'inline-flex min-h-8 items-center rounded-full border px-3 text-[12px] font-semibold',
  statusReady: 'border-dp-success-border bg-dp-success-surface text-dp-success-text',
  statusDraft: 'border-dp-border bg-dp-page text-dp-muted',
  statusGenerating: 'border-dp-border-dark bg-dp-surface text-dp-black',
  statusCompleted: 'border-dp-success-border bg-dp-success-surface text-dp-success-text',
  statusFailed: 'border-dp-error-border bg-dp-error-surface text-dp-error-text',
  actionRow: 'mt-6 flex flex-wrap items-center gap-3',
  secondaryLink:
    'inline-flex min-h-10 items-center justify-center rounded-dp-control border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  helperText: 'm-0 w-full text-[12.5px] leading-5 text-dp-muted',
  layout:
    'mt-5 grid grid-cols-[minmax(0,1fr)_340px] items-start gap-5 max-lg:grid-cols-1',
  stack: 'grid min-w-0 gap-5',
  panel:
    'min-w-0 rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-card max-sm:p-4',
  panelHeader: 'mb-4 flex flex-wrap items-start justify-between gap-3',
  panelTitle:
    'm-0 text-[18px] font-bold leading-tight tracking-[-0.03em] text-dp-black',
  panelDescription: 'm-0 mt-1 text-[13px] leading-5 text-dp-muted',
  summaryList: 'm-0 grid gap-4 p-0',
  summaryItem: 'border-t border-dp-border pt-4 first:border-t-0 first:pt-0',
  summaryTerm:
    'text-[11px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  summaryValue: 'm-0 mt-1 text-[13.5px] font-medium leading-6 text-dp-black',
  promptBox:
    'rounded-dp-control border border-dp-border bg-dp-page px-4 py-3 text-[13.5px] leading-6 text-dp-text',
  tagList: 'mt-2 flex flex-wrap gap-2',
  tag:
    'inline-flex max-w-full items-center rounded-full border border-dp-border bg-dp-page px-3 py-1.5 text-[12.5px] font-semibold text-dp-black',
  emptyText: 'm-0 mt-2 text-[13px] leading-5 text-dp-muted',
  notes: 'm-0 rounded-dp-control border border-dp-border bg-dp-page px-4 py-3 text-[13.5px] leading-6 text-dp-text',
  inspirationGrid: 'grid gap-3',
  inspirationCard:
    'grid min-w-0 grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-dp-control border border-dp-border bg-white p-3 max-sm:grid-cols-1',
  inspirationImage:
    'h-20 w-full rounded-lg border border-dp-border bg-dp-page object-cover max-sm:h-32',
  inspirationFallback:
    'grid h-20 w-full place-items-center rounded-lg border border-dashed border-dp-border bg-dp-page text-[12px] font-semibold text-dp-muted max-sm:h-32',
  inspirationBody: 'min-w-0',
  inspirationLabel:
    'm-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  inspirationId:
    'm-0 mt-1 break-words text-[13.5px] font-semibold leading-5 text-dp-black',
  actionPanel:
    'sticky top-[calc(var(--spacing-dp-header)+20px)] min-w-0 rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-card max-lg:static max-sm:p-4',
  actionTitle:
    'm-0 text-[17px] font-bold tracking-[-0.03em] text-dp-black',
  actionCopy: 'm-0 mt-2 text-[13.5px] leading-6 text-dp-muted',
  actionButton:
    'mt-5 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-dp-control border border-dp-border bg-dp-surface px-5 py-2.5 text-sm font-semibold text-dp-muted',
  editLinks: 'mt-4 grid gap-2',
  stateWrap:
    'grid min-h-[52vh] place-items-center rounded-dp-control border border-dp-border bg-white p-8 text-center shadow-dp-card max-sm:p-5',
  stateContent: 'max-w-[460px]',
  stateTitle:
    'm-0 text-[24px] font-bold tracking-[-0.04em] text-dp-black',
  stateText:
    'm-0 mt-3 text-[14px] leading-6 text-dp-muted',
  stateActions: 'mt-5 flex flex-wrap justify-center gap-3',
  retryButton:
    'inline-flex min-h-10 cursor-pointer items-center justify-center rounded-dp-control border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  skeleton:
    'mx-auto h-3 w-full max-w-[320px] animate-pulse rounded-full bg-dp-surface',
}
