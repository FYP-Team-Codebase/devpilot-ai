import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../services/authService'
import { userMenuStyles } from './UserMenu.styles'

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
    <div className={userMenuStyles.root} ref={ref}>
      <motion.button
        type="button"
        className={userMenuStyles.trigger}
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <span className={userMenuStyles.avatar}>{getInitials(user)}</span>
        <span className={userMenuStyles.displayName}>{displayName}</span>
        <svg className={`${userMenuStyles.chevron} ${isOpen ? userMenuStyles.chevronOpen : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={userMenuStyles.menu}
            role="menu"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={userMenuStyles.menuHeader}>
              <span className={userMenuStyles.menuAvatar}>{getInitials(user)}</span>
              <div className={userMenuStyles.menuIdentity}>
                <span className={userMenuStyles.menuName}>{displayName}</span>
                {user?.email && <span className={userMenuStyles.menuEmail}>{user.email}</span>}
              </div>
            </div>
            <div className={userMenuStyles.divider} />
            <button type="button" className={userMenuStyles.item} role="menuitem" onClick={() => handleNavigate('/dashboard/profile')}>
              Profile
            </button>
            <button type="button" className={userMenuStyles.item} role="menuitem" onClick={() => handleNavigate('/dashboard/settings')}>
              Settings
            </button>
            <div className={userMenuStyles.divider} />
            <button type="button" className={userMenuStyles.item} role="menuitem" onClick={handleLogout}>
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
