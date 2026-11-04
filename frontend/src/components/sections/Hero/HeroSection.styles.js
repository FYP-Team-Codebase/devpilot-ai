export const heroStyles = {
  section:
    'relative overflow-hidden bg-dp-white pb-[clamp(64px,8vw,96px)] landing-scroll-target',
  backdrop:
    'pointer-events-none absolute inset-0 z-0 bg-[image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[length:96px_96px] bg-[position:center_top] opacity-[0.18] [-webkit-mask-image:radial-gradient(ellipse_60%_50%_at_50%_10%,black_0%,transparent_68%)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_10%,black_0%,transparent_68%)]',
  container:
    'relative z-[1] mx-auto flex max-w-[1280px] flex-col items-center px-6 pb-0 pt-[clamp(126px,15vw,176px)] max-[640px]:px-4 max-[640px]:pt-[clamp(112px,34vw,134px)]',
  content: 'flex w-full flex-col items-center text-center',
  eyebrow:
    'm-0 mb-5 font-mono text-[12.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  headline:
    'm-0 mb-6 flex max-w-[900px] flex-col font-sans text-[clamp(2.3rem,calc(1.7rem+2.7vw),4.2rem)] font-bold leading-[0.92] tracking-[-0.045em] text-dp-black',
  description:
    'mx-auto mb-8 mt-0 max-w-[520px] font-sans text-[clamp(1rem,calc(0.93rem+0.3vw),1.1rem)] font-normal leading-[1.55] text-dp-text',
  actions: 'flex flex-wrap items-center justify-center gap-3 max-[640px]:w-full max-[640px]:flex-col',
  primaryCta:
    'whitespace-nowrap rounded-full bg-dp-black px-[26px] py-[13px] font-sans text-[15px] font-semibold text-dp-white no-underline transition-colors duration-200 ease-[ease] hover:bg-dp-near-black max-[640px]:w-full max-[640px]:text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-dp-black',
  secondaryCta:
    'whitespace-nowrap rounded-full border border-dp-border-dark bg-transparent px-[25px] py-3 font-sans text-[15px] font-medium text-dp-black no-underline transition-[background-color,border-color] duration-200 ease-[ease] hover:bg-dp-surface max-[640px]:w-full max-[640px]:text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-dp-black',
  workflow:
    'mt-[clamp(40px,6vw,56px)] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2',
  workflowGroup: 'inline-flex items-center gap-2.5 max-[640px]:gap-2',
  workflowLabel:
    'font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-dp-muted',
  workflowArrow: 'text-[12px] text-dp-border-dark',
}
