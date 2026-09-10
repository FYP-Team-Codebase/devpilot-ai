import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import UserMenu from './UserMenu'
import { dashboardHeaderStyles } from './DashboardHeader.styles'

const NOTIFICATIONS = []

export default function DashboardHeader({ user, onMenuToggle, onSearch }) {
  const [searchValue, setSearchValue] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  function handleSearchChange(e) {
    const val = e.target.value
    setSearchValue(val)
    onSearch?.(val)
  }

  return (
    <header className={dashboardHeaderStyles.header}>
      <div className={dashboardHeaderStyles.inner}>
        <div className={dashboardHeaderStyles.titleGroup}>
          <motion.button
            type="button"
            className={dashboardHeaderStyles.menuButton}
            aria-label="Open navigation"
            onClick={onMenuToggle}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={dashboardHeaderStyles.menuIcon}>
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          </motion.button>

          <div className={dashboardHeaderStyles.titleTextWrap}>
            <p className={dashboardHeaderStyles.eyebrow}>Welcome back</p>
            <p className={dashboardHeaderStyles.subheading}>Let's build something great today.</p>
          </div>
        </div>

        <div className={dashboardHeaderStyles.actions}>
          <div className={`${dashboardHeaderStyles.searchBase} ${
            isSearchFocused ? dashboardHeaderStyles.searchFocused : dashboardHeaderStyles.searchDefault
          }`}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={dashboardHeaderStyles.searchIcon}>
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              type="text"
              className={dashboardHeaderStyles.searchInput}
              placeholder="Search projects..."
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              aria-label="Search projects"
            />
          </div>

          <span className={dashboardHeaderStyles.planPill}>
            Free Plan
          </span>

          <NotificationBell notifications={NOTIFICATIONS} shouldReduceMotion={shouldReduceMotion} />

          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}

function NotificationBell({ notifications, shouldReduceMotion }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const unreadCount = notifications.filter((notification) => !notification.readAt).length

  useEffect(() => {
    if (!isOpen) return undefined

    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  return (
    <div className={dashboardHeaderStyles.notificationWrap} ref={ref}>
      <motion.button
        type="button"
        className={dashboardHeaderStyles.notificationButton}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-controls="dashboard-notifications-popover"
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={dashboardHeaderStyles.menuIcon}>
          <path d="M5.5 7.5a3.5 3.5 0 1 1 7 0c0 4 1.5 4.5 1.5 4.5H4s1.5-.5 1.5-4.5Z" />
          <path d="M7.8 14a1.4 1.4 0 0 0 2.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={dashboardHeaderStyles.unreadBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="dashboard-notifications-popover"
            role="dialog"
            aria-labelledby="dashboard-notifications-heading"
            className={dashboardHeaderStyles.popover}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={dashboardHeaderStyles.popoverHeader}>
              <h2 id="dashboard-notifications-heading" className={dashboardHeaderStyles.popoverTitle}>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className={dashboardHeaderStyles.unreadPill}>
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className={dashboardHeaderStyles.divider} />

            {notifications.length > 0 ? (
              <div className={dashboardHeaderStyles.notificationList}>
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={dashboardHeaderStyles.notificationItem}
                  >
                    <span className={dashboardHeaderStyles.notificationTitle}>{notification.title}</span>
                    {notification.description && (
                      <span className={dashboardHeaderStyles.notificationDescription}>{notification.description}</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className={dashboardHeaderStyles.empty}>
                <p className={dashboardHeaderStyles.emptyTitle}>You're all caught up.</p>
                <p className={dashboardHeaderStyles.emptyText}>No new notifications right now.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
