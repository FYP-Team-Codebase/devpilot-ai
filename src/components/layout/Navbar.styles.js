export const navbarStyles = {
  focusDark: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-dp-black',
  logoBarShell: 'pointer-events-none absolute inset-x-0 top-4 z-[99] px-5',
  logoBarInner: 'mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 max-[880px]:px-2',
  logoLink:
    'pointer-events-auto ml-2 flex shrink-0 items-center gap-3 rounded-lg px-2 py-1.5 text-dp-black no-underline max-[880px]:ml-0 focus-visible:outline-offset-4',
  logoText: 'whitespace-nowrap font-sans text-[19px] font-semibold tracking-[-0.4px] text-dp-black',
  actionGroup: 'pointer-events-auto mr-2 flex shrink-0 items-center gap-1.5 max-[880px]:hidden',
  header: 'pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-5 pt-4',
  nav:
    'mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-0 px-4 max-[880px]:flex max-[880px]:flex-wrap max-[880px]:justify-between max-[880px]:gap-x-3 max-[880px]:gap-y-0 max-[880px]:px-2',
  pillBase:
    'pointer-events-auto justify-self-center rounded-full border border-transparent bg-transparent shadow-none backdrop-blur-0 [transition:background-color_0.35s_ease,border-color_0.35s_ease,box-shadow_0.35s_ease,backdrop-filter_0.35s_ease] max-[880px]:hidden',
  pillSolid: 'border-dp-border bg-dp-surface shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
  pillTransparent:
    'border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.15)] shadow-[0_10px_30px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-[28px] backdrop-saturate-[180%]',
  desktopList: 'm-0 flex list-none items-center justify-center gap-0.5 px-2.5 py-2.5',
  desktopLink:
    'inline-flex whitespace-nowrap rounded-full px-[14px] py-2 font-sans text-[14.5px] font-medium text-dp-black no-underline transition-colors duration-200 ease-[ease] hover:bg-dp-surface focus-visible:outline-offset-2',
  login:
    'whitespace-nowrap rounded-full bg-transparent px-4 py-[9px] font-sans text-[14.5px] font-medium text-dp-black no-underline transition-colors duration-200 ease-[ease] hover:bg-dp-surface focus-visible:outline-offset-2',
  cta:
    'whitespace-nowrap rounded-full bg-dp-black px-5 py-2.5 font-sans text-[14.5px] font-semibold text-dp-white no-underline [transition:background-color_0.2s_ease,transform_0.15s_ease] hover:bg-dp-near-black focus-visible:outline-offset-[3px] active:scale-[0.98]',
  mobileToggle:
    'pointer-events-auto hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center justify-self-end rounded-full border-0 bg-transparent p-0 hover:bg-dp-surface max-[880px]:inline-flex focus-visible:outline-offset-2',
  menuIcon:
    "relative block h-0.5 w-[18px] rounded-[2px] bg-dp-black transition-[transform,opacity,background-color] duration-[250ms] ease-[ease] before:absolute before:left-0 before:top-[-6px] before:block before:h-0.5 before:w-[18px] before:rounded-[2px] before:bg-dp-black before:transition-[transform,opacity,background-color] before:duration-[250ms] before:ease-[ease] before:content-[''] after:absolute after:left-0 after:top-[6px] after:block after:h-0.5 after:w-[18px] after:rounded-[2px] after:bg-dp-black after:transition-[transform,opacity,background-color] after:duration-[250ms] after:ease-[ease] after:content-['']",
  menuIconOpen: 'bg-transparent before:top-0 before:rotate-45 after:top-0 after:-rotate-45',
  mobileMenu:
    'pointer-events-auto col-[1/-1] mt-0 max-h-0 overflow-hidden rounded-[24px] border border-transparent bg-dp-white px-5 py-0 opacity-0 [transition:max-height_0.3s_ease,opacity_0.25s_ease,padding_0.3s_ease,margin-top_0.3s_ease,border-color_0.3s_ease] max-[880px]:basis-full',
  mobileMenuOpen:
    'mt-2.5 max-h-[420px] border-dp-border px-5 pb-5 pt-1 opacity-100 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
  mobileList: 'm-0 mt-2 flex list-none flex-col gap-0.5 border-t border-dp-border p-0 pt-3',
  mobileLink:
    'block rounded-[12px] px-2 py-3 font-sans text-base font-medium text-dp-near-black no-underline transition-colors duration-200 ease-[ease] hover:bg-dp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-dp-black',
  mobileActions: 'mt-[14px] flex flex-col gap-2.5 border-t border-dp-border pt-[14px]',
  mobileLogin:
    'rounded-full border border-dp-border-dark px-4 py-3 text-center font-sans text-[15px] font-medium text-dp-black no-underline transition-colors duration-200 ease-[ease] hover:bg-dp-surface focus-visible:outline-offset-2',
  mobileCta:
    'rounded-full bg-dp-black px-4 py-[13px] text-center font-sans text-[15px] font-semibold text-dp-white no-underline transition-colors duration-200 ease-[ease] hover:bg-dp-near-black focus-visible:outline-offset-2',
}
