const focusDark = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black'
const focusLight = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-white'

const lightButton =
  `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-border-dark bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-dp-black hover:bg-dp-surface active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`

export const productsPageStyles = {
  page: 'min-h-dvh overflow-x-hidden bg-dp-white font-sans text-dp-near-black',
  section:
    'px-6 py-[clamp(78px,9vw,128px)] max-[700px]:px-4 max-[700px]:py-16',
  container: 'mx-auto max-w-[1180px]',
  hero:
    'relative overflow-hidden bg-dp-white px-6 pb-[clamp(70px,8vw,104px)] pt-[clamp(124px,14vw,164px)] max-[700px]:px-4 max-[700px]:pb-16 max-[700px]:pt-[118px]',
  heroGrid:
    'mx-auto grid max-w-[1280px] grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] items-center gap-[clamp(36px,6vw,82px)] max-[980px]:grid-cols-1',
  heroCopy: 'min-w-0',
  eyebrow:
    'm-0 mb-5 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  heroTitle:
    'm-0 max-w-[650px] text-[clamp(2.65rem,calc(2rem+3.15vw),5.35rem)] font-bold leading-[0.92] tracking-[-0.055em] text-dp-black max-[700px]:text-[clamp(2.35rem,12vw,3.85rem)]',
  heroDescription:
    'm-0 mt-6 max-w-[560px] text-[clamp(1rem,calc(0.96rem+0.2vw),1.1rem)] leading-[1.62] text-dp-text',
  heroActions:
    'mt-8 flex flex-wrap items-center gap-3 max-[640px]:w-full max-[640px]:flex-col',
  primaryCta:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-black bg-dp-black px-6 py-3 text-[14.5px] font-semibold text-white no-underline transition-[background-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-dp-near-black active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`,
  secondaryCta: lightButton,
  heroVisual:
    'relative min-w-0 rounded-[22px] border border-dp-border-dark bg-dp-white p-3 shadow-[0_20px_48px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] max-[700px]:rounded-[18px] max-[700px]:p-2',
  heroImage: 'block aspect-[1600/1280] w-full rounded-[16px] object-cover object-top max-[700px]:rounded-[12px]',
  heroCaption:
    'm-0 mt-3 border-t border-dp-border px-1 pt-3 font-mono text-[11px] leading-5 text-dp-muted',
  statementSection:
    'border-y border-dp-border bg-dp-off-white px-6 py-[clamp(76px,9vw,124px)] max-[700px]:px-4 max-[700px]:py-16',
  statementGrid:
    'mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] gap-[clamp(42px,7vw,92px)] max-[900px]:grid-cols-1',
  statement:
    'm-0 text-[clamp(2.1rem,calc(1.65rem+2.15vw),3.85rem)] font-bold leading-[1] tracking-[-0.045em] text-dp-black',
  principleList: 'm-0 grid gap-0 p-0',
  principleItem:
    'grid grid-cols-[minmax(132px,0.38fr)_minmax(0,1fr)] gap-5 border-t border-dp-border py-5 first:border-t-0 first:pt-0 max-[640px]:grid-cols-1 max-[640px]:gap-2',
  principleTitle:
    'm-0 text-[14px] font-semibold tracking-[-0.01em] text-dp-black',
  principleText:
    'm-0 text-[14px] leading-6 text-dp-text',
  workflowSection:
    'bg-dp-white px-6 py-[clamp(82px,10vw,142px)] max-[700px]:px-4 max-[700px]:py-16',
  sectionHeader: 'mx-auto mb-[clamp(46px,6vw,72px)] max-w-[660px] text-center max-[700px]:text-left',
  sectionTitle:
    'm-0 text-[clamp(2.1rem,calc(1.7rem+1.9vw),3.35rem)] font-bold leading-[1.02] tracking-[-0.04em] text-dp-black',
  sectionCopy:
    'mx-auto m-0 mt-5 max-w-[560px] text-[clamp(1rem,calc(0.95rem+0.2vw),1.1rem)] leading-[1.6] text-dp-text max-[700px]:mx-0',
  workflowGrid:
    'grid grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] items-start gap-[clamp(34px,5vw,70px)] max-[980px]:grid-cols-1',
  workflowList:
    'sticky top-24 grid gap-0 self-start border-y border-dp-border max-[980px]:static',
  workflowItem:
    'grid grid-cols-[48px_minmax(0,1fr)] gap-4 border-t border-dp-border py-5 first:border-t-0 max-[520px]:grid-cols-[38px_minmax(0,1fr)]',
  workflowIndex:
    'font-mono text-[12px] font-semibold text-dp-muted',
  workflowTitle:
    'm-0 text-[18px] font-bold leading-tight tracking-[-0.025em] text-dp-black',
  workflowText:
    'm-0 mt-2 text-[14px] leading-6 text-dp-text',
  visualStack: 'grid min-w-0 gap-5',
  imageFrame:
    'overflow-hidden rounded-[20px] border border-dp-border bg-white p-2.5 shadow-[0_18px_42px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] max-[700px]:rounded-[16px] max-[700px]:p-2',
  productImage: 'block w-full rounded-[14px] object-cover object-top max-[700px]:rounded-[11px]',
  imageCaption:
    'm-0 mt-3 px-1 text-[13px] leading-5 text-dp-muted',
  todaySection:
    'bg-dp-off-white px-6 py-[clamp(82px,10vw,136px)] max-[700px]:px-4 max-[700px]:py-16',
  todayGrid:
    'mx-auto grid max-w-[1180px] grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-[clamp(36px,6vw,82px)] max-[900px]:grid-cols-1',
  stickyIntro: 'sticky top-24 self-start max-[900px]:static',
  sectionLabel:
    'm-0 mb-4 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  capabilityGrid:
    'grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-dp-border bg-dp-border max-[640px]:grid-cols-1',
  capability:
    'min-h-[154px] bg-white p-5 max-[640px]:min-h-0',
  capabilityTitle:
    'm-0 text-[15px] font-bold leading-tight tracking-[-0.02em] text-dp-black',
  capabilityText:
    'm-0 mt-3 text-[13.5px] leading-6 text-dp-text',
  audienceSection:
    'bg-dp-white px-6 py-[clamp(78px,9vw,124px)] max-[700px]:px-4 max-[700px]:py-16',
  audienceList: 'mx-auto max-w-[980px] border-y border-dp-border',
  audienceRow:
    'grid grid-cols-[minmax(160px,0.42fr)_minmax(0,1fr)] gap-[clamp(24px,5vw,64px)] border-t border-dp-border py-6 first:border-t-0 max-[640px]:grid-cols-1 max-[640px]:gap-3',
  audienceName:
    'm-0 text-[clamp(1.45rem,calc(1.22rem+1vw),2.1rem)] font-bold leading-tight tracking-[-0.035em] text-dp-black',
  audienceText:
    'm-0 max-w-[620px] text-[15px] leading-7 text-dp-text',
  nextSection:
    'border-y border-dp-border bg-dp-page px-6 py-[clamp(78px,9vw,124px)] max-[700px]:px-4 max-[700px]:py-16',
  nextGrid:
    'mx-auto grid max-w-[1180px] grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] gap-[clamp(36px,6vw,82px)] max-[900px]:grid-cols-1',
  roadmapList:
    'grid gap-3',
  roadmapItem:
    'rounded-[16px] border border-dp-border bg-white px-5 py-4 shadow-dp-card',
  roadmapMeta:
    'm-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  roadmapTitle:
    'm-0 mt-2 text-[15px] font-bold tracking-[-0.02em] text-dp-black',
  roadmapText:
    'm-0 mt-2 text-[13.5px] leading-6 text-dp-text',
  finalCta:
    'relative overflow-hidden bg-dp-black px-6 py-[clamp(78px,9vw,118px)] text-white max-[700px]:px-4 max-[700px]:py-16',
  finalInner:
    'mx-auto grid max-w-[980px] grid-cols-[minmax(0,1fr)_auto] items-end gap-8 max-[780px]:grid-cols-1',
  finalTitle:
    'm-0 max-w-[700px] text-[clamp(2.4rem,calc(1.8rem+2.8vw),4.9rem)] font-bold leading-[0.96] tracking-[-0.055em]',
  finalCopy:
    'm-0 mt-5 max-w-[560px] text-[clamp(1rem,calc(0.96rem+0.2vw),1.1rem)] leading-[1.6] text-white/68',
  finalActions:
    'flex flex-wrap items-center justify-end gap-3 max-[780px]:justify-start max-[640px]:w-full max-[640px]:flex-col',
  finalPrimary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-[#f0f0f0] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusLight}`,
  finalSecondary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/35 bg-transparent px-6 py-3 text-[14.5px] font-semibold text-white no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusLight}`,
}
