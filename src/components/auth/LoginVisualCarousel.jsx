import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import styles from './LoginVisualCarousel.module.css'

const EASE = [0.16, 1, 0.3, 1]
const ROTATION_INTERVAL = 3400

const SCREENS = [
  { name: 'Fintech dashboard', src: '/showcase/fintech.png' },
  { name: 'Travel planning app', src: '/showcase/travel.png' },
  { name: 'Fitness tracking app', src: '/showcase/fitness.png' },
  { name: 'Social community app', src: '/showcase/social.png' },
  { name: 'Fashion shopping app', src: '/showcase/fashion.png' },
  { name: 'Productivity workspace app', src: '/showcase/productivity.png' },
]

function getLayer(index, activeIndex) {
  const distance = (index - activeIndex + SCREENS.length) % SCREENS.length

  if (distance === 0) return { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, zIndex: 4 }
  if (distance === 1) return { opacity: 0.58, scale: 0.88, x: 84, y: -18, rotate: 5, zIndex: 3 }
  if (distance === SCREENS.length - 1) return { opacity: 0.46, scale: 0.86, x: -82, y: 23, rotate: -5, zIndex: 2 }
  if (distance === 2) return { opacity: 0.16, scale: 0.77, x: 125, y: 15, rotate: 8, zIndex: 1 }
  return { opacity: 0, scale: 0.7, x: -124, y: 16, rotate: -8, zIndex: 0 }
}

export default function LoginVisualCarousel() {
  const shouldReduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion || isPaused) return undefined

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % SCREENS.length)
    }, ROTATION_INTERVAL)

    return () => window.clearInterval(intervalId)
  }, [isPaused, shouldReduceMotion])

  return (
    <motion.aside
      className={styles.carousel}
      initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: EASE, delay: shouldReduceMotion ? 0 : 0.14 }}
      aria-roledescription="carousel"
      aria-label="DevPilot AI generated product showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
      }}
    >
      <div className={styles.topline}>
        <span>DevPilot AI</span>
        <span className={styles.status}><i aria-hidden="true" /> Generating products</span>
      </div>

      <div className={styles.stage}>
        {SCREENS.map((screen, index) => (
          <motion.figure
            key={screen.src}
            className={styles.screen}
            animate={getLayer(index, activeIndex)}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: EASE }}
            aria-hidden={index !== activeIndex}
          >
            <img src={screen.src} alt={index === activeIndex ? `${screen.name} created with DevPilot AI` : ''} />
          </motion.figure>
        ))}
      </div>

      <div className={styles.footer}>
        <p aria-live="polite">{SCREENS[activeIndex].name}</p>
        <div className={styles.controls} aria-label="Choose a product example">
          {SCREENS.map((screen, index) => (
            <button
              key={screen.src}
              type="button"
              className={index === activeIndex ? styles.activeDot : undefined}
              aria-label={`Show ${screen.name}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </motion.aside>
  )
}
