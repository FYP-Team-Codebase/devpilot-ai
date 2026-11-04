export const signupPageStyles = {
  page:
    'min-h-svh bg-dp-white px-[clamp(20px,5vw,72px)] pb-11 pt-7 text-dp-near-black max-[820px]:px-6 max-[820px]:pb-[38px] max-[820px]:pt-6 max-[520px]:px-4 max-[520px]:pb-[30px] max-[520px]:pt-5',
  topbar: 'mx-auto flex max-w-dp-wide items-center justify-between',
  logoLink:
    'inline-flex rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black',
  logoImage: 'block h-auto w-[170px] max-[520px]:w-[145px]',
  backLink:
    'text-[13px] text-dp-text no-underline hover:text-dp-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black max-[520px]:text-[12px]',
  layout:
    'mx-auto grid min-h-[calc(100svh-120px)] max-w-[1220px] grid-cols-[minmax(460px,560px)_minmax(360px,540px)] items-center justify-center gap-[clamp(54px,8vw,112px)] max-[980px]:grid-cols-[minmax(420px,500px)_minmax(320px,420px)] max-[980px]:gap-[42px] max-[820px]:min-h-[auto] max-[820px]:grid-cols-[minmax(320px,540px)] max-[820px]:pb-7 max-[820px]:pt-[74px] max-[520px]:block max-[520px]:pt-[58px]',
  formIntro: 'mb-[30px] max-[520px]:mb-7',
  eyebrow:
    'm-0 mb-[15px] font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-dp-text',
  heading:
    'm-0 text-[clamp(2.3rem,4vw,3.3rem)] font-bold leading-[0.98] tracking-[-0.045em] text-dp-black',
  introText: 'm-0 mt-4 text-base leading-[1.55] text-dp-text',
  form: 'flex flex-col gap-[18px]',
  field: 'min-w-0',
  label: 'mb-2 block text-[13px] font-semibold text-dp-near-black',
  input:
    'min-h-[50px] w-full rounded-dp-control border border-dp-border-dark bg-dp-white px-[14px] py-[13px] font-sans text-[15px] font-normal text-dp-black outline-none transition-[border-color,box-shadow] duration-200 ease-[ease] placeholder:text-dp-muted focus:border-dp-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)] aria-invalid:border-dp-error motion-reduce:transition-none',
  passwordFields:
    'grid grid-cols-2 gap-[14px] max-[620px]:grid-cols-1 max-[620px]:gap-0',
  passwordWrap: 'relative',
  passwordToggle:
    'absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-[7px] text-[12px] font-semibold text-dp-text hover:text-dp-black focus-visible:rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-black',
  error: 'mt-1.5 block min-h-4 text-[12px] text-dp-error',
  authError:
    'm-0 -mt-0.5 rounded-[10px] border border-dp-error-border bg-dp-error-surface px-3 py-[11px] text-[12px] leading-[1.45] text-dp-error-text',
  submit:
    'mt-0.5 min-h-[50px] w-full cursor-pointer rounded-full border border-dp-black bg-dp-black px-4 font-sans text-[15px] font-semibold text-dp-white [transition:background-color_.2s_ease,transform_.15s_ease] enabled:hover:-translate-y-px enabled:hover:bg-dp-near-black enabled:active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0',
  login: 'm-0 mt-[25px] text-center text-[13px] text-dp-text',
  inlineLink:
    'font-semibold text-dp-black underline underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dp-black',
  userTypes: 'm-0 min-w-0 border-0 p-0',
  legend: 'mb-[11px] p-0 text-[13px] font-semibold text-dp-near-black',
  typeGrid: 'grid grid-cols-3 gap-2.5 max-[620px]:grid-cols-1',
  typeCardBase:
    'relative flex min-h-[139px] cursor-pointer flex-col items-start rounded-dp-card border border-dp-border-dark bg-dp-white p-[14px] transition-[border-color,background-color,box-shadow] duration-200 ease-[ease] hover:border-[#b4b4b4] hover:shadow-[0_8px_18px_rgba(0,0,0,0.04)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-dp-black motion-reduce:transition-none max-[620px]:min-h-[104px] max-[620px]:py-[13px] max-[620px]:pl-[58px] max-[620px]:pr-[14px]',
  typeCardSelected:
    'border-dp-black bg-dp-off-white shadow-[0_8px_18px_rgba(0,0,0,0.05)]',
  typeIcon:
    'mb-3 grid h-7 w-7 place-items-center rounded-lg bg-dp-surface text-dp-near-black max-[620px]:absolute max-[620px]:left-[14px] max-[620px]:top-[14px] max-[620px]:m-0',
  typeIconSelected: 'bg-dp-black text-dp-white',
  typeTitle: 'text-[13px] font-semibold text-dp-black',
  typeDescription:
    'mt-[5px] text-[11px] leading-[1.4] text-dp-text max-[620px]:max-w-[300px]',
  check:
    'absolute right-[11px] top-[11px] grid h-[18px] w-[18px] place-items-center rounded-full bg-dp-black text-[11px] font-bold text-dp-white',
}

signupPageStyles.passwordInput = `${signupPageStyles.input} pr-[60px]`
