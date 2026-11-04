const focusDark = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black'

const fieldBase =
  `w-full rounded-[12px] border border-dp-border-dark bg-white px-4 py-3 text-[15px] leading-6 text-dp-black outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-[ease] placeholder:text-dp-muted hover:border-[#b8b8b8] focus:border-dp-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] ${focusDark}`

export const contactPageStyles = {
  page: 'min-h-dvh overflow-x-hidden bg-dp-white font-sans text-dp-near-black',
  container: 'mx-auto w-full max-w-[1180px]',
  narrow: 'mx-auto w-full max-w-[980px]',
  eyebrow:
    'm-0 mb-5 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  sectionLabel:
    'm-0 mb-4 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  hero:
    'relative overflow-hidden bg-dp-white px-6 pb-[clamp(68px,8vw,110px)] pt-[clamp(128px,14vw,172px)] max-[700px]:px-4 max-[700px]:pb-14 max-[700px]:pt-[118px]',
  heroInner:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,1fr)_minmax(260px,0.36fr)] gap-[clamp(34px,7vw,98px)] max-[900px]:grid-cols-1',
  heroTitle:
    'm-0 max-w-[820px] break-words text-[clamp(2.8rem,calc(2rem+3.45vw),5.9rem)] font-bold leading-[0.92] tracking-[-0.055em] text-dp-black max-[700px]:max-w-[calc(100vw-2rem)] max-[700px]:text-[2.15rem] max-[700px]:leading-[1.02] max-[700px]:tracking-[-0.025em]',
  heroCopy:
    'm-0 max-w-[620px] text-[clamp(1rem,calc(0.96rem+0.24vw),1.12rem)] leading-[1.7] text-dp-text',
  heroAside:
    'self-end border-l border-dp-border pl-6 max-[900px]:max-w-[640px] max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:pl-0 max-[900px]:pt-5',
  heroRule:
    'mt-[clamp(46px,7vw,82px)] border-t border-dp-border pt-5',
  heroRuleText:
    'm-0 max-w-[760px] font-mono text-[11px] font-medium uppercase tracking-[0.11em] text-dp-muted',
  contactSection:
    'border-y border-dp-border bg-dp-off-white px-6 py-[clamp(74px,9vw,124px)] max-[700px]:px-4 max-[700px]:py-14',
  contactGrid:
    'mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-[clamp(40px,7vw,98px)] max-[960px]:grid-cols-1',
  infoIntro:
    'max-w-[430px]',
  sectionTitle:
    'm-0 max-w-[720px] break-words text-[clamp(2rem,calc(1.6rem+1.8vw),3.3rem)] font-bold leading-[1.02] tracking-[-0.04em] text-dp-black max-[700px]:text-[1.55rem] max-[700px]:leading-[1.08] max-[700px]:tracking-[-0.018em]',
  sectionCopy:
    'm-0 mt-5 max-w-[640px] text-[clamp(1rem,calc(0.95rem+0.2vw),1.08rem)] leading-[1.68] text-dp-text',
  infoList:
    'mt-10 grid border-y border-dp-border',
  infoRow:
    'grid gap-2 border-t border-dp-border py-6 first:border-t-0',
  infoLabel:
    'm-0 font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-dp-muted',
  infoValue:
    'm-0 text-[17px] font-semibold leading-7 tracking-[-0.015em] text-dp-black',
  infoText:
    'm-0 text-[15px] leading-7 text-dp-text',
  infoLink:
    `inline-flex w-fit rounded-lg text-[17px] font-semibold leading-7 tracking-[-0.015em] text-dp-black underline decoration-dp-border-dark underline-offset-4 transition-colors duration-200 ease-[ease] hover:text-dp-text hover:decoration-dp-black ${focusDark}`,
  formPanel:
    'min-w-0 border border-dp-border-dark bg-white p-[clamp(24px,4vw,42px)] shadow-[0_18px_44px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.03)] max-[700px]:p-5',
  formHeader:
    'mb-8 border-b border-dp-border pb-6',
  formTitle:
    'm-0 text-[clamp(1.55rem,calc(1.32rem+0.9vw),2.2rem)] font-bold leading-tight tracking-[-0.035em] text-dp-black',
  formCopy:
    'm-0 mt-3 max-w-[640px] text-[14.5px] leading-6 text-dp-text',
  form:
    'grid gap-5',
  fieldGrid:
    'grid grid-cols-2 gap-4 max-[680px]:grid-cols-1',
  field:
    'grid gap-2',
  label:
    'text-[13px] font-semibold leading-5 text-dp-black',
  input: fieldBase,
  select: `${fieldBase} cursor-pointer appearance-none bg-[linear-gradient(45deg,transparent_50%,#111_50%),linear-gradient(135deg,#111_50%,transparent_50%)] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-20px)_calc(50%+1px),calc(100%-15px)_calc(50%+1px)] bg-no-repeat pr-11`,
  textarea:
    `${fieldBase} min-h-[132px] resize-y`,
  projectTextarea:
    `${fieldBase} min-h-[92px] resize-y`,
  error:
    'm-0 text-[12.5px] font-medium leading-5 text-dp-error-text',
  status:
    'm-0 border border-dp-border-dark bg-dp-page px-4 py-3 text-[13.5px] leading-6 text-dp-near-black',
  formActions:
    'mt-1 flex flex-wrap items-center gap-3 max-[640px]:w-full max-[640px]:flex-col',
  submitButton:
    `inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border border-dp-black bg-dp-black px-6 py-3 text-[14.5px] font-semibold text-white transition-[background-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-dp-near-black active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`,
  secondaryLink:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-border-dark bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-dp-black hover:bg-dp-surface active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`,
  contextSection:
    'bg-dp-white px-6 py-[clamp(66px,8vw,104px)] max-[700px]:px-4 max-[700px]:py-14',
  contextInner:
    'mx-auto grid w-full max-w-[980px] grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] gap-[clamp(28px,5vw,70px)] border-y border-dp-border py-[clamp(28px,4vw,46px)] max-[760px]:grid-cols-1',
  contextTitle:
    'm-0 text-[clamp(1.65rem,calc(1.35rem+1.25vw),2.65rem)] font-bold leading-tight tracking-[-0.035em] text-dp-black',
  creatorList:
    'm-0 mt-5 grid list-none grid-cols-2 gap-x-6 gap-y-2 p-0 max-[520px]:grid-cols-1',
  creatorItem:
    'font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-dp-muted',
  finalSection:
    'border-t border-dp-border bg-dp-page px-6 py-[clamp(64px,8vw,104px)] max-[700px]:px-4 max-[700px]:py-14',
  finalInner:
    'mx-auto grid w-full max-w-[980px] grid-cols-[minmax(0,1fr)_auto] items-end gap-8 max-[780px]:grid-cols-1',
  finalTitle:
    'm-0 max-w-[560px] break-words text-[clamp(1.85rem,calc(1.46rem+1.65vw),3.05rem)] font-bold leading-[1.04] tracking-[-0.04em] text-dp-black max-[700px]:text-[1.45rem] max-[700px]:leading-[1.1] max-[700px]:tracking-[-0.018em]',
  finalCopy:
    'm-0 mt-4 max-w-[560px] text-[15px] leading-7 text-dp-text',
  finalActions:
    'flex flex-wrap items-center justify-end gap-3 max-[780px]:justify-start max-[640px]:w-full max-[640px]:flex-col',
  finalPrimary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-black bg-dp-black px-6 py-3 text-[14.5px] font-semibold text-white no-underline transition-[background-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:bg-dp-near-black active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`,
  finalSecondary:
    `inline-flex min-h-[48px] items-center justify-center rounded-full border border-dp-border-dark bg-white px-6 py-3 text-[14.5px] font-semibold text-dp-black no-underline transition-[background-color,border-color,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:border-dp-black hover:bg-dp-surface active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[640px]:w-full ${focusDark}`,
}
