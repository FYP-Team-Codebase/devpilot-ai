export const promptBarStyles = {
  shell: 'mx-auto mb-7 w-full max-w-[740px]',
  cardBase:
    'flex w-full flex-col gap-2 rounded-[18px] border border-dp-border-dark bg-dp-white px-5 pb-[14px] pt-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_22px_rgba(0,0,0,0.05)] [transition:border-color_0.18s_ease,box-shadow_0.18s_ease,transform_0.18s_ease] hover:-translate-y-px hover:border-dp-text hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_14px_32px_rgba(0,0,0,0.08)] motion-reduce:hover:translate-y-0 max-[640px]:gap-1.5 max-[640px]:rounded-[16px] max-[640px]:px-4 max-[640px]:pb-3 max-[640px]:pt-[13px]',
  cardActive:
    'border-dp-black shadow-[0_0_0_4px_rgba(0,0,0,0.05),0_14px_32px_rgba(0,0,0,0.08)]',
  fieldRow: 'flex items-center gap-[14px]',
  input:
    'min-w-0 flex-1 border-0 bg-transparent px-0 py-[7px] font-sans text-[17px] font-medium text-dp-black outline-none placeholder:text-dp-text placeholder:font-normal disabled:opacity-60 max-[640px]:text-[15.5px]',
  send:
    'inline-flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-dp-control border border-dp-border bg-transparent text-dp-muted transition-[background-color,color,border-color] duration-200 ease-[ease] hover:border-dp-border-dark hover:bg-dp-surface hover:text-dp-near-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-dp-black data-[filled=true]:border-dp-black data-[filled=true]:bg-dp-black data-[filled=true]:text-dp-white data-[filled=true]:hover:bg-dp-near-black max-[640px]:h-9 max-[640px]:w-9 max-[640px]:rounded-[11px]',
  sendIcon: 'h-[18px] w-[18px]',
  meta: 'min-h-[14px] border-t border-dp-border pt-[5px]',
  status: 'inline-block font-sans text-[12.5px] text-dp-text max-[640px]:text-xs',
  example:
    'block w-full cursor-pointer whitespace-normal border-0 bg-transparent p-0 text-left font-sans text-[12.5px] leading-[1.5] text-dp-muted transition-colors duration-200 ease-[ease] hover:text-dp-near-black focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-black max-[640px]:text-xs',
  exampleLabel: 'mr-1 font-semibold text-dp-text',
  cursor: 'ml-px inline-block h-[11px] w-[1.5px] bg-dp-muted',
}
