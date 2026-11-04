export const workflowSectionStyles = {
  section:
    'bg-dp-white px-6 py-[clamp(80px,10vw,140px)] max-[640px]:px-4 max-[640px]:py-16 landing-scroll-target',
  container: 'mx-auto max-w-[1180px]',
  header:
    'mx-auto mb-[clamp(72px,9vw,120px)] max-w-[640px] text-center max-[640px]:mb-14 max-[640px]:text-left',
  heading:
    'mb-[18px] m-0 flex flex-col font-sans text-[clamp(2rem,calc(1.6rem+1.8vw),3.15rem)] font-bold leading-[1.04] tracking-[-0.03em] text-dp-black',
  description:
    'mx-auto my-0 max-w-[480px] font-sans text-[clamp(1rem,calc(0.95rem+0.2vw),1.1rem)] font-normal leading-[1.6] text-dp-text max-[640px]:mx-0 max-[640px]:max-w-none',
  steps: 'relative flex flex-col gap-[clamp(72px,9vw,128px)] max-[640px]:gap-14',
  rail:
    'absolute bottom-[14px] left-[13px] top-[14px] z-0 w-0.5 bg-dp-border max-[520px]:bottom-[11px] max-[520px]:left-2.5 max-[520px]:top-[11px]',
  progressRail:
    'absolute bottom-[14px] left-[13px] top-[14px] z-0 w-0.5 origin-top bg-dp-black max-[520px]:bottom-[11px] max-[520px]:left-2.5 max-[520px]:top-[11px]',
}
