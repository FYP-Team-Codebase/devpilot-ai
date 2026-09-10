export const loginPageStyles = {
  page:
    'min-h-svh bg-dp-white px-[clamp(20px,5vw,72px)] pb-11 pt-7 text-dp-near-black max-[820px]:px-6 max-[820px]:pb-[38px] max-[820px]:pt-6 max-[520px]:px-4 max-[520px]:pb-[30px] max-[520px]:pt-5',
  topbar: 'mx-auto flex max-w-dp-wide items-center justify-between',
  logoLink:
    'inline-flex rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black',
  logoImage: 'block h-auto w-[170px] max-[520px]:w-[145px]',
  backLink:
    'text-[13px] text-dp-text no-underline hover:text-dp-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black max-[520px]:text-[12px]',
  layout:
    'mx-auto grid min-h-[calc(100svh-120px)] max-w-[1080px] grid-cols-[minmax(320px,430px)_minmax(360px,540px)] items-center justify-center gap-[clamp(64px,10vw,150px)] max-[820px]:min-h-[auto] max-[820px]:grid-cols-[minmax(320px,430px)] max-[820px]:pb-7 max-[820px]:pt-[74px] max-[520px]:block max-[520px]:pt-[78px]',
  formIntro: 'mb-[34px] max-[520px]:mb-7',
  eyebrow:
    'm-0 mb-[15px] font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-dp-text',
  heading:
    'm-0 text-[clamp(2.3rem,4vw,3.3rem)] font-bold leading-[0.98] tracking-[-0.045em] text-dp-black',
  introText: 'm-0 mt-4 text-base leading-[1.55] text-dp-text',
  form: 'flex flex-col gap-5',
  field: 'min-w-0',
  label: 'mb-2 block text-[13px] font-semibold text-dp-near-black',
  input:
    'min-h-[50px] w-full rounded-dp-control border border-dp-border-dark bg-dp-white px-[14px] py-[13px] font-sans text-[15px] font-normal text-dp-black outline-none transition-[border-color,box-shadow] duration-200 ease-[ease] placeholder:text-dp-muted focus:border-dp-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)] aria-invalid:border-dp-error motion-reduce:transition-none',
  labelRow: 'flex items-baseline justify-between gap-3',
  forgot:
    'text-[12px] text-dp-text no-underline hover:text-dp-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black',
  passwordWrap: 'relative',
  passwordToggle:
    'absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-[7px] text-[12px] font-semibold text-dp-text hover:text-dp-black focus-visible:rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-black',
  error: 'mt-1.5 block min-h-4 text-[12px] text-dp-error',
  authError:
    'm-0 -mt-0.5 rounded-[10px] border border-dp-error-border bg-dp-error-surface px-3 py-[11px] text-[12px] leading-[1.45] text-dp-error-text',
  submit:
    'mt-0.5 min-h-[50px] w-full cursor-pointer rounded-full border border-dp-black bg-dp-black px-4 font-sans text-[15px] font-semibold text-dp-white [transition:background-color_.2s_ease,transform_.15s_ease] enabled:hover:-translate-y-px enabled:hover:bg-dp-near-black enabled:active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0',
  signup: 'm-0 mt-7 text-center text-[13px] text-dp-text',
  legal:
    'm-0 mt-[42px] text-center text-[11px] leading-normal text-dp-muted max-[520px]:mt-[34px]',
  inlineLink:
    'font-semibold text-dp-black underline underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black',
}

loginPageStyles.passwordInput = `${loginPageStyles.input} pr-[66px]`
