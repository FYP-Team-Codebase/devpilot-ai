const chrome =
  'flex items-center justify-between gap-4 bg-dp-white px-[18px] py-[15px] max-[520px]:px-[14px] max-[520px]:py-[13px]'

export const loginVisualCarouselStyles = {
  carousel:
    'w-full overflow-hidden rounded-dp-feature border border-dp-border bg-dp-off-white shadow-[0_18px_42px_rgba(0,0,0,0.06)] max-[820px]:max-w-[540px] max-[520px]:mt-12 max-[520px]:rounded-dp-panel',
  chrome,
  topline: `${chrome} border-b border-dp-border font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-dp-text`,
  status:
    'inline-flex items-center gap-1.5 normal-case tracking-normal max-[520px]:text-[10px]',
  statusDot: 'h-1.5 w-1.5 rounded-full bg-dp-black',
  stage:
    "relative isolate h-[clamp(382px,39vw,492px)] overflow-hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px),var(--color-dp-off-white)] bg-[length:44px_44px] after:absolute after:inset-[auto_8%_7%_8%] after:z-0 after:h-[18%] after:rounded-[50%] after:bg-black/[0.045] after:blur-[20px] after:content-[''] max-[820px]:h-[450px] max-[520px]:h-[330px] max-[520px]:bg-[length:36px_36px]",
  screen:
    'pointer-events-none absolute inset-0 z-[1] m-0 grid place-items-center origin-center will-change-[transform,opacity] motion-reduce:will-change-auto',
  screenImage:
    'block max-h-[calc(100%-40px)] max-w-[min(54%,248px)] rounded-[15px] object-contain shadow-[0_18px_32px_rgba(0,0,0,0.16),0_3px_8px_rgba(0,0,0,0.10)] max-[520px]:max-h-[calc(100%-30px)] max-[520px]:max-w-[min(52%,170px)] max-[520px]:rounded-[11px]',
  footer: `${chrome} min-h-[51px] border-t border-dp-border`,
  footerLabel: 'm-0 text-[12px] text-dp-text',
  dots: 'inline-flex items-center gap-1.5',
  dot:
    'h-1.5 w-1.5 cursor-pointer rounded-full border-0 bg-dp-border-dark p-0 transition-[width,background-color] duration-200 ease-[ease] hover:w-[17px] hover:rounded-[99px] hover:bg-dp-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-dp-black motion-reduce:transition-none',
  dotActive: 'w-[17px] rounded-[99px] bg-dp-black',
}
