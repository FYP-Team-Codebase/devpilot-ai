import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

import codenovaLogo from '../../assets/branding/codenova-logo.svg'
import LoginVisualCarousel from '../../components/auth/LoginVisualCarousel'

import { login } from '../../services/authService'

import styles from './LoginPage.module.css'

const EASE = [0.16, 1, 0.3, 1]

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Enter your password.'
  }

  return errors
}

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion()

  const [values, setValues] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState('idle')
  const [authError, setAuthError] = useState('')

  function updateField(event) {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))

    setAuthError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    console.log('LOGIN BUTTON CLICKED')
    console.log('LOGIN VALUES:', values)

    const nextErrors = validate(values)

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setStatus('loading')
    setAuthError('')

    try {
      console.log('Sending login request to backend...')

      const data = await login(values)

      console.log('LOGIN SUCCESS:', data)

      setStatus('success')

      /*
       * TEMPORARY:
       * We will connect this to your Dashboard route next.
       *
       * For now, reload the page after successful login.
       */
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('LOGIN ERROR:', error)

      setStatus('error')

      if (
        (error.requiresVerification ||
          error.requiresEmailVerification) &&
        error.email
      ) {
        sessionStorage.setItem(
          'pendingVerificationEmail',
          error.email
        )

        window.location.href = `/verify-email?email=${encodeURIComponent(
          error.email
        )}`
        return
      }

      setAuthError(
        error.message || 'Invalid email or password.'
      )
    }
  }

  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion
      ? false
      : {
          opacity: 0,
          y: 14,
        },

    animate: {
      opacity: 1,
      y: 0,
    },

    transition: {
      duration: shouldReduceMotion ? 0 : 0.55,
      ease: EASE,
      delay: shouldReduceMotion ? 0 : delay,
    },
  })

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <a
          href="/"
          className={styles.logoLink}
          aria-label="Code Nova home"
        >
          <img
            src={codenovaLogo}
            alt="Code Nova"
            width="190"
            height="36"
          />
        </a>

        <a
          className={styles.backLink}
          href="/"
        >
          Back to CodeNova{' '}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className={styles.layout}>
        <motion.section
          className={styles.formPanel}
          {...reveal()}
          aria-labelledby="login-heading"
        >
          <div className={styles.formIntro}>
            <p className={styles.eyebrow}>
              DevPilot AI
            </p>

            <h1 id="login-heading">
              Welcome back
            </h1>

            <p>
              Log in to continue building with DevPilot AI.
            </p>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* EMAIL */}

            <div className={styles.field}>
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email
                    ? 'email-error'
                    : undefined
                }
              />

              <span
                id="email-error"
                className={styles.error}
                role="alert"
              >
                {errors.email}
              </span>
            </div>

            {/* PASSWORD */}

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password">
                  Password
                </label>

                <a
                  href="/forgot-password"
                  className={styles.forgot}
                >
                  Forgot password?
                </a>
              </div>

              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={values.password}
                  onChange={updateField}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? 'password-error'
                      : undefined
                  }
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowPassword(
                      (visible) => !visible
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </button>
              </div>

              <span
                id="password-error"
                className={styles.error}
                role="alert"
              >
                {errors.password}
              </span>
            </div>

            {/* AUTH ERROR */}

            {authError && (
              <p
                className={styles.authError}
                role="alert"
              >
                {authError}
              </p>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className={styles.submit}
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? 'Logging in...'
                : 'Log in'}
            </button>
          </form>

          <p className={styles.signup}>
            Don't have an account?{' '}
            <a href="/signup">
              Sign up
            </a>
          </p>

          <p className={styles.legal}>
            By continuing, you agree to CodeNova's{' '}
            <a href="/terms">
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </motion.section>

        <LoginVisualCarousel />
      </div>
    </main>
  )
}
