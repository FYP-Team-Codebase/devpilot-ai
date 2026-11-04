const focusDark = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black'
const focusLight = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-white'

const lightButton =
  `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-border-dark bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-dp-black hover:bg-dp-surface active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`

export const aboutPageStyles = {
  page: 'min-h-dvh overflow-x-hidden bg-dp-white font-sans text-dp-near-black',
  container: 'mx-auto w-full max-w-[1180px]',
  narrow: 'mx-auto w-full max-w-[980px]',
  hero:
    'relative overflow-hidden bg-dp-white px-6 pb-[clamp(76px,9vw,124px)] pt-[clamp(128px,14vw,172px)] max-[700px]:px-4 max-[700px]:pb-16 max-[700px]:pt-[118px]',
  heroInner:
    'mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)_minmax(260px,0.36fr)] gap-[clamp(34px,7vw,98px)] max-[900px]:grid-cols-1',
  eyebrow:
    'm-0 mb-5 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  heroTitle:
    'm-0 max-w-[920px] break-words text-[clamp(3rem,calc(2rem+4.35vw),7.1rem)] font-bold leading-[0.9] tracking-[-0.06em] text-dp-black max-[700px]:max-w-[calc(100vw-2rem)] max-[700px]:text-[1.9rem] max-[700px]:leading-[1.02] max-[700px]:tracking-[-0.02em]',
  heroAside:
    'self-end border-l border-dp-border pl-6 max-[900px]:max-w-[620px] max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:pl-0 max-[900px]:pt-5',
  heroCopy:
    'm-0 text-[clamp(1.02rem,calc(0.96rem+0.28vw),1.16rem)] leading-[1.65] text-dp-text',
  heroRule:
    'mt-[clamp(48px,7vw,84px)] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 border-t border-dp-border pt-5 max-[640px]:grid-cols-1',
  heroRuleText:
    'm-0 max-w-[760px] font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-dp-muted',
  heroMark:
    'h-2 w-24 bg-dp-black max-[640px]:w-20',
  statementSection:
    'border-y border-dp-border bg-dp-off-white px-6 py-[clamp(84px,10vw,148px)] max-[700px]:px-4 max-[700px]:py-16',
  statementGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-[clamp(40px,7vw,96px)] max-[900px]:grid-cols-1',
  statement:
    'm-0 max-w-[650px] break-words text-[clamp(2.45rem,calc(1.8rem+3vw),5.35rem)] font-bold leading-[0.94] tracking-[-0.055em] text-dp-black max-[700px]:max-w-[calc(100vw-2rem)] max-[700px]:text-[1.6rem] max-[700px]:leading-[1.06] max-[700px]:tracking-[-0.018em]',
  storyCopyWrap:
    'grid gap-5 self-end border-t border-dp-border pt-5',
  storyCopy:
    'm-0 max-w-[620px] text-[clamp(1rem,calc(0.95rem+0.2vw),1.1rem)] leading-[1.72] text-dp-text',
  problemSection:
    'bg-dp-white px-6 py-[clamp(84px,10vw,140px)] max-[700px]:px-4 max-[700px]:py-16',
  sectionHeader:
    'mb-[clamp(44px,6vw,72px)] max-w-[720px]',
  sectionTitle:
    'm-0 max-w-full break-words text-[clamp(2.2rem,calc(1.72rem+2.05vw),3.75rem)] font-bold leading-[1] tracking-[-0.045em] text-dp-black max-[700px]:max-w-[calc(100vw-2rem)] max-[700px]:text-[1.3rem] max-[700px]:leading-[1.12] max-[700px]:tracking-[-0.012em]',
  sectionCopy:
    'm-0 mt-5 max-w-[620px] text-[clamp(1rem,calc(0.95rem+0.2vw),1.1rem)] leading-[1.65] text-dp-text',
  problemFlow:
    'grid border-y border-dp-border',
  problemRow:
    'grid grid-cols-[minmax(150px,0.34fr)_minmax(0,1fr)_auto] items-center gap-6 border-t border-dp-border py-6 first:border-t-0 max-[760px]:grid-cols-1 max-[760px]:gap-3',
  problemLabel:
    'm-0 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  problemText:
    'm-0 text-[clamp(1.35rem,calc(1.12rem+1vw),2rem)] font-bold leading-tight tracking-[-0.035em] text-dp-black',
  problemAside:
    'm-0 max-w-[260px] text-[13.5px] leading-6 text-dp-text max-[760px]:max-w-none',
  approachSection:
    'border-y border-dp-border bg-dp-page px-6 py-[clamp(84px,10vw,144px)] max-[700px]:px-4 max-[700px]:py-16',
  approachList:
    'grid border-y border-dp-border',
  approachItem:
    'grid grid-cols-[88px_minmax(180px,0.42fr)_minmax(0,1fr)] gap-[clamp(20px,4vw,54px)] border-t border-dp-border py-7 first:border-t-0 max-[780px]:grid-cols-1 max-[780px]:gap-3',
  approachIndex:
    'font-mono text-[12px] font-semibold text-dp-muted',
  approachTitle:
    'm-0 text-[clamp(1.35rem,calc(1.12rem+1vw),2rem)] font-bold leading-tight tracking-[-0.03em] text-dp-black',
  approachText:
    'm-0 max-w-[560px] text-[15px] leading-7 text-dp-text',
  productSection:
    'bg-dp-white px-6 py-[clamp(84px,10vw,144px)] max-[700px]:px-4 max-[700px]:py-16',
  productGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-center gap-[clamp(36px,6vw,82px)] max-[960px]:grid-cols-1',
  productCopy:
    'min-w-0',
  productList:
    'm-0 mt-7 grid list-none gap-3 border-y border-dp-border py-5',
  productListItem:
    'grid grid-cols-[18px_minmax(0,1fr)] gap-3 text-[14.5px] leading-6 text-dp-near-black before:mt-[10px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-dp-black before:content-[\'\']',
  productActions:
    'mt-8 flex flex-wrap items-center gap-3 max-[640px]:w-full max-[640px]:flex-col',
  primaryCta:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-black bg-dp-black px-6 py-3 text-[14.5px] font-semibold text-white no-underline transition-[background-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-dp-near-black active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`,
  secondaryCta: lightButton,
  productVisual:
    'min-w-0 overflow-hidden rounded-[20px] border border-dp-border-dark bg-white p-2.5 shadow-[0_20px_48px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] max-[700px]:rounded-[16px] max-[700px]:p-2',
  productImage:
    'block aspect-[1920/1536] w-full rounded-[14px] object-cover object-top max-[700px]:rounded-[11px]',
  productCaption:
    'm-0 mt-3 border-t border-dp-border px-1 pt-3 font-mono text-[11px] leading-5 text-dp-muted',
  creatorsSection:
    'border-y border-dp-border bg-dp-page px-6 py-[clamp(84px,10vw,136px)] max-[700px]:px-4 max-[700px]:py-16',
  creatorsGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-[clamp(36px,6vw,82px)] max-[900px]:grid-cols-1',
  creatorList:
    'm-0 grid list-none grid-cols-2 gap-0 border-y border-dp-border p-0 max-[640px]:grid-cols-1',
  creatorItem:
    'grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 border-t border-dp-border py-6 transition-colors duration-200 ease-[ease] first:border-t-0 hover:bg-white odd:border-r odd:pr-7 even:pl-7 motion-reduce:transition-none max-[640px]:border-r-0 max-[640px]:pl-0 max-[640px]:pr-0',
  creatorIndex:
    'font-mono text-[12px] font-semibold text-dp-muted',
  creatorName:
    'min-w-0 break-words text-[clamp(1.35rem,calc(1.12rem+1vw),2rem)] font-bold leading-tight tracking-[-0.035em] text-dp-black',
  principlesSection:
    'border-y border-dp-border bg-dp-off-white px-6 py-[clamp(84px,10vw,144px)] max-[700px]:px-4 max-[700px]:py-16',
  principlesList:
    'border-y border-dp-border',
  principleRow:
    'grid grid-cols-[minmax(180px,0.42fr)_minmax(0,1fr)] gap-[clamp(28px,6vw,84px)] border-t border-dp-border py-8 first:border-t-0 max-[760px]:grid-cols-1 max-[760px]:gap-3',
  principleWord:
    'm-0 text-[clamp(2.15rem,calc(1.48rem+3vw),4.7rem)] font-bold leading-[0.9] tracking-[-0.06em] text-dp-black',
  principleText:
    'm-0 max-w-[620px] self-center text-[clamp(1rem,calc(0.96rem+0.16vw),1.08rem)] leading-[1.72] text-dp-text',
  futureSection:
    'bg-dp-page px-6 py-[clamp(84px,10vw,136px)] max-[700px]:px-4 max-[700px]:py-16',
  futureGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] gap-[clamp(36px,6vw,82px)] max-[900px]:grid-cols-1',
  futureList:
    'grid gap-0 border-y border-dp-border',
  futureItem:
    'grid grid-cols-[150px_minmax(0,1fr)] gap-5 border-t border-dp-border py-5 first:border-t-0 max-[620px]:grid-cols-1 max-[620px]:gap-2',
  futureMeta:
    'm-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-dp-muted',
  futureTitle:
    'm-0 text-[17px] font-bold leading-tight tracking-[-0.02em] text-dp-black',
  futureText:
    'm-0 mt-2 max-w-[620px] text-[13.5px] leading-6 text-dp-text',
  finalCta:
    'relative overflow-hidden bg-dp-black px-6 py-[clamp(78px,9vw,118px)] text-white max-[700px]:px-4 max-[700px]:py-16',
  finalInner:
    'mx-auto grid w-full max-w-[980px] grid-cols-[minmax(0,1fr)_auto] items-end gap-8 max-[780px]:grid-cols-1',
  finalTitle:
    'm-0 max-w-[680px] break-words text-[clamp(2.5rem,calc(1.8rem+3vw),5rem)] font-bold leading-[0.95] tracking-[-0.055em] max-[700px]:max-w-[calc(100vw-2rem)] max-[700px]:text-[1.6rem] max-[700px]:leading-[1.06] max-[700px]:tracking-[-0.018em]',
  finalCopy:
    'm-0 mt-5 max-w-[560px] text-[clamp(1rem,calc(0.96rem+0.2vw),1.1rem)] leading-[1.6] text-white/68',
  finalActions:
    'flex flex-wrap items-center justify-end gap-3 max-[780px]:justify-start max-[640px]:w-full max-[640px]:flex-col',
  finalPrimary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-[#f0f0f0] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusLight}`,
  finalSecondary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/35 bg-transparent px-6 py-3 text-[14.5px] font-semibold text-white no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusLight}`,
}
