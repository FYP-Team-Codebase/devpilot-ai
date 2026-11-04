const FOCUS_CLASS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black'

export const mobileShowcaseStyles = {
  section:
    'overflow-clip bg-dp-off-white px-6 pb-[clamp(66px,8vw,108px)] pt-[clamp(80px,10vw,132px)] max-[700px]:px-4 max-[700px]:pb-[50px] max-[700px]:pt-[66px] landing-scroll-target',
  container: 'mx-auto max-w-dp-content',
  header: 'mx-auto max-w-[630px] text-center max-[700px]:max-w-[500px] max-[700px]:text-left',
  eyebrow:
    'm-0 mb-[17px] font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-dp-text',
  heading:
    'm-0 text-[clamp(2rem,calc(1.65rem+1.9vw),3.2rem)] font-bold leading-[1.02] tracking-[-0.04em] text-dp-black',
  description:
    'mx-auto mb-0 mt-[19px] max-w-[510px] text-[clamp(1rem,calc(0.95rem+0.2vw),1.1rem)] leading-[1.6] text-dp-text max-[700px]:ml-0',
  reelWrap:
    'isolate relative mx-auto mt-[clamp(44px,6vw,74px)] w-[min(100%,1100px)] max-[920px]:w-[min(100%,860px)] max-[700px]:mt-[46px] max-[700px]:w-full',
  arrow:
    `absolute top-[48%] z-[12] grid h-[46px] w-[46px] cursor-pointer place-items-center rounded-full border border-dp-border-dark bg-[rgba(255,255,255,0.94)] text-dp-black shadow-[0_10px_24px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.06)] [transform:translateY(-50%)] max-[700px]:top-auto max-[700px]:bottom-[18px] max-[700px]:h-11 max-[700px]:w-11 max-[700px]:transform-none ${FOCUS_CLASS}`,
  previousArrow: 'left-[clamp(4px,2vw,18px)] max-[700px]:left-[calc(50%_-_58px)]',
  nextArrow: 'right-[clamp(4px,2vw,18px)] max-[700px]:right-[calc(50%_-_58px)]',
  arrowGlyph: 'text-xl leading-none',
  reelStage:
    'isolate relative h-[660px] cursor-grab overflow-hidden [perspective-origin:50%_45%] [perspective:1400px] [transform-style:preserve-3d] active:cursor-grabbing max-[920px]:h-[610px] max-[920px]:[perspective:1300px] max-[700px]:h-[510px] max-[700px]:[perspective:1200px] max-[380px]:h-[470px]',
  floorShadow:
    'pointer-events-none absolute bottom-[38px] left-1/2 h-[22px] w-[min(64%,620px)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.13)_0%,rgba(0,0,0,0.05)_42%,transparent_72%)] opacity-[0.42] max-[920px]:bottom-12 max-[920px]:w-[68%] max-[700px]:bottom-[62px] max-[700px]:w-[82%]',
  screenCard:
    `absolute inset-x-0 top-7 mx-auto flex h-[570px] w-[clamp(178px,21vw,236px)] cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-[22px] border border-dp-border-dark bg-dp-white p-[9px] shadow-[0_14px_28px_rgba(0,0,0,0.11),0_3px_8px_rgba(0,0,0,0.06)] [transform-origin:center_center] [transform-style:preserve-3d] [will-change:transform,opacity,filter] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] before:content-[''] motion-reduce:[will-change:auto] max-[920px]:top-6 max-[920px]:h-[526px] max-[920px]:w-[clamp(168px,28vw,214px)] max-[700px]:top-[18px] max-[700px]:h-[440px] max-[700px]:w-[clamp(150px,48vw,184px)] max-[700px]:rounded-[18px] max-[700px]:p-[7px] max-[380px]:h-[400px] max-[380px]:w-[154px] ${FOCUS_CLASS}`,
  activeScreen:
    'border-[#b8b8b8] shadow-[0_24px_44px_rgba(0,0,0,0.16),0_6px_14px_rgba(0,0,0,0.08)]',
  screenImage: 'pointer-events-none block h-full w-full select-none rounded-[15px] object-contain object-top max-[700px]:rounded-xl',
  dots: '-mt-[22px] flex items-center justify-center gap-[7px] max-[920px]:-mt-[18px] max-[700px]:mt-2',
  dot:
    `h-1.5 w-1.5 cursor-pointer rounded-full border-0 bg-[#c8c8c8] p-0 transition-[width,background-color,transform] duration-200 ease-[ease] hover:-translate-y-px hover:bg-[#8f8f8f] data-[active=true]:w-4 data-[active=true]:bg-dp-black motion-reduce:transition-none ${FOCUS_CLASS}`,
}
