export const userMenuStyles = {
  root: 'relative',
  trigger:
    'flex cursor-pointer items-center gap-2 rounded-full border border-dp-border bg-white py-1 pr-2 pl-1 text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  avatar:
    'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-dp-black text-[11px] font-bold tracking-wide text-white',
  displayName: 'max-w-28 truncate text-[13px] font-semibold text-dp-black max-sm:hidden',
  chevron: 'w-3 h-3 text-dp-muted transition-transform duration-150',
  chevronOpen: 'rotate-180',
  menu:
    'absolute right-0 top-[calc(100%+8px)] z-[100] w-[220px] overflow-hidden rounded-2xl border border-dp-border bg-white shadow-dp-popover',
  menuHeader: 'flex items-center gap-2.5 p-3 px-3.5',
  menuAvatar:
    'grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dp-black text-xs font-bold text-white',
  menuIdentity: 'flex flex-col min-w-0',
  menuName:
    'text-[13px] font-semibold text-dp-black overflow-hidden text-ellipsis whitespace-nowrap',
  menuEmail:
    'text-[11.5px] text-dp-muted overflow-hidden text-ellipsis whitespace-nowrap',
  divider: 'h-px bg-dp-border',
  item:
    'block w-full cursor-pointer border-0 bg-transparent px-3.5 py-2 text-left text-[13px] font-medium text-dp-black transition-colors duration-100 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset',
}
