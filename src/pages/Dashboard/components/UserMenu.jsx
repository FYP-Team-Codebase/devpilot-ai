import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../services/authService'

function getDisplayName(user) {
  if (user?.name?.trim()) return user.name.trim()
  if (user?.email?.trim()) return user.email.trim()
  return 'there'
}

function getInitials(user) {
  const source = user?.name?.trim() || user?.email?.trim() || 'D'
  const parts = source.replace(/@.*/, '').split(/\s|\.|_/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'D'
}

export default function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  function handleNavigate(path) {
    navigate(path)
    setIsOpen(false)
  }

  const displayName = getDisplayName(user)

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        className="flex cursor-pointer items-center gap-2 rounded-full border border-dp-border bg-white py-1 pr-2 pl-1 text-dp-black transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-dp-black text-[11px] font-bold tracking-wide text-white">{getInitials(user)}</span>
        <span className="max-w-28 truncate text-[13px] font-semibold text-dp-black max-sm:hidden">{displayName}</span>
        <svg className={`w-3 h-3 text-dp-muted transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-[calc(100%+8px)] z-[100] w-[220px] overflow-hidden rounded-2xl border border-dp-border bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
            role="menu"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2.5 p-3 px-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dp-black text-xs font-bold text-white">{getInitials(user)}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-dp-black overflow-hidden text-ellipsis whitespace-nowrap">{displayName}</span>
                {user?.email && <span className="text-[11.5px] text-dp-muted overflow-hidden text-ellipsis whitespace-nowrap">{user.email}</span>}
              </div>
            </div>
            <div className="h-px bg-dp-border" />
            <button type="button" className="block w-full cursor-pointer border-0 bg-transparent px-3.5 py-2 text-left text-[13px] font-medium text-dp-black transition-colors duration-100 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset" role="menuitem" onClick={() => handleNavigate('/dashboard/profile')}>
              Profile
            </button>
            <button type="button" className="block w-full cursor-pointer border-0 bg-transparent px-3.5 py-2 text-left text-[13px] font-medium text-dp-black transition-colors duration-100 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset" role="menuitem" onClick={() => handleNavigate('/dashboard/settings')}>
              Settings
            </button>
            <div className="h-px bg-dp-border" />
            <button type="button" className="block w-full cursor-pointer border-0 bg-transparent px-3.5 py-2 text-left text-[13px] font-medium text-dp-black transition-colors duration-100 hover:bg-dp-surface hover:text-dp-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dp-black focus-visible:ring-inset" role="menuitem" onClick={handleLogout}>
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
