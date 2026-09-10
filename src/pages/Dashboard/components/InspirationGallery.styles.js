export const inspirationGalleryStyles = {
  page: 'pb-20',
  headingRow: 'mb-6 flex flex-wrap items-end justify-between gap-4',
  heading:
    'm-0 text-[clamp(2rem,3.4vw,2.5rem)] font-bold leading-tight tracking-[-0.045em] text-dp-black',
  intro: 'm-0 mt-2 max-w-[620px] text-[15px] leading-6 text-dp-text',
  primaryButton:
    'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  bottomBar:
    'fixed bottom-0 left-0 right-0 z-20 border-t border-dp-border bg-dp-page/92 px-6 py-3 backdrop-blur-sm md:left-dp-sidebar max-md:px-4 max-sm:px-3.5',
  bottomInner:
    'mx-auto flex w-full max-w-dp-content items-center justify-between gap-3',
  secondaryButton:
    'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  bottomActions: 'flex min-w-0 flex-col items-end',
  modalOverlay: 'fixed inset-0 z-50 grid place-items-center bg-black/35 p-5 max-sm:p-3',
  detailOverlay: 'fixed inset-0 z-50 grid place-items-center bg-black/45 p-5 max-sm:p-3',
  addModal:
    'w-[min(92vw,480px)] rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-modal',
  modalHeader: 'flex items-start justify-between gap-4',
  modalTitle:
    'm-0 text-[20px] font-bold tracking-[-0.04em] text-dp-black',
  modalCopy: 'm-0 mt-2 text-[13.5px] leading-6 text-dp-text',
  iconButton:
    'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-dp-border bg-white text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  modalNotice:
    'mt-5 rounded-dp-control border border-dashed border-dp-border bg-dp-page p-5 text-center',
  noticeTitle: 'm-0 text-[13px] font-semibold text-dp-black',
  noticeText: 'm-0 mt-1 text-[12.5px] leading-5 text-dp-muted',
  overviewGrid:
    'grid grid-cols-[minmax(0,1fr)_286px] items-start gap-5 max-lg:grid-cols-1',
  overviewBlock: 'block',
  coversSection: 'min-w-0',
  cardsGrid: 'grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1',
  selectionPanel:
    'sticky top-20 min-w-0 rounded-dp-control border border-dp-border bg-white p-4 shadow-dp-card outline-none max-lg:static',
  selectionHeader: 'flex items-baseline justify-between gap-3',
  selectionTitle:
    'm-0 text-[16px] font-bold tracking-[-0.03em] text-dp-black',
  selectionCount: 'shrink-0 text-[12px] font-medium text-dp-muted',
  selectionGrid:
    'mt-4 grid gap-3 max-lg:grid-cols-3 max-md:flex max-md:overflow-x-auto max-md:pb-1',
  emptySelection:
    'mt-4 rounded-dp-control border border-dashed border-dp-border bg-dp-page p-4',
  briefPanel: 'mt-4 rounded-dp-control border border-dp-border bg-dp-page p-4',
  filterWrap:
    'mb-4 flex min-w-0 items-center justify-between gap-3 max-sm:block',
  filterList: 'flex min-w-0 gap-2 overflow-x-auto pb-1',
  filterButtonBase:
    'shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  filterButtonActive: 'border-dp-black bg-dp-black text-white',
  filterButtonDefault:
    'border-dp-border bg-white text-dp-black hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black',
  resultCount: 'm-0 shrink-0 text-[12.5px] font-medium text-dp-muted max-sm:mt-2',
  skeletonGrid: 'grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1',
  skeletonCard:
    'overflow-hidden rounded-dp-control border border-dp-border bg-white',
  skeletonPreview: 'aspect-[4/3] bg-neutral-100 motion-safe:animate-pulse',
  skeletonBody: 'p-3.5',
  skeletonLineTitle: 'h-4 w-32 rounded bg-neutral-100 motion-safe:animate-pulse',
  skeletonLineMeta: 'mt-2 h-3 w-40 rounded bg-neutral-100 motion-safe:animate-pulse',
  message:
    'rounded-dp-control border border-dashed border-dp-border bg-white p-6 text-center',
  messageTitle: 'm-0 text-[14px] font-semibold text-dp-black',
  messageBody: 'm-0 mt-2 text-[13px] leading-5 text-dp-muted',
  coverBase:
    'group min-w-0 cursor-pointer overflow-hidden rounded-dp-control border bg-white p-0 text-left shadow-dp-card transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  coverSelected: 'border-dp-black',
  coverDefault: 'border-dp-border hover:border-dp-border-dark',
  coverMedia: 'aspect-[4/3] overflow-hidden border-b border-dp-border bg-neutral-100',
  coverBody:
    'grid min-h-[82px] grid-cols-[1fr_auto] items-start gap-3 p-3.5',
  coverTitle:
    'm-0 truncate text-[16px] font-bold leading-tight tracking-[-0.03em] text-dp-black',
  coverMeta: 'm-0 mt-1 truncate text-[13px] leading-5 text-dp-muted',
  selectedBadge:
    'inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg bg-dp-black px-2.5 text-[12px] font-semibold text-white',
  detailModal:
    'flex h-[90dvh] w-[min(94vw,1400px)] min-w-0 flex-col overflow-hidden rounded-dp-control border border-dp-border bg-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]',
  detailHeader:
    'flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-dp-border px-5 py-4 max-sm:px-4',
  detailBack:
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-border bg-white px-3.5 py-2 text-[13px] font-semibold text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  detailMeta: 'flex min-w-0 items-center gap-2 text-[12.5px] font-medium text-dp-muted',
  detailGrid:
    'grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_390px] max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:block max-lg:overflow-y-auto',
  screensPane:
    'flex min-h-0 flex-col border-r border-dp-border bg-dp-page p-5 max-lg:border-r-0 max-lg:border-b max-sm:p-4',
  screensTitle: 'm-0 mb-4 text-[15px] font-bold tracking-[-0.02em] text-dp-black',
  detailAside: 'min-h-0 overflow-y-auto p-5 max-lg:overflow-visible max-sm:p-4',
  focusTarget: 'outline-none',
  detailCategory: 'm-0 text-[13px] font-semibold text-dp-muted',
  detailTitle:
    'm-0 mt-1 text-[26px] font-bold leading-tight tracking-[-0.045em] text-dp-black',
  detailSubtitle: 'm-0 mt-2 text-[13px] font-medium leading-5 text-dp-text',
  detailSection: 'mt-7 border-t border-dp-border pt-5',
  detailSectionTitle:
    'm-0 text-[14px] font-bold tracking-[-0.02em] text-dp-black',
  detailSectionText: 'm-0 mt-3 text-[13.5px] leading-6 text-dp-text',
  selectButtonBase:
    'mt-7 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-dp-control border px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  selectButtonActive:
    'border-dp-black bg-white text-dp-black hover:bg-neutral-50 hover:text-dp-black',
  selectButtonDefault:
    'border-dp-black bg-dp-black text-white hover:bg-neutral-800 hover:text-white',
  carousel: 'flex min-h-0 flex-1 flex-col',
  viewport:
    'relative h-[320px] overflow-hidden rounded-dp-control border border-dp-border bg-neutral-100 sm:h-[420px] lg:h-[min(56dvh,560px)] xl:h-[min(60dvh,620px)]',
  scrollArea:
    'absolute inset-0 overflow-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset',
  imageFrameBase: 'min-h-full min-w-full p-3 sm:p-4',
  imageFrameFull: 'flex items-start justify-center touch-pan-y',
  imageFrameFit: 'flex h-full items-center justify-center touch-pan-y',
  imageBase: 'block h-auto object-contain',
  imageFull: 'max-w-none object-top',
  imageFit: 'w-auto object-center',
  fullPageHint:
    'pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-dp-border bg-white/92 px-3 py-1 text-[11px] font-medium text-dp-muted shadow-[0_4px_14px_rgba(0,0,0,0.08)]',
  carouselCount: 'mt-3 text-center text-[12.5px] font-medium text-dp-muted',
  thumbnails: 'mt-3 flex gap-2 overflow-x-auto pb-1',
  thumbnailBase:
    'h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-white p-0 transition-[border-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page max-sm:h-14 max-sm:w-20',
  thumbnailActive: 'border-dp-black opacity-100',
  thumbnailDefault: 'border-dp-border opacity-65 hover:border-dp-border-dark hover:opacity-90',
  thumbnailImage: 'h-full w-full object-cover object-top',
  zoomToolbar:
    'absolute right-3 top-3 z-20 inline-flex items-center overflow-hidden rounded-dp-control border border-dp-border bg-white/95 text-dp-black shadow-[0_6px_18px_rgba(0,0,0,0.10)]',
  zoomButton:
    'grid h-9 w-9 cursor-pointer place-items-center text-[16px] font-semibold transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-dp-muted disabled:opacity-45',
  zoomOutButton: 'border-r border-dp-border',
  zoomInButton: 'border-l border-r border-dp-border',
  zoomValue: 'min-w-14 px-2 text-center text-[12px] font-semibold text-dp-black',
  zoomFit:
    'h-9 cursor-pointer px-3 text-[12px] font-semibold text-dp-black transition-colors duration-200 hover:bg-neutral-50',
  arrowBase:
    'absolute top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-dp-border bg-white/92 text-dp-black shadow-[0_6px_18px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-colors duration-200 hover:border-dp-border-dark hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  arrowPrevious: 'left-3',
  arrowNext: 'right-3',
  loadError:
    'grid h-full w-full place-items-center px-4 text-center text-[12.5px] font-medium text-dp-muted',
  image: 'block',
  missingPreview: 'grid h-full w-full place-items-center px-4 text-center',
  missingPreviewTitle: 'm-0 text-[14px] font-semibold text-dp-black',
  missingPreviewText: 'm-0 mt-1 text-[12.5px] leading-5 text-dp-muted',
  selectedItem:
    'grid min-w-0 grid-cols-[72px_minmax(0,1fr)_32px] items-center gap-3 rounded-dp-control border border-dp-border bg-dp-page p-2 max-md:min-w-[240px]',
  selectedImage:
    'h-12 w-[72px] rounded-lg border border-dp-border object-cover object-top',
  selectedFallback:
    'grid h-12 w-[72px] place-items-center rounded-lg border border-dp-border bg-white text-[10px] font-semibold text-dp-muted',
  selectedText: 'min-w-0',
  selectedTitle: 'm-0 truncate text-[13px] font-semibold text-dp-black',
  selectedCategory: 'm-0 mt-0.5 truncate text-[12px] text-dp-muted',
  selectedRemove:
    'grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-dp-border bg-white text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  progressList: 'flex flex-wrap items-center gap-2 p-0',
  progressItem: 'flex items-center gap-2',
  progressPillBase:
    'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold',
  progressActive: 'border-dp-black bg-dp-black text-white',
  progressComplete: 'border-dp-border bg-white text-dp-black',
  progressDefault: 'border-dp-border bg-white text-dp-muted',
  requirementSummary: 'm-0 mt-3 grid gap-2',
  requirementSummaryItem: 'min-w-0 border-t border-dp-border pt-2 first:border-t-0 first:pt-0',
  requirementSummaryTerm: 'text-[11px] font-semibold text-dp-muted',
  requirementSummaryValue:
    'm-0 mt-0.5 line-clamp-2 text-[12.5px] font-medium leading-5 text-dp-black',
  validationError: 'm-0 mb-2 text-[12px] font-medium text-red-700',
}
