const VIEWPORT_GUTTER = 12
const MENU_GAP = 8

export function calculateUserMenuPosition(triggerRect, menuSize, viewport) {
  const viewportHeight = Math.max(0, viewport.height)
  const maxHeight = Math.max(0, viewportHeight - VIEWPORT_GUTTER * 2)
  const menuHeight = Math.min(Math.max(0, menuSize.height), maxHeight)
  const belowTop = triggerRect.bottom + MENU_GAP
  const belowSpace = viewportHeight - belowTop - VIEWPORT_GUTTER
  const aboveSpace = triggerRect.top - MENU_GAP - VIEWPORT_GUTTER
  const placeAbove = belowSpace < menuHeight && aboveSpace > belowSpace
  const preferredTop = placeAbove ? triggerRect.top - MENU_GAP - menuHeight : belowTop
  const top = Math.max(VIEWPORT_GUTTER, Math.min(preferredTop, viewportHeight - menuHeight - VIEWPORT_GUTTER))
  const right = Math.max(VIEWPORT_GUTTER, viewport.width - triggerRect.right)

  return { top, right, maxHeight }
}

export function isOutsideUserMenuEvent(target, triggerContainer, menuElement) {
  return !triggerContainer?.contains(target) && !menuElement?.contains(target)
}
