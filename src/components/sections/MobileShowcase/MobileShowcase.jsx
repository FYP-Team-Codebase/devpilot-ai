import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import styles from './MobileShowcase.module.css'

const EASE = [0.16, 1, 0.3, 1]

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

function screenStyle(screen) {
  return {
    '--screen-left': screen.desktop.left,
    '--screen-top': screen.desktop.top,
    '--screen-width': screen.desktop.width,
    '--screen-z': screen.desktop.zIndex,
    '--mobile-left': screen.mobile.left,
    '--mobile-top': screen.mobile.top,
    '--mobile-width': screen.mobile.width,
  }
}

export default function MobileShowcase() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.18 })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section ref={sectionRef} className={styles.showcase} aria-labelledby="showcase-heading">
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

        <div className={styles.canvas}>
          {SCREENS.map((screen, index) => (
            <motion.figure
              key={screen.src}
              className={styles.screen}
              style={screenStyle(screen)}
              initial={shouldReduceMotion ? false : { opacity: 0, y: index % 2 === 0 ? 28 : -20, rotate: screen.desktop.rotate + (index % 2 === 0 ? -3 : 3) }}
              animate={isInView ? { opacity: 1, y: 0, rotate: screen.desktop.rotate } : undefined}
              transition={{ duration: shouldReduceMotion ? 0 : 0.68, ease: EASE, delay: shouldReduceMotion ? 0 : index * 0.08 }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.035, rotate: 0, zIndex: 20 }}
            >
              <img src={screen.src} alt={`${screen.name} generated with DevPilot`} />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
