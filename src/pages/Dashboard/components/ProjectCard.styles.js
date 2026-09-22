export const projectCardStyles = {
  card:
    'group flex cursor-pointer flex-col overflow-hidden rounded-dp-control border border-dp-border bg-white text-inherit no-underline shadow-dp-card animate-[fadeUp_0.35s_ease_both] transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-px hover:border-dp-border-dark hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  preview:
    'aspect-[16/10] overflow-hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px),var(--color-dp-off-white)] bg-[size:20px_20px]',
  thumbnail: 'w-full h-full object-cover',
  placeholder: 'grid place-items-center w-full h-full text-dp-border-dark',
  placeholderIcon: 'w-7 h-7 opacity-40',
  body: 'px-3.5 pb-3.5 pt-3',
  header: 'flex items-start justify-between gap-2',
  title:
    'm-0 text-[13px] font-semibold tracking-tight text-dp-black overflow-hidden text-ellipsis whitespace-nowrap',
  menuButton:
    'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-dp-muted transition-[background-color,color] duration-100 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-1 focus-visible:ring-offset-white',
  menuIcon: 'w-3.5 h-3.5',
  meta: 'flex items-center gap-1.5 mt-1 text-[11.5px] text-dp-muted',
  open:
    'mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-dp-text transition-colors duration-150 group-hover:text-dp-black',
  openIcon: 'w-3 h-3',
}
