const focusDark = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black'
const focusLight = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-white'

const darkButton =
  `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-black bg-dp-black px-6 py-3 text-[14.5px] font-semibold text-white no-underline transition-[background-color,transform,border-color] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-dp-near-black active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`

const lightButton =
  `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-border-dark bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-dp-black hover:bg-dp-surface active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`

export const businessPageStyles = {
  page: 'min-h-dvh overflow-x-hidden bg-dp-white font-sans text-dp-near-black',
  container: 'mx-auto w-full max-w-[1180px]',
  narrow: 'mx-auto w-full max-w-[980px]',
  eyebrow:
    'm-0 mb-5 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  sectionLabel:
    'm-0 mb-4 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  sectionTitle:
    'm-0 max-w-[760px] break-words text-[clamp(2.05rem,calc(1.62rem+1.95vw),3.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-dp-black max-[700px]:text-[1.55rem] max-[700px]:leading-[1.08] max-[700px]:tracking-[-0.018em]',
  sectionCopy:
    'm-0 mt-5 max-w-[640px] text-[clamp(1rem,calc(0.95rem+0.2vw),1.1rem)] leading-[1.65] text-dp-text',
  sectionHeader:
    'mb-[clamp(42px,6vw,72px)] max-w-[760px]',
  hero:
    'relative overflow-hidden bg-dp-white px-6 pb-[clamp(76px,9vw,124px)] pt-[clamp(128px,14vw,172px)] max-[700px]:px-4 max-[700px]:pb-16 max-[700px]:pt-[118px]',
  heroGrid:
    'mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] items-center gap-[clamp(38px,6vw,86px)] max-[980px]:grid-cols-1',
  heroTitle:
    'm-0 max-w-[760px] break-words text-[clamp(2.75rem,calc(2rem+3.35vw),5.65rem)] font-bold leading-[0.92] tracking-[-0.055em] text-dp-black max-[700px]:max-w-[calc(100vw-2rem)] max-[700px]:text-[2.15rem] max-[700px]:leading-[1.02] max-[700px]:tracking-[-0.025em]',
  heroDescription:
    'm-0 mt-6 max-w-[600px] text-[clamp(1rem,calc(0.96rem+0.24vw),1.12rem)] leading-[1.66] text-dp-text',
  heroActions:
    'mt-8 flex flex-wrap items-center gap-3 max-[640px]:w-full max-[640px]:flex-col',
  primaryCta: darkButton,
  secondaryCta: lightButton,
  heroVisual:
    'min-w-0 border border-dp-border-dark bg-dp-panel p-3 shadow-[0_20px_48px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] max-[700px]:p-2',
  heroImage:
    'block aspect-[1600/1280] w-full object-cover object-top',
  heroCaption:
    'm-0 mt-3 border-t border-dp-border px-1 pt-3 font-mono text-[11px] leading-5 text-dp-muted',
  heroMeta:
    'mt-[clamp(46px,7vw,82px)] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 border-t border-dp-border pt-5 max-[640px]:grid-cols-1',
  heroMetaText:
    'm-0 max-w-[780px] font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-dp-muted',
  heroRule:
    'h-2 w-24 bg-dp-black max-[640px]:w-20',
  problemSection:
    'border-y border-dp-border bg-dp-off-white px-6 py-[clamp(82px,10vw,140px)] max-[700px]:px-4 max-[700px]:py-16',
  problemGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-[clamp(42px,7vw,96px)] max-[920px]:grid-cols-1',
  problemStatement:
    'm-0 max-w-[580px] break-words text-[clamp(2.4rem,calc(1.75rem+2.9vw),5rem)] font-bold leading-[0.96] tracking-[-0.055em] text-dp-black max-[700px]:text-[1.65rem] max-[700px]:leading-[1.08] max-[700px]:tracking-[-0.018em]',
  problemRows:
    'grid self-start border-y border-dp-border',
  problemRow:
    'grid grid-cols-[minmax(120px,0.32fr)_minmax(0,1fr)] gap-5 border-t border-dp-border py-5 first:border-t-0 max-[620px]:grid-cols-1 max-[620px]:gap-2',
  problemTerm:
    'm-0 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  problemDetail:
    'm-0 text-[15px] leading-7 text-dp-near-black',
  workflowSection:
    'bg-dp-white px-6 py-[clamp(84px,10vw,144px)] max-[700px]:px-4 max-[700px]:py-16',
  workflowGrid:
    'grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-[clamp(34px,5vw,70px)] max-[980px]:grid-cols-1',
  workflowList:
    'grid gap-0 border-y border-dp-border',
  workflowItem:
    'grid grid-cols-[58px_minmax(0,1fr)] gap-4 border-t border-dp-border py-5 first:border-t-0 max-[520px]:grid-cols-[42px_minmax(0,1fr)]',
  workflowIndex:
    'font-mono text-[12px] font-semibold text-dp-muted',
  workflowTitle:
    'm-0 text-[18px] font-bold leading-tight tracking-[-0.025em] text-dp-black',
  workflowText:
    'm-0 mt-2 text-[14px] leading-6 text-dp-text',
  visualStack:
    'grid min-w-0 gap-4',
  imageFrame:
    'overflow-hidden border border-dp-border bg-white p-2.5 shadow-[0_16px_38px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] max-[700px]:p-2',
  productImage:
    'block aspect-[1600/1280] w-full object-cover object-top',
  imageCaption:
    'm-0 mt-3 px-1 text-[13px] leading-5 text-dp-muted',
  useCasesSection:
    'border-y border-dp-border bg-dp-page px-6 py-[clamp(82px,10vw,136px)] max-[700px]:px-4 max-[700px]:py-16',
  useCaseList:
    'border-y border-dp-border',
  useCaseRow:
    'grid grid-cols-[minmax(170px,0.34fr)_minmax(0,1fr)] gap-[clamp(24px,5vw,68px)] border-t border-dp-border py-7 transition-[background-color,padding-left] duration-200 ease-[ease] first:border-t-0 hover:bg-white hover:pl-4 motion-reduce:transition-none max-[700px]:grid-cols-1 max-[700px]:gap-3 max-[700px]:hover:pl-0',
  useCaseName:
    'm-0 font-mono text-[12px] font-semibold uppercase tracking-[0.13em] text-dp-muted',
  useCaseText:
    'm-0 max-w-[720px] text-[clamp(1.2rem,calc(1.08rem+0.5vw),1.65rem)] font-bold leading-tight tracking-[-0.025em] text-dp-black',
  todaySection:
    'bg-dp-white px-6 py-[clamp(82px,10vw,136px)] max-[700px]:px-4 max-[700px]:py-16',
  todayGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] gap-[clamp(36px,6vw,82px)] max-[900px]:grid-cols-1',
  capabilityMatrix:
    'grid border-y border-dp-border',
  capabilityRow:
    'grid grid-cols-[minmax(210px,0.45fr)_minmax(0,1fr)] gap-5 border-t border-dp-border py-5 first:border-t-0 max-[680px]:grid-cols-1 max-[680px]:gap-2',
  capabilityName:
    'm-0 text-[15px] font-bold leading-tight tracking-[-0.015em] text-dp-black',
  capabilityMeaning:
    'm-0 text-[14px] leading-6 text-dp-text',
  plannedSection:
    'border-y border-dp-border bg-dp-off-white px-6 py-[clamp(82px,10vw,136px)] max-[700px]:px-4 max-[700px]:py-16',
  plannedGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] gap-[clamp(36px,6vw,82px)] max-[900px]:grid-cols-1',
  plannedList:
    'grid gap-0 border-y border-dp-border',
  plannedItem:
    'grid grid-cols-[140px_minmax(0,1fr)] gap-5 border-t border-dp-border py-5 first:border-t-0 max-[620px]:grid-cols-1 max-[620px]:gap-2',
  plannedStatus:
    'm-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  plannedTitle:
    'm-0 text-[17px] font-bold leading-tight tracking-[-0.02em] text-dp-black',
  plannedText:
    'm-0 mt-2 max-w-[620px] text-[13.5px] leading-6 text-dp-text',
  teamSection:
    'bg-dp-page px-6 py-[clamp(78px,9vw,124px)] max-[700px]:px-4 max-[700px]:py-16',
  teamPanel:
    'mx-auto grid w-full max-w-[980px] grid-cols-[minmax(0,1fr)_minmax(260px,0.38fr)] gap-[clamp(30px,5vw,64px)] border-y border-dp-border py-[clamp(34px,5vw,54px)] max-[780px]:grid-cols-1',
  teamMeta:
    'm-0 font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-dp-muted',
  teamPrice:
    'm-0 mt-5 text-[clamp(2.1rem,calc(1.65rem+2vw),3.4rem)] font-bold leading-none tracking-[-0.045em] text-dp-black',
  teamPriceNote:
    'm-0 mt-2 text-[13px] leading-5 text-dp-muted',
  teamCopy:
    'm-0 mt-5 max-w-[650px] text-[15px] leading-7 text-dp-text',
  teamActions:
    'mt-8 flex flex-wrap items-center gap-3 max-[640px]:w-full max-[640px]:flex-col',
  teamNote:
    'self-end border-l border-dp-border pl-6 max-[780px]:border-l-0 max-[780px]:border-t max-[780px]:pl-0 max-[780px]:pt-5',
  finalCta:
    'relative overflow-hidden bg-dp-black px-6 py-[clamp(78px,9vw,118px)] text-white max-[700px]:px-4 max-[700px]:py-16',
  finalInner:
    'mx-auto grid w-full max-w-[980px] grid-cols-[minmax(0,1fr)_auto] items-end gap-8 max-[780px]:grid-cols-1',
  finalTitle:
    'm-0 max-w-[720px] break-words text-[clamp(2.35rem,calc(1.8rem+2.7vw),4.8rem)] font-bold leading-[0.96] tracking-[-0.055em] max-[700px]:text-[1.65rem] max-[700px]:leading-[1.08] max-[700px]:tracking-[-0.018em]',
  finalCopy:
    'm-0 mt-5 max-w-[560px] text-[clamp(1rem,calc(0.96rem+0.2vw),1.1rem)] leading-[1.6] text-white/68',
  finalActions:
    'flex flex-wrap items-center justify-end gap-3 max-[780px]:justify-start max-[640px]:w-full max-[640px]:flex-col',
  finalPrimary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-[#f0f0f0] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusLight}`,
  finalSecondary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/35 bg-transparent px-6 py-3 text-[14.5px] font-semibold text-white no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusLight}`,
  finalLink:
    `inline-flex min-h-[48px] items-center justify-center rounded-full px-2 py-3 text-[14.5px] font-semibold text-white/72 no-underline transition-colors duration-200 ease-[ease] hover:text-white max-[640px]:w-full ${focusLight}`,
}
