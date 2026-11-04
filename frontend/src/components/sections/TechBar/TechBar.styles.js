export const techBarStyles = {
  section: 'overflow-hidden border-y border-dp-border bg-dp-white py-6 max-[640px]:py-5',
  viewport: 'group/viewport w-full overflow-hidden',
  track:
    'flex w-max items-center gap-[30px] will-change-transform max-[640px]:gap-[22px] motion-reduce:will-change-auto',
  sequenceItem: 'flex shrink-0 items-center gap-[14px] max-[640px]:gap-2.5',
  item:
    'group/tech inline-flex items-center gap-2 opacity-100 transition-opacity duration-200 ease-[ease] group-hover/viewport:opacity-50 group-hover/tech:opacity-100',
  icon:
    'block h-[18px] w-[18px] object-contain opacity-80 transition-opacity duration-200 ease-[ease] group-hover/tech:opacity-100',
  label:
    'whitespace-nowrap font-sans text-[14px] font-medium text-dp-text transition-colors duration-200 ease-[ease] group-hover/tech:text-dp-black max-[640px]:text-[13px]',
  separator: 'shrink-0 select-none text-[15px] leading-none text-dp-border-dark',
}
