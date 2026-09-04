import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import styles from './MobileShowcase.module.css'

const EASE = [0.16, 1, 0.3, 1]
const AUTOPLAY_MS = 3200
const AUTOPLAY_RESUME_MS = 3600
const SWIPE_DISTANCE_THRESHOLD = 85
const SWIPE_VELOCITY_THRESHOLD = 520

const SCREENS = [
  {
    name: 'Fintech dashboard',
    src: '/showcase/fintech.png',
    desktop: { left: '3%', top: '198px', width: '190px', rotate: -8, zIndex: 2 },
    mobile: { left: '-2%', top: '224px', width: '104px' },
  },
  {
    name: 'Travel planning app',
    src: '/showcase/travel.png',
    desktop: { left: '20%', top: '22px', width: '184px', rotate: -5, zIndex: 3 },
    mobile: { left: '3%', top: '8px', width: '112px' },
  },
  {
    name: 'Fitness tracking app',
    src: '/showcase/fitness.png',
    desktop: { left: '39%', top: '132px', width: '212px', rotate: -2, zIndex: 5 },
    mobile: { left: '29%', top: '100px', width: '140px' },
  },
  {
    name: 'Social community app',
    src: '/showcase/social.png',
    desktop: { left: '59%', top: '2px', width: '190px', rotate: 2, zIndex: 4 },
    mobile: { left: '62%', top: '18px', width: '112px' },
  },
  {
    name: 'Fashion shopping app',
    src: '/showcase/fashion.png',
    desktop: { left: '77%', top: '192px', width: '168px', rotate: 5, zIndex: 2 },
    mobile: { left: '35%', top: '264px', width: '94px' },
  },
  {
    name: 'Productivity workspace app',
    src: '/showcase/productivity.png',
    desktop: { left: '53%', top: '276px', width: '184px', rotate: 8, zIndex: 6 },
    mobile: { left: '62%', top: '230px', width: '108px' },
  },
]

const REEL_LAYOUTS = {
  desktop: [
    { x: -440, z: -120, rotateY: 22, scale: 0.76, opacity: 0.35, blur: 1.2, zIndex: 1 },
    { x: -268, z: 10, rotateY: 15, scale: 0.88, opacity: 0.68, blur: 0.35, zIndex: 3 },
    { x: 0, z: 150, rotateY: 0, scale: 1, opacity: 1, blur: 0, zIndex: 6 },
    { x: 268, z: 10, rotateY: -15, scale: 0.88, opacity: 0.68, blur: 0.35, zIndex: 3 },
    { x: 440, z: -120, rotateY: -22, scale: 0.76, opacity: 0.35, blur: 1.2, zIndex: 1 },
  ],
  tablet: [
    { x: -260, z: -50, rotateY: 18, scale: 0.78, opacity: 0.42, blur: 0.7, zIndex: 1 },
    { x: -155, z: 35, rotateY: 13, scale: 0.9, opacity: 0.76, blur: 0, zIndex: 3 },
    { x: 0, z: 130, rotateY: 0, scale: 1, opacity: 1, blur: 0, zIndex: 6 },
    { x: 155, z: 35, rotateY: -13, scale: 0.9, opacity: 0.76, blur: 0, zIndex: 3 },
    { x: 260, z: -50, rotateY: -18, scale: 0.78, opacity: 0.42, blur: 0.7, zIndex: 1 },
  ],
  mobile: [
    { x: -184, z: -70, rotateY: 18, scale: 0.76, opacity: 0.2, blur: 1.2, zIndex: 1 },
    { x: -112, z: 20, rotateY: 12, scale: 0.86, opacity: 0.58, blur: 0.2, zIndex: 3 },
    { x: 0, z: 110, rotateY: 0, scale: 1, opacity: 1, blur: 0, zIndex: 6 },
    { x: 112, z: 20, rotateY: -12, scale: 0.86, opacity: 0.58, blur: 0.2, zIndex: 3 },
    { x: 184, z: -70, rotateY: -18, scale: 0.76, opacity: 0.2, blur: 1.2, zIndex: 1 },
  ],
}

function wrapIndex(index) {
  return (index + SCREENS.length) % SCREENS.length
}

function getShortestOffset(index, activeIndex) {
  const rawOffset = index - activeIndex
  const half = SCREENS.length / 2

  if (rawOffset > half) return rawOffset - SCREENS.length
  if (rawOffset < -half) return rawOffset + SCREENS.length

  return rawOffset
}

function getReelMode() {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia('(max-width: 700px)').matches) return 'mobile'
  if (window.matchMedia('(max-width: 980px)').matches) return 'tablet'
  return 'desktop'
}

function getSlideLayout(offset, mode) {
  const visibleOffset = Math.max(-2, Math.min(2, offset))
  const layout = REEL_LAYOUTS[mode][visibleOffset + 2]

  if (Math.abs(offset) <= 2) {
    return layout
  }

  return {
    ...layout,
    opacity: 0,
    scale: 0.68,
    zIndex: 0,
  }
}

export default function MobileShowcase() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.18 })
  const shouldReduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [reelMode, setReelMode] = useState(getReelMode)
  const resumeTimerRef = useRef(null)

  useEffect(() => {
    function handleResize() {
      setReelMode(getReelMode())
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (shouldReduceMotion || isInteracting || !isInView || document.hidden) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => wrapIndex(index + 1))
    }, AUTOPLAY_MS)

    return () => window.clearInterval(intervalId)
  }, [isInteracting, isInView, shouldReduceMotion])

  useEffect(() => {
    function handleVisibilityChange() {
      setIsInteracting(document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), [])

  const visibleScreens = useMemo(
    () => SCREENS.map((screen, index) => ({
      ...screen,
      offset: getShortestOffset(index, activeIndex),
      index,
    })),
    [activeIndex],
  )

  function showNext() {
    setActiveIndex((index) => wrapIndex(index + 1))
    pauseAutoplayTemporarily()
  }

  function showPrevious() {
    setActiveIndex((index) => wrapIndex(index - 1))
    pauseAutoplayTemporarily()
  }

  function centerScreen(index) {
    if (index === activeIndex) return
    setActiveIndex(index)
    pauseAutoplayTemporarily()
  }

  function pauseAutoplayTemporarily() {
    setIsInteracting(true)

    if (shouldReduceMotion) {
      return
    }

    window.clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = window.setTimeout(() => {
      if (!document.hidden) {
        setIsInteracting(false)
      }
    }, AUTOPLAY_RESUME_MS)
  }

  function handleDragEnd(_, info) {
    const hasDistance = Math.abs(info.offset.x) > SWIPE_DISTANCE_THRESHOLD
    const hasVelocity = Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD

    if (!hasDistance && !hasVelocity) {
      pauseAutoplayTemporarily()
      return
    }

    if (info.offset.x < 0 || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      showNext()
      return
    }

    showPrevious()
  }

  return (
    <section
      id="products"
      ref={sectionRef}
      className={`${styles.showcase} landing-scroll-target`}
      aria-labelledby="showcase-heading"
    >
      <div className={styles.container}>
        <motion.header
          className={styles.header}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: EASE }}
        >
          <p className={styles.eyebrow}>Built with DevPilot</p>
          <h2 id="showcase-heading">From a single prompt to a complete product.</h2>
          <p>DevPilot turns natural-language ideas into polished interfaces, ready to become the product you imagined.</p>
        </motion.header>

        <div
          className={styles.reelWrap}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => {
            if (!document.hidden) setIsInteracting(false)
          }}
        >
          <motion.button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrevious}`}
            aria-label="Show previous product screen"
            onClick={showPrevious}
            whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <span aria-hidden="true">←</span>
          </motion.button>

          <motion.div
            className={styles.reelStage}
            role="region"
            aria-roledescription="carousel"
            aria-label="DevPilot product screenshots"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            dragDirectionLock
            onDragStart={() => setIsInteracting(true)}
            onDragEnd={handleDragEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <div className={styles.reelBase} aria-hidden="true" />
            {visibleScreens.map((screen) => {
              const layout = getSlideLayout(screen.offset, reelMode)
              const isActive = screen.index === activeIndex
              const isVisible = Math.abs(screen.offset) <= 2

              return (
                <motion.button
                  key={screen.src}
                  type="button"
                  className={`${styles.screenCard} ${isActive ? styles.activeScreen : ''}`}
                  aria-label={`Show ${screen.name}`}
                  aria-current={isActive ? 'true' : undefined}
                  tabIndex={isVisible ? 0 : -1}
                  onClick={() => centerScreen(screen.index)}
                  initial={shouldReduceMotion ? false : {
                    opacity: 0,
                    x: layout.x * 0.42,
                    y: 16,
                    z: layout.z,
                    rotateY: layout.rotateY,
                    scale: 0.98,
                  }}
                  animate={isInView ? {
                    opacity: layout.opacity,
                    x: layout.x,
                    y: 0,
                    z: layout.z,
                    rotateY: layout.rotateY,
                    scale: layout.scale,
                    filter: layout.blur ? `blur(${layout.blur}px)` : 'blur(0px)',
                  } : undefined}
                  transition={shouldReduceMotion ? { duration: 0 } : {
                    type: 'spring',
                    stiffness: 160,
                    damping: 22,
                    mass: 0.8,
                    delay: isInView ? Math.abs(screen.offset) * 0.035 : 0,
                  }}
                  style={{
                    zIndex: layout.zIndex,
                    pointerEvents: isVisible ? 'auto' : 'none',
                  }}
                >
                  <img src={screen.src} alt={`${screen.name} generated with DevPilot`} draggable="false" />
                </motion.button>
              )
            })}
          </motion.div>

          <motion.button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            aria-label="Show next product screen"
            onClick={showNext}
            whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <span aria-hidden="true">→</span>
          </motion.button>
        </div>

        <div className={styles.dots} aria-label="Product screenshot selector">
          {SCREENS.map((screen, index) => (
            <button
              key={screen.src}
              type="button"
              className={styles.dot}
              data-active={index === activeIndex}
              aria-label={`Show ${screen.name}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => centerScreen(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
