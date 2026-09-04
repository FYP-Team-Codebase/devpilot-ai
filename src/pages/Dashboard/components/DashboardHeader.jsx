import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import UserMenu from './UserMenu'

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
    <header className="sticky top-0 z-30 border-b border-dp-border bg-[#FAFAF8]/95 backdrop-blur-xl">
      <div className="flex min-h-[60px] items-center justify-between gap-4 px-6 max-md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <motion.button
            type="button"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8] md:hidden"
            aria-label="Open navigation"
            onClick={onMenuToggle}
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4">
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          </motion.button>

          <div className="min-w-0">
            <p className="m-0 text-[15px] font-semibold tracking-[-0.02em] text-dp-black">Welcome back</p>
            <p className="m-0 mt-0.5 truncate text-[12.5px] leading-5 text-dp-muted">Let's build something great today.</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2.5">
          <div className={`flex h-9 w-[min(260px,24vw)] items-center gap-2 rounded-full border bg-white px-3 transition-colors duration-150 max-md:hidden ${
            isSearchFocused ? 'border-dp-black shadow-[0_0_0_3px_rgba(0,0,0,0.04)]' : 'border-dp-border'
          }`}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-dp-muted">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              type="text"
              className="min-w-0 flex-1 border-none bg-transparent p-0 font-sans text-[12.5px] text-dp-black outline-none placeholder:text-dp-muted"
              placeholder="Search projects..."
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              aria-label="Search projects"
            />
          </div>

          <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-dp-border bg-white px-3 text-[12px] font-semibold text-dp-black">
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
    <div className="relative shrink-0" ref={ref}>
      <motion.button
        type="button"
        className="relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-dp-border bg-white text-dp-text transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-controls="dashboard-notifications-popover"
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M5.5 7.5a3.5 3.5 0 1 1 7 0c0 4 1.5 4.5 1.5 4.5H4s1.5-.5 1.5-4.5Z" />
          <path d="M7.8 14a1.4 1.4 0 0 0 2.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid min-h-2 min-w-2 place-items-center rounded-full bg-dp-black text-[9px] font-bold leading-none text-white">
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
            className="absolute right-0 top-[calc(100%+8px)] z-[100] w-[min(calc(100vw-24px),320px)] overflow-hidden rounded-2xl border border-dp-border bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <h2 id="dashboard-notifications-heading" className="m-0 text-[13.5px] font-semibold text-dp-black">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="shrink-0 rounded-full border border-dp-border bg-[#FAFAF8] px-2 py-1 text-[11px] font-semibold text-dp-muted">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="h-px bg-dp-border" />

            {notifications.length > 0 ? (
              <div className="max-h-[320px] overflow-y-auto py-1">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="block w-full cursor-pointer border-0 bg-transparent px-4 py-3 text-left transition-colors duration-100 hover:bg-dp-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset"
                  >
                    <span className="block text-[13px] font-semibold text-dp-black">{notification.title}</span>
                    {notification.description && (
                      <span className="mt-1 block text-[12.5px] leading-5 text-dp-muted">{notification.description}</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5 text-center">
                <p className="m-0 text-[13.5px] font-semibold text-dp-black">You're all caught up.</p>
                <p className="m-0 mt-1 text-[12.5px] leading-5 text-dp-muted">No new notifications right now.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
