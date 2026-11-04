export const workflowStepStyles = {
  step: 'flex items-start gap-[18px] max-[520px]:gap-3',
  markerColumn: 'flex w-7 shrink-0 justify-center max-[520px]:w-[22px]',
  marker:
    'relative z-[2] inline-flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-dp-border-dark bg-dp-white transition-[background-color,border-color] duration-300 ease-[ease] max-[520px]:h-[22px] max-[520px]:w-[22px]',
  markerText:
    'font-mono text-[10.5px] font-semibold text-dp-text transition-colors duration-300 ease-[ease] max-[520px]:text-[9.5px]',
  markerTextActive: 'text-dp-white',
  body:
    'flex min-w-0 flex-1 items-center gap-[clamp(32px,5vw,64px)] max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:gap-6',
  reversed: 'flex-row-reverse',
  centeredBody:
    'flex-col items-center gap-10 text-center max-[900px]:items-stretch max-[900px]:text-left',
  copy: 'flex min-w-0 flex-1 flex-col gap-[14px]',
  centeredCopy: 'flex-none max-w-[640px] items-center max-[900px]:max-w-none max-[900px]:items-start',
  label: 'font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-dp-muted',
  heading:
    'm-0 font-sans text-[clamp(1.7rem,calc(1.4rem+1.3vw),2.5rem)] font-bold leading-[1.06] tracking-[-0.025em] text-dp-black',
  description:
    'm-0 max-w-[420px] font-sans text-base font-normal leading-[1.6] text-dp-text max-[900px]:max-w-none',
  centeredDescription: 'max-w-[520px]',
  visual: 'w-full min-w-0 flex-[1.15_1_0%] max-[900px]:max-w-none',
  centeredVisual: 'max-w-[1040px] flex-none',
}
