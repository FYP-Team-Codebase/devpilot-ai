export const projectGridStyles = {
  section:
    'mb-5 rounded-dp-control border border-dp-border bg-white p-5 shadow-dp-card max-sm:p-4',
  header: 'mb-4 flex items-center justify-between gap-3',
  heading:
    'm-0 text-lg font-bold leading-tight tracking-[-0.03em] text-dp-black',
  viewAll:
    'inline-flex cursor-pointer items-center gap-[3px] rounded-full px-2.5 py-1.5 text-[12.5px] font-medium text-dp-text no-underline transition-colors duration-150 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  viewAllIcon: 'h-3 w-3',
  grid: 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 max-sm:grid-cols-1',
  skeleton:
    'overflow-hidden rounded-dp-control border border-dp-border bg-white',
  shimmer:
    'bg-[linear-gradient(90deg,var(--color-dp-off-white),var(--color-dp-border),var(--color-dp-off-white))] bg-[length:200%_100%] animate-[shimmer_1.3s_ease-in-out_infinite]',
  skeletonPreview: 'aspect-[16/10]',
  skeletonBody: 'p-3',
  skeletonLineLarge: 'h-2.5 w-2/3 rounded-[3px]',
  skeletonLineSmall: 'mt-2 h-2.5 w-2/5 rounded-[3px]',
  empty:
    'flex min-h-[300px] flex-col items-center justify-center rounded-dp-control border border-dashed border-dp-border bg-dp-page px-6 py-9 text-center',
  emptyIconWrap:
    'grid h-12 w-12 place-items-center rounded-dp-control border border-dp-border bg-white text-dp-black',
  emptyIcon: 'h-5 w-5',
  emptyTitle:
    'm-0 mt-4 text-[15px] font-semibold tracking-[-0.02em] text-dp-black',
  emptyCopy: 'mt-1.5 text-[13px] leading-6 text-dp-muted',
  emptyButton:
    'group mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-dp-control border border-dp-black bg-dp-black px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
  emptyButtonIcon:
    'h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5',
  error:
    'flex items-center justify-between gap-3 rounded-dp-control border border-dp-border bg-dp-page px-4 py-3',
  errorText: 'm-0 text-[13px] text-dp-text',
  retryButton:
    'shrink-0 cursor-pointer rounded-dp-control border border-dp-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-dp-black transition-[background-color,border-color,color] duration-200 hover:border-dp-border-dark hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-dp-page',
}
