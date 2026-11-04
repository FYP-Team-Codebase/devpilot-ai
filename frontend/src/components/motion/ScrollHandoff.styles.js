export const scrollHandoffStyles = {
  root: 'relative',
  lineBase:
    'pointer-events-none absolute left-[max(16px,calc((100%_-_1180px)_/_2))] right-[max(16px,calc((100%_-_1180px)_/_2))] top-0 z-[2] h-px overflow-visible',
  lineLight: 'bg-dp-border',
  lineDark: 'bg-[rgba(255,255,255,0.2)]',
  progress:
    'absolute inset-0 block origin-left will-change-transform motion-reduce:will-change-auto',
  progressLight: 'bg-dp-black',
  progressDark: 'bg-dp-white',
  node:
    'absolute -right-1 -top-[3px] h-[7px] w-[7px] rounded-full will-change-[transform,opacity] motion-reduce:will-change-auto',
  nodeLight: 'bg-dp-black shadow-[0_0_0_5px_rgba(0,0,0,0.07)]',
  nodeDark: 'bg-dp-white shadow-[0_0_0_5px_rgba(255,255,255,0.1)]',
}
