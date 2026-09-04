import { motion, useReducedMotion } from 'motion/react'

export default function ActivityFeed() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      className="rounded-xl border border-dp-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      aria-labelledby="activity-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.14, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 id="activity-heading" className="m-0 text-[18px] font-bold leading-tight tracking-[-0.03em] text-dp-black">Recent Activity</h2>

      <div className="mt-4 flex min-h-[178px] flex-col items-center justify-center rounded-xl border border-dashed border-dp-border bg-[#FAFAF8] px-5 py-6 text-center">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-dp-border bg-white text-dp-black" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M10 3.5v3M10 13.5v3M5.4 5.4l2.1 2.1M12.5 12.5l2.1 2.1M3.5 10h3M13.5 10h3M5.4 14.6l2.1-2.1M12.5 7.5l2.1-2.1" />
          </svg>
        </div>
        <p className="m-0 mt-4 text-[14px] font-semibold text-dp-black">No activity yet</p>
        <p className="mt-1.5 text-[13px] leading-6 text-dp-muted">Your generated websites will appear here.</p>
      </div>
    </motion.section>
  )
}
