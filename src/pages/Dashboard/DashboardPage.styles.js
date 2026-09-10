export const dashboardPageStyles = {
  page: 'min-h-dvh overflow-x-hidden bg-dp-page text-dp-near-black',
  appFrame: 'flex min-h-dvh',
  shell: 'flex min-w-0 flex-1 flex-col md:ml-dp-sidebar',
  main: 'min-h-[calc(100dvh-var(--spacing-dp-header))]',
  mainInner:
    'mx-auto max-w-dp-content px-6 py-5 max-lg:px-5 max-md:px-4 max-sm:px-3.5',
  homeGrid:
    'grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5 max-lg:grid-cols-1',
  homeMain: 'min-w-0',
  homeAside: 'grid min-w-0 gap-5',
  pageHeading: 'mb-5',
  pageTitle:
    'm-0 text-[24px] font-bold leading-tight tracking-[-0.03em] text-dp-black',
  pageDescription: 'mt-1.5 text-sm leading-6 text-dp-text',
  toolbar: 'mb-5 flex flex-wrap items-end justify-between gap-4',
  primaryButton:
    'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  primaryButtonWhiteOffset:
    'mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-dp-control border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  filterBar: 'mb-4 flex min-w-0 gap-2 overflow-x-auto pb-1',
  filterButtonBase:
    'shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  filterButtonActive: 'border-dp-black bg-dp-black text-white',
  filterButtonDefault:
    'border-dp-border bg-white text-dp-black hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black',
  emptyPanel:
    'rounded-dp-control border border-dashed border-dp-border bg-white p-8 text-center shadow-dp-card',
  emptyIcon:
    'mx-auto grid h-11 w-11 place-items-center rounded-dp-control border border-dp-border bg-dp-page text-dp-black',
  emptyTitle:
    'm-0 mt-4 text-[18px] font-bold tracking-[-0.03em] text-dp-black',
  emptyText:
    'mx-auto m-0 mt-2 max-w-sm text-[13.5px] leading-6 text-dp-muted',
  modalOverlay: 'fixed inset-0 z-50 grid place-items-center bg-black/35 p-5 max-sm:p-3',
  modalPanel:
    'w-[min(92vw,460px)] rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-modal',
  modalPanelNarrow:
    'w-[min(92vw,440px)] rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-modal',
  modalHeader: 'flex items-start justify-between gap-4',
  modalTitle:
    'm-0 text-[20px] font-bold tracking-[-0.04em] text-dp-black',
  modalCopy: 'm-0 mt-2 text-[13.5px] leading-6 text-dp-text',
  modalClose:
    'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-dp-border bg-white text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  modalNotice:
    'mt-5 rounded-dp-control border border-dashed border-dp-border bg-dp-page p-5 text-center',
  modalNoticeCompact:
    'mt-5 rounded-dp-control border border-dashed border-dp-border bg-dp-page p-4',
  modalNoticeTitle: 'm-0 text-[13px] font-semibold text-dp-black',
  modalNoticeText: 'm-0 mt-1 text-[12.5px] leading-5 text-dp-muted',
  pricingSection: 'mx-auto max-w-[980px] py-6 max-md:py-4',
  pricingIntro: 'mx-auto max-w-[720px] text-center',
  pricingEyebrow:
    'm-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-dp-muted',
  pricingHeading:
    'm-0 mt-4 text-[54px] font-bold leading-[0.95] tracking-[-0.055em] text-dp-black max-lg:text-[48px] max-sm:text-[38px]',
  pricingCopy:
    'mx-auto m-0 mt-5 max-w-[560px] text-[18px] leading-7 text-dp-muted max-sm:text-[16px] max-sm:leading-6',
  pricingGrid:
    'mx-auto mt-14 grid max-w-[1080px] grid-cols-3 items-stretch gap-7 max-xl:gap-5 max-lg:grid-cols-2 max-md:mt-9 max-md:grid-cols-1',
  pricingFooter: 'mt-10 text-center',
  compareButton:
    'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-dp-border bg-white px-4 py-2 text-[13px] font-semibold text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  pricingNote: 'm-0 mt-4 text-center text-[12.5px] leading-5 text-dp-muted',
  planCardBase: 'relative flex flex-col',
  planCardFeatured:
    'min-h-[500px] rounded-dp-feature border border-dp-border bg-white p-7 text-dp-black shadow-[0_24px_70px_rgba(0,0,0,0.10),0_2px_10px_rgba(0,0,0,0.04)] md:-mt-5 max-md:min-h-0 max-md:p-6',
  planCardDefault:
    'min-h-[460px] border border-transparent bg-transparent px-4 py-7 text-dp-black max-md:min-h-0 max-md:rounded-dp-feature max-md:border-dp-border max-md:bg-white max-md:p-6',
  popularBadge:
    'absolute right-5 top-5 rounded-full bg-dp-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white',
  planHeaderBase: 'flex items-start justify-between gap-3',
  planHeaderFeatured: 'pr-28 max-sm:pr-0',
  planName:
    'm-0 text-[15px] font-bold uppercase tracking-[0.08em] text-dp-black',
  planDescriptionBase: 'm-0 mt-5 w-full text-[14px] leading-6 text-dp-muted',
  planDescriptionFeatured: 'max-w-[300px]',
  planDescriptionDefault: 'max-w-[320px]',
  planPriceWrapPro: 'mt-14',
  planPriceWrapDefault: 'mt-12',
  planPricePro:
    'text-[58px] font-bold leading-none tracking-[-0.07em] text-dp-black max-sm:text-[48px]',
  planPriceDefault:
    'text-[48px] font-bold leading-none tracking-[-0.07em] text-dp-black max-sm:text-[42px]',
  planPeriod: 'pb-1.5 text-[14px] font-medium text-dp-muted',
  planActions: 'mt-auto pt-10',
  currentButton:
    'inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black',
  darkPlanButton:
    'group inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  lightPlanButton:
    'group inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  planButtonIcon: 'text-[13px] transition-transform duration-200 group-hover:translate-x-0.5',
  contactButton:
    'inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-dp-border bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  currentPill:
    'shrink-0 rounded-full border border-dp-border bg-white px-2.5 py-1 text-[11px] font-semibold text-dp-black',
  currentPlanButtonBase:
    'inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium',
  featureList: 'm-0 mt-14 grid gap-3.5 p-0 text-[14px] leading-5 text-dp-text',
  featureItem: 'flex items-start gap-2.5',
  featureCheck:
    'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-dp-border text-dp-black',
  comparison:
    'mx-auto mt-5 max-w-[900px] overflow-hidden rounded-2xl border border-dp-border bg-white shadow-dp-card',
  comparisonHeader: 'border-b border-dp-border px-5 py-4',
  comparisonHeading: 'm-0 text-[16px] font-bold tracking-[-0.03em] text-dp-black',
  tableWrap: 'overflow-x-auto',
  table: 'w-full min-w-[760px] border-collapse text-left text-[13px]',
  tableHeadRow: 'border-b border-dp-border text-[11px] uppercase tracking-[0.12em] text-dp-muted',
  tableHeader: 'px-5 py-3 font-semibold',
  tableCurrent: 'normal-case tracking-normal text-dp-black',
  tableRow: 'border-b border-dp-border last:border-b-0',
  tableFeature: 'px-5 py-3.5 font-semibold text-dp-black',
  tableCell: 'px-5 py-3.5 text-dp-text',
  profileCard: 'rounded-xl border border-dp-border bg-white p-5 shadow-dp-card',
  profileHeader: 'flex flex-wrap items-center gap-4 border-b border-dp-border pb-5',
  profileAvatar:
    'grid h-14 w-14 shrink-0 place-items-center rounded-full bg-dp-black text-[18px] font-bold tracking-wide text-white',
  profileIdentity: 'min-w-0',
  profileName:
    'm-0 truncate text-[20px] font-bold tracking-[-0.04em] text-dp-black',
  profileEmail: 'm-0 mt-1 truncate text-[13.5px] leading-5 text-dp-muted',
  profileBody: 'pt-5',
  panel: 'mb-4 rounded-xl border border-dp-border bg-white p-5 shadow-dp-card',
  panelLast:
    'mb-4 rounded-xl border border-dp-border bg-white p-5 shadow-dp-card last:mb-0',
  panelTitle: 'm-0 mb-3.5 text-sm font-bold tracking-tight text-dp-black',
  unavailable:
    'mt-5 rounded-xl border border-dashed border-dp-border bg-dp-page p-4',
  detailRow:
    'flex items-center justify-between gap-4 border-t border-dp-border py-2.5 first:border-t-0 first:pt-0 last:pb-0',
  detailLabel: 'text-xs font-semibold uppercase tracking-widest text-dp-muted',
  detailValue: 'min-w-0 text-right text-[13.5px] font-medium text-dp-black',
  sidebarOverlay: 'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 md:hidden',
  sidebarOverlayOpen: 'opacity-100',
  sidebarOverlayClosed: 'pointer-events-none opacity-0',
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
  sidebarClose:
    'grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-dp-muted transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden',
  sidebarNav: 'mt-7 flex flex-1 flex-col gap-1',
  sidebarNavItemBase:
    'flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  sidebarNavItemActive: 'bg-dp-black text-white',
  sidebarNavItemDefault: 'text-dp-text hover:bg-dp-surface hover:text-dp-black',
  logoutButton:
    'mt-4 flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-3 text-left text-[13px] font-medium text-dp-text transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  aiTips:
    'flex min-h-[218px] flex-col rounded-xl border border-white/10 bg-[linear-gradient(135deg,#10172B_0%,#171A3B_52%,#27205A_100%)] p-5 text-white shadow-[0_8px_20px_rgba(16,23,43,0.18)]',
  aiTipsHeader: 'flex items-center gap-2',
  aiTipsIcon:
    'grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white',
  aiTipsTitle:
    'm-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/85',
  aiTipsCopy: 'mt-5 text-sm font-medium leading-6 text-white/88',
  aiTipsFooter: 'mt-auto flex items-center justify-between gap-3 pt-5',
  aiTipsDots: 'flex items-center gap-1.5',
  aiTipsDot: 'h-1.5 rounded-full bg-white',
  aiTipsButton:
    'cursor-pointer rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors duration-200 hover:border-white/20 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171A3B]',
  upgrade:
    'rounded-xl border border-dp-black bg-dp-black p-5 text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]',
  upgradeGrid: 'grid grid-cols-[1fr_auto] items-center gap-5 max-md:grid-cols-1',
  upgradeContent: 'min-w-0',
  upgradeHeader: 'flex items-center gap-3',
  upgradeIcon:
    'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-white',
  upgradeTitle:
    'm-0 text-lg font-bold leading-tight tracking-[-0.03em] text-white',
  upgradeCopy: 'm-0 mt-1 text-[13px] leading-5 text-white/65',
  upgradeList:
    'mt-4 grid grid-cols-2 gap-x-6 gap-y-2 p-0 text-[13px] text-white/85 max-sm:grid-cols-1',
  upgradeFeature: 'flex items-center gap-2',
  upgradeFeatureIcon: 'text-white',
  upgradeLink:
    'inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white bg-white px-5 py-2.5 text-sm font-medium text-dp-black no-underline transition-colors duration-200 hover:bg-neutral-100 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dp-black max-md:w-fit',
}
