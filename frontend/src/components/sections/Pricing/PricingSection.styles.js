export const pricingStyles = {
  section:
    'overflow-hidden border-t border-dp-border bg-dp-off-white px-6 pb-[clamp(88px,11vw,152px)] pt-[clamp(80px,10vw,136px)] max-[900px]:px-5 max-[700px]:px-4 max-[700px]:pb-20 max-[700px]:pt-[72px] landing-scroll-target',
  container: 'mx-auto max-w-[1180px]',
  header:
    'mx-auto mb-[clamp(48px,6vw,72px)] max-w-[600px] text-center max-[700px]:mb-12 max-[700px]:text-left',
  eyebrow: 'm-0 font-mono text-[12px] font-medium uppercase tracking-[0.12em]',
  headerEyebrow: 'mb-[18px] text-dp-muted',
  heading:
    'm-0 mb-4 font-sans text-[clamp(2.15rem,calc(1.7rem+2vw),3.35rem)] font-bold leading-none tracking-[-0.04em] text-dp-black',
  subheading:
    'mx-auto my-0 max-w-[460px] text-[clamp(1rem,calc(0.95rem+0.2vw),1.1rem)] leading-[1.6] text-dp-text max-[700px]:ml-0',
  grid:
    'grid grid-cols-3 items-end gap-[clamp(16px,2.2vw,28px)] max-[900px]:gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-5',
  motionShell: 'min-w-0',
  card:
    'relative flex min-h-[470px] flex-col rounded-[18px] border border-dp-border-dark bg-dp-white p-[clamp(26px,3vw,34px)] shadow-dp-card transition-[border-color,box-shadow,transform] duration-[250ms] ease-[ease] hover:border-[#b8b8b8] hover:-translate-y-[5px] hover:shadow-[0_18px_32px_rgba(0,0,0,0.07),0_3px_8px_rgba(0,0,0,0.03)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[900px]:min-h-[454px] max-[900px]:px-[22px] max-[900px]:py-[26px] max-[700px]:min-h-0 max-[700px]:px-6 max-[700px]:py-7',
  featuredCard:
    'min-h-[496px] -translate-y-3 border-dp-black bg-[#fcfcfc] shadow-[0_18px_34px_rgba(0,0,0,0.08),0_3px_8px_rgba(0,0,0,0.03)] hover:-translate-y-[17px] hover:border-dp-black hover:shadow-[0_24px_42px_rgba(0,0,0,0.1),0_4px_10px_rgba(0,0,0,0.04)] motion-reduce:hover:translate-y-0 max-[900px]:min-h-[470px] max-[900px]:-translate-y-2 max-[900px]:hover:-translate-y-[13px] max-[700px]:translate-y-0 max-[700px]:hover:translate-y-0',
  badge:
    'absolute right-6 top-0 -translate-y-1/2 rounded-full bg-dp-black px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.09em] text-dp-white',
  intro: 'min-h-[190px] max-[900px]:min-h-[202px] max-[700px]:min-h-0',
  planName: 'text-dp-text',
  priceRow: 'mt-[22px] flex items-baseline gap-[7px]',
  price:
    'text-[clamp(2.85rem,calc(2.2rem+2vw),4rem)] font-bold leading-[0.9] tracking-[-0.055em] text-dp-black',
  period: 'text-[13px] font-medium text-dp-text',
  description: 'm-0 mt-[22px] text-[14px] leading-[1.55] text-dp-text',
  featureList:
    'mb-8 mt-7 flex list-none flex-col gap-[13px] border-t border-dp-border p-0 pt-6 max-[700px]:mb-7',
  featureItem:
    "relative pl-[22px] text-[14px] leading-[1.35] text-dp-near-black before:absolute before:left-0 before:top-[-1px] before:text-[14px] before:font-semibold before:text-dp-black before:content-['✓']",
  cardCta:
    'mt-auto flex min-h-[46px] items-center justify-center rounded-full border border-dp-border-dark bg-dp-white px-4 py-[11px] text-[14px] font-semibold text-dp-black no-underline [transition:background-color_0.2s_ease,color_0.2s_ease,border-color_0.2s_ease,transform_0.15s_ease] hover:border-dp-black hover:bg-dp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-dp-black active:scale-[0.985] motion-reduce:transition-none',
  featuredCta:
    'border-dp-black !bg-dp-white !text-dp-black hover:!bg-dp-surface hover:!text-dp-black active:!text-dp-black disabled:!bg-dp-white disabled:!text-dp-near-black',
}
