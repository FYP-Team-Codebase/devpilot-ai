import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import useLandingNavigation from '../../../hooks/useLandingNavigation'
import styles from './PromptBar.module.css'

const EXAMPLE_PROMPT = 'Build a modern SaaS dashboard with authentication and analytics'
const SUBMIT_HOLD_MS = 1100
const EASE = [0.16, 1, 0.3, 1]

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function PromptBar() {
  const shouldReduceMotion = useReducedMotion()
  const { handleStartBuilding } = useLandingNavigation()
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [typedCount, setTypedCount] = useState(() => (prefersReducedMotion() ? EXAMPLE_PROMPT.length : 0))
  const [showCursor, setShowCursor] = useState(false)
  const inputRef = useRef(null)

  const isFilled = value.trim().length > 0

  useEffect(() => {
    if (prefersReducedMotion()) return

    let intervalId
    const startId = window.setTimeout(() => {
      setShowCursor(true)
      let i = 0
      intervalId = window.setInterval(() => {
        i += 1
        setTypedCount(i)
        if (i >= EXAMPLE_PROMPT.length) {
          window.clearInterval(intervalId)
          window.setTimeout(() => setShowCursor(false), 900)
        }
      }, 26)
    }, 550)

    return () => {
      window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!isSubmitting) return
    const id = window.setTimeout(() => setIsSubmitting(false), SUBMIT_HOLD_MS)
    return () => window.clearTimeout(id)
  }, [isSubmitting])

  function handleSubmit(event) {
    event.preventDefault()
    if (!isFilled || isSubmitting) {
      inputRef.current?.focus()
      return
    }
    setIsSubmitting(true)
    window.setTimeout(
      () => {
        sessionStorage.setItem('devpilot-prompt', value.trim())
        handleStartBuilding()
      },
      prefersReducedMotion() ? 0 : SUBMIT_HOLD_MS,
    )
  }

  function useExample() {
    setValue(EXAMPLE_PROMPT)
    inputRef.current?.focus()
  }

  return (
    <motion.div
      className={styles.wrap}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: EASE, delay: shouldReduceMotion ? 0 : 0.12 }}
    >
      <form
        className={`${styles.card} ${isFocused ? styles.focused : ''} ${isSubmitting ? styles.submitting : ''}`}
        onSubmit={handleSubmit}
        aria-label="Describe what you want to build"
      >
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Describe what you want to build..."
            aria-label="Describe what you want to build"
            disabled={isSubmitting}
          />

          <motion.button
            type="submit"
            className={styles.send}
            data-filled={isFilled}
            aria-label="Submit prompt"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              animate={{ rotate: isSubmitting ? 35 : 0, scale: isSubmitting ? 0.9 : 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <path d="M7 17 17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.button>
        </div>

        <div className={styles.metaRow}>
          <AnimatePresence mode="wait" initial={false}>
            {isSubmitting ? (
              <motion.span
                key="status"
                className={styles.statusText}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Preparing your build…
              </motion.span>
            ) : (
              <motion.button
                key="example"
                type="button"
                className={styles.example}
                onClick={useExample}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={styles.exampleLabel}>Try:</span>
                <span>{EXAMPLE_PROMPT.slice(0, typedCount)}</span>
                {showCursor && <span className={styles.cursor} aria-hidden="true" />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  )
}
