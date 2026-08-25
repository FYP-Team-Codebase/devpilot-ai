import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'
import htmlIcon from '../../../assets/tech/html.svg'
import cssIcon from '../../../assets/tech/css.svg'
import javascriptIcon from '../../../assets/tech/javascript.svg'
import reactIcon from '../../../assets/react.svg'
import expressIcon from '../../../assets/tech/express.svg'
import nodejsIcon from '../../../assets/tech/nodejs.svg'
import mongodbIcon from '../../../assets/tech/mongodb.svg'
import claudeIcon from '../../../assets/tech/claude.svg'
import gitIcon from '../../../assets/tech/git.svg'
import githubIcon from '../../../assets/tech/github.svg'
import styles from './TechBar.module.css'

const TECHNOLOGIES = [
  { name: 'HTML', icon: htmlIcon },
  { name: 'CSS', icon: cssIcon },
  { name: 'JavaScript', icon: javascriptIcon },
  { name: 'React', icon: reactIcon },
  { name: 'Express.js', icon: expressIcon },
  { name: 'Node.js', icon: nodejsIcon },
  { name: 'MongoDB', icon: mongodbIcon },
  { name: 'Claude', icon: claudeIcon },
  { name: 'Git', icon: gitIcon },
  { name: 'GitHub', icon: githubIcon },
]

// Repeated so one copy of the track is comfortably wider than any real
// viewport — the loop only ever needs to wrap within a single copy's width.
const REPEAT = 8
const SEQUENCE = Array.from({ length: REPEAT }, () => TECHNOLOGIES).flat()

const NORMAL_SPEED = 55 // px / second
const HOVER_SPEED = 14 // px / second, eased into on hover
const SPEED_SMOOTHING = 0.06

function TechItem({ tech }) {
  return (
    <motion.div className={styles.techItem} whileHover={{ scale: 1.07 }} transition={{ duration: 0.2 }}>
      <img className={styles.techIcon} src={tech.icon} alt="" width="18" height="18" />
      <span className={styles.techName}>{tech.name}</span>
    </motion.div>
  )
}

export default function TechBar() {
  const shouldReduceMotion = useReducedMotion()
  const trackRef = useRef(null)
  const x = useMotionValue(0)
  const targetSpeed = useRef(NORMAL_SPEED)
  const currentSpeed = useRef(NORMAL_SPEED)

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion || !trackRef.current) return

    currentSpeed.current += (targetSpeed.current - currentSpeed.current) * SPEED_SMOOTHING

    const halfWidth = trackRef.current.scrollWidth / 2
    if (halfWidth <= 0) return

    let next = x.get() - (currentSpeed.current * delta) / 1000
    if (next <= -halfWidth) {
      next += halfWidth
    }
    x.set(next)
  })

  return (
    <section
      id="products"
      className={styles.techBar}
      aria-label="Built with HTML, CSS, JavaScript, React, Express.js, Node.js, MongoDB, Claude, Git and GitHub"
    >
      <div
        className={styles.viewport}
        onMouseEnter={() => {
          targetSpeed.current = HOVER_SPEED
        }}
        onMouseLeave={() => {
          targetSpeed.current = NORMAL_SPEED
        }}
      >
        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          {[...SEQUENCE, ...SEQUENCE].map((tech, index) => (
            <div className={styles.techGroup} key={`${tech.name}-${index}`}>
              <TechItem tech={tech} />
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
