export const dashboardHeaderStyles = {
  header: 'sticky top-0 z-30 border-b border-dp-border bg-dp-page/95 backdrop-blur-xl',
  inner:
    'flex min-h-dp-header items-center justify-between gap-4 px-6 max-md:px-4',
  titleGroup: 'flex min-w-0 items-center gap-3',
  menuButton:
    'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page md:hidden',
  menuIcon: 'h-4 w-4',
  titleTextWrap: 'min-w-0',
  eyebrow: 'm-0 text-[15px] font-semibold tracking-[-0.02em] text-dp-black',
  subheading: 'm-0 mt-0.5 truncate text-[12.5px] leading-5 text-dp-muted',
  actions: 'flex min-w-0 items-center justify-end gap-2.5',
  searchBase:
    'flex h-9 w-[min(260px,24vw)] items-center gap-2 rounded-full border bg-white px-3 transition-colors duration-150 max-md:hidden',
  searchFocused: 'border-dp-black shadow-[0_0_0_3px_rgba(0,0,0,0.04)]',
  searchDefault: 'border-dp-border',
  searchIcon: 'h-3.5 w-3.5 shrink-0 text-dp-muted',
  searchInput:
    'min-w-0 flex-1 border-none bg-transparent p-0 font-sans text-[12.5px] text-dp-black outline-none placeholder:text-dp-muted',
  planPill:
    'inline-flex h-8 shrink-0 items-center rounded-full border border-dp-border bg-white px-3 text-[12px] font-semibold text-dp-black',
  notificationWrap: 'relative shrink-0',
  notificationButton:
    'relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-text transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  unreadBadge:
    'absolute right-1.5 top-1.5 grid min-h-2 min-w-2 place-items-center rounded-full bg-dp-black text-[9px] font-bold leading-none text-white',
  popover:
    'absolute right-0 top-[calc(100%+8px)] z-[100] w-[min(calc(100vw-24px),320px)] overflow-hidden rounded-2xl border border-dp-border bg-white shadow-dp-popover',
  popoverHeader: 'flex items-center justify-between gap-3 px-4 py-3',
  popoverTitle: 'm-0 text-[13.5px] font-semibold text-dp-black',
  unreadPill:
    'shrink-0 rounded-full border border-dp-border bg-dp-page px-2 py-1 text-[11px] font-semibold text-dp-muted',
  divider: 'h-px bg-dp-border',
  notificationList: 'max-h-[320px] overflow-y-auto py-1',
  notificationItem:
    'block w-full cursor-pointer border-0 bg-transparent px-4 py-3 text-left transition-colors duration-100 hover:bg-dp-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset',
  notificationTitle: 'block text-[13px] font-semibold text-dp-black',
  notificationDescription: 'mt-1 block text-[12.5px] leading-5 text-dp-muted',
  empty: 'px-4 py-5 text-center',
  emptyTitle: 'm-0 text-[13.5px] font-semibold text-dp-black',
  emptyText: 'm-0 mt-1 text-[12.5px] leading-5 text-dp-muted',
}
