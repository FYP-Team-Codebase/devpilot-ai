import { createElement } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'motion/react'

export function createUserMenuPortal(menu, container) {
  if (!container) return null
  return createPortal(
    createElement(AnimatePresence, null, menu),
    container,
  )
}
