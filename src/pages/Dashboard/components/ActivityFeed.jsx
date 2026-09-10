import { motion, useReducedMotion } from 'motion/react'
import { activityFeedStyles } from './ActivityFeed.styles'

export default function ActivityFeed() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      className={activityFeedStyles.section}
      aria-labelledby="activity-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, delay: shouldReduceMotion ? 0 : 0.14, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 id="activity-heading" className={activityFeedStyles.heading}>Recent Activity</h2>

      <div className={activityFeedStyles.empty}>
        <div className={activityFeedStyles.iconWrap} aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={activityFeedStyles.icon}>
            <path d="M10 3.5v3M10 13.5v3M5.4 5.4l2.1 2.1M12.5 12.5l2.1 2.1M3.5 10h3M13.5 10h3M5.4 14.6l2.1-2.1M12.5 7.5l2.1-2.1" />
          </svg>
        </div>
        <p className={activityFeedStyles.emptyTitle}>No activity yet</p>
        <p className={activityFeedStyles.emptyText}>Your generated websites will appear here.</p>
      </div>
    </motion.section>
  )
}
