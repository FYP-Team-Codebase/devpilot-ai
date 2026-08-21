import { useEffect, useRef, useState } from 'react'

const TOP_THRESHOLD = 8
const DELTA_THRESHOLD = 4

export function useScrollDirection() {
  const [isSolid, setIsSolid] = useState(true)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY

    function update() {
      const currentY = window.scrollY
      const delta = currentY - lastY.current

      if (currentY <= TOP_THRESHOLD) {
        setIsSolid(true)
      } else if (Math.abs(delta) > DELTA_THRESHOLD) {
        setIsSolid(delta < 0)
      }

      lastY.current = currentY
      ticking.current = false
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true
        window.requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return isSolid
}
