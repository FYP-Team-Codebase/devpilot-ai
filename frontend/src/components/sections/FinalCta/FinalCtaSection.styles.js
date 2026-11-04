const BUTTON_CLASS =
  'min-h-[50px] items-center justify-center rounded-full px-5 py-3 text-[14.5px] font-semibold no-underline transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[ease] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-white active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full'

export const finalCtaStyles = {
  section:
    "relative overflow-hidden bg-dp-black px-6 pb-[clamp(70px,8vw,104px)] pt-[clamp(82px,9vw,124px)] text-dp-white before:absolute before:inset-[18px] before:pointer-events-none before:rounded-[22px] before:border before:border-[rgba(255,255,255,0.13)] before:content-[''] after:absolute after:left-[10%] after:right-[10%] after:top-0 after:h-px after:bg-[rgba(255,255,255,0.22)] after:content-[''] after:pointer-events-none max-[640px]:px-4 max-[640px]:pb-[66px] max-[640px]:pt-[76px] max-[640px]:before:inset-3 max-[640px]:before:rounded-[18px] landing-scroll-target",
  content: 'relative z-[1] mx-auto flex max-w-[920px] flex-col items-center text-center',
  promptChip:
    'mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-3 py-2 font-mono text-[11px] font-medium tracking-[0.05em] text-[rgba(255,255,255,0.72)] max-[640px]:mb-6',
  promptChevron: 'text-dp-white',
  chipCursor: 'ml-px h-[13px] w-px bg-[rgba(255,255,255,0.8)]',
  heading:
    'm-0 flex max-w-[900px] flex-col text-[clamp(2.7rem,calc(2rem+3.25vw),5.6rem)] font-bold leading-[0.94] tracking-[-0.055em] max-[640px]:text-[clamp(2.35rem,11vw,3.7rem)] max-[640px]:leading-[0.97]',
  description:
    'm-0 mt-[26px] max-w-[560px] text-[clamp(1.02rem,calc(0.97rem+0.28vw),1.14rem)] leading-[1.58] text-[rgba(255,255,255,0.68)] max-[640px]:mt-5',
  actions:
    'mt-8 flex flex-wrap items-center justify-center gap-3 max-[640px]:mt-[30px] max-[640px]:w-full max-[640px]:flex-col',
  primaryCta: `${BUTTON_CLASS} group/primary gap-2.5 border border-dp-white bg-dp-white text-dp-black hover:-translate-y-0.5 hover:bg-[#f0f0f0] hover:shadow-[0_8px_18px_rgba(0,0,0,0.2)]`,
  secondaryCta: `${BUTTON_CLASS} border border-[rgba(255,255,255,0.35)] bg-transparent text-dp-white hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)]`,
  ctaArrow:
    'text-[17px] leading-[0] transition-transform duration-200 ease-[ease] group-hover/primary:translate-x-0.5 motion-reduce:translate-x-0 motion-reduce:transition-none',
  preview:
    'mt-[clamp(40px,5vw,56px)] w-[min(100%,610px)] rounded-[14px] border border-[rgba(255,255,255,0.19)] bg-[rgba(255,255,255,0.045)] px-4 pb-[15px] pt-[14px] text-left text-[rgba(255,255,255,0.76)] max-[640px]:mt-9 max-[640px]:px-[14px] max-[640px]:py-[13px]',
  previewHeader:
    'flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.12)] pb-3 font-mono text-[10.5px] font-medium tracking-[0.04em] max-[640px]:text-[9.5px]',
  previewPrompt: 'text-[rgba(255,255,255,0.62)]',
  previewStatus: 'inline-flex items-center gap-1.5 text-[rgba(255,255,255,0.72)]',
  previewStatusDot: 'h-[5px] w-[5px] rounded-full bg-dp-white',
  previewText:
    'mx-0 my-[17px] text-[clamp(0.9rem,calc(0.87rem+0.15vw),0.98rem)] leading-[1.55] text-dp-white max-[640px]:my-[15px]',
  previewCursor: 'ml-[3px] inline-block h-[15px] w-px bg-[rgba(255,255,255,0.85)] align-[-2px]',
  previewFooter:
    'flex items-center justify-start gap-[9px] border-t border-[rgba(255,255,255,0.12)] pt-[11px] font-mono text-[10.5px] font-medium tracking-[0.04em] text-[rgba(255,255,255,0.45)] max-[640px]:text-[9.5px]',
}
