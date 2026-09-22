const FOCUS_CLASS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black'
const LINK_MOTION =
  'no-underline transition-[color,transform] duration-200 ease-[ease] hover:translate-x-0.5 hover:text-dp-black motion-reduce:transition-none motion-reduce:hover:translate-x-0'

export const footerStyles = {
  section:
    'border-t border-dp-border bg-dp-white px-6 pb-7 pt-[clamp(64px,8vw,104px)] text-dp-near-black max-[640px]:px-4 max-[640px]:pb-6 max-[640px]:pt-14 landing-scroll-target',
  container: 'mx-auto max-w-[1180px]',
  mainGrid:
    'grid grid-cols-[minmax(240px,1.5fr)_minmax(0,2.5fr)] gap-[clamp(52px,9vw,132px)] max-[900px]:grid-cols-[minmax(210px,1fr)_minmax(0,2fr)] max-[900px]:gap-12 max-[640px]:grid-cols-[minmax(0,1fr)] max-[640px]:gap-12',
  brandBlock: 'max-w-[330px] max-[640px]:max-w-[390px]',
  logoLink: `inline-flex rounded-[4px] ${FOCUS_CLASS}`,
  logo: 'block h-auto w-[190px] max-w-full',
  tagline:
    'm-0 mt-7 text-base font-semibold leading-[1.4] tracking-[-0.01em] max-[640px]:mt-6',
  description: 'm-0 mt-3 text-[14px] leading-[1.6] text-dp-text',
  groupGrid:
    'grid grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[900px]:gap-y-10 max-[640px]:grid-cols-1 max-[640px]:gap-9',
  groupTitle:
    'mb-[18px] mt-0.5 p-0 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-dp-near-black max-[640px]:mb-[14px]',
  groupList: 'm-0 flex list-none flex-col gap-3 p-0 max-[640px]:gap-[11px]',
  link:
    `inline-flex w-fit rounded-[3px] text-[14px] leading-[1.4] text-dp-text max-[640px]:min-h-7 max-[640px]:items-center ${LINK_MOTION} ${FOCUS_CLASS}`,
  bottom:
    'mt-[clamp(56px,8vw,96px)] flex items-center justify-between gap-6 border-t border-dp-border pt-6 max-[640px]:mt-12 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5 max-[640px]:pt-5',
  copyright: 'm-0 text-[12.5px] leading-[1.5] text-dp-muted',
  legalNav: 'flex items-center gap-5 max-[640px]:flex-wrap max-[640px]:gap-[18px]',
  legalLink:
    `inline-flex w-fit rounded-[3px] text-[12.5px] leading-[1.4] text-dp-text ${LINK_MOTION} ${FOCUS_CLASS}`,
}
