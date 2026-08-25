import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import codenovaLogo from '../../assets/branding/codenova-logo.svg'
import LoginVisualCarousel from '../../components/auth/LoginVisualCarousel'

import { signup } from '../../services/authService'

import styles from './SignupPage.module.css'

const EASE = [0.16, 1, 0.3, 1]

const USER_TYPES = [
  {
    value: 'designer',
    title: 'Designer',
    description: 'Design interfaces, experiences and visual systems.',
    icon: (
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5c0-1.1-.9-2-2-2h-1.6a1.9 1.9 0 0 0-1.8 2.5c.3.9-.4 1.8-1.3 1.8H12A3.5 3.5 0 0 1 8.5 11V9.5A2.5 2.5 0 0 1 11 7h1.3A1.7 1.7 0 0 0 14 5.3c0-1-.7-1.8-1.7-1.8H12Z" />
    ),
  },
  {
    value: 'technical',
    title: 'Technical',
    description: 'Develop software, APIs and technical products.',
    icon: (
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" />
    ),
  },
  {
    value: 'non-technical',
    title: 'Non-Technical',
    description: 'Build products without needing to write the code yourself.',
    icon: (
      <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5ZM4 8l8 4.5L20 8M12 12.5V20" />
    ),
  },
]

function validate(values, userType) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Enter your name.'
  }

  if (!values.email.trim()) {
    errors.email = 'Enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Enter a password.'
  } else if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!userType) {
    errors.userType = 'Please select the option that best describes you.'
  }

  return errors
}

function UserTypeIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export default function SignupPage() {
  const shouldReduceMotion = useReducedMotion()

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [userType, setUserType] = useState('')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  function selectUserType(event) {
    setUserType(event.target.value)

    setErrors((current) => ({
      ...current,
      userType: '',
    }))

    setAuthError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    console.log('SIGNUP BUTTON CLICKED')

    const nextErrors = validate(values, userType)

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      console.log('VALIDATION ERRORS:', nextErrors)
      return
    }

    setStatus('loading')
    setAuthError('')

    try {
      const response = await signup({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        userType,
      })

      console.log('SIGNUP SUCCESS:', response)

      setStatus('success')

      const verificationEmail =
        response?.email || values.email.trim().toLowerCase()

      sessionStorage.setItem(
        'pendingVerificationEmail',
        verificationEmail
      )

      sessionStorage.setItem(
        'pendingVerificationExpiresAt',
        String(
          Date.now() + (response?.expiresInSeconds || 600) * 1000
        )
      )

      sessionStorage.setItem(
        'pendingVerificationResendAt',
        String(
          Date.now() +
            (response?.resendCooldownSeconds || 60) * 1000
        )
      )

      window.location.href = `/verify-email?email=${encodeURIComponent(
        verificationEmail
      )}`
    } catch (error) {
      console.error('SIGNUP ERROR:', error)

      setStatus('error')

      setAuthError(
        error.message || 'Account creation failed. Please try again.'
      )
    }
  }

  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion
      ? false
      : { opacity: 0, y: 14 },

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

        <a className={styles.backLink} href="/">
          Back to CodeNova <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className={styles.layout}>
        <motion.section
          className={styles.formPanel}
          {...reveal()}
          aria-labelledby="signup-heading"
        >
          <div className={styles.formIntro}>
            <p className={styles.eyebrow}>DevPilot AI</p>

            <h1 id="signup-heading">
              Create your account
            </h1>

            <p>
              Start building software with DevPilot AI.
            </p>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* NAME */}

            <div className={styles.field}>
              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={values.name}
                onChange={updateField}
                placeholder="Your name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? 'name-error' : undefined
                }
              />

              <span
                id="name-error"
                className={styles.error}
                role="alert"
              >
                {errors.name}
              </span>
            </div>

            {/* EMAIL */}

            <div className={styles.field}>
              <label htmlFor="signup-email">
                Email address
              </label>

              <input
                id="signup-email"
                name="email"
                type="email"
                value={values.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email
                    ? 'signup-email-error'
                    : undefined
                }
              />

              <span
                id="signup-email-error"
                className={styles.error}
                role="alert"
              >
                {errors.email}
              </span>
            </div>

            {/* PASSWORDS */}

            <div className={styles.passwordFields}>
              <div className={styles.field}>
                <label htmlFor="signup-password">
                  Password
                </label>

                <div className={styles.passwordWrap}>
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={updateField}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <span className={styles.error}>
                  {errors.password ||
                    'Use at least 8 characters.'}
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <div className={styles.passwordWrap}>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={values.confirmPassword}
                    onChange={updateField}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(
                      errors.confirmPassword
                    )}
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowConfirmPassword(
                        (visible) => !visible
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>

                <span className={styles.error}>
                  {errors.confirmPassword ||
                    (values.confirmPassword &&
                    values.password ===
                      values.confirmPassword
                      ? 'Passwords match.'
                      : '')}
                </span>
              </div>
            </div>

            {/* USER TYPE */}

            <fieldset
              className={styles.userTypes}
              aria-describedby={
                errors.userType
                  ? 'user-type-error'
                  : undefined
              }
            >
              <legend>
                What best describes you?
              </legend>

              <div className={styles.typeGrid}>
                {USER_TYPES.map((type) => {
                  const isSelected =
                    userType === type.value

                  return (
                    <motion.label
                      key={type.value}
                      className={`${styles.typeCard} ${
                        isSelected
                          ? styles.typeCardSelected
                          : ''
                      }`}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : { y: -2 }
                      }
                      transition={{
                        duration: 0.18,
                      }}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={isSelected}
                        onChange={selectUserType}
                      />

                      <span className={styles.typeIcon}>
                        <UserTypeIcon>
                          {type.icon}
                        </UserTypeIcon>
                      </span>

                      <span className={styles.typeTitle}>
                        {type.title}
                      </span>

                      <span
                        className={
                          styles.typeDescription
                        }
                      >
                        {type.description}
                      </span>

                      {isSelected && (
                        <motion.span
                          className={styles.check}
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  scale: 0.75,
                                }
                          }
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{
                            duration:
                              shouldReduceMotion
                                ? 0
                                : 0.18,
                          }}
                          aria-hidden="true"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.label>
                  )
                })}
              </div>

              <span
                id="user-type-error"
                className={styles.error}
                role="alert"
              >
                {errors.userType}
              </span>
            </fieldset>

            {/* AUTH ERROR */}

            {authError && (
              <p
                className={styles.authError}
                role="alert"
              >
                {authError}
              </p>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className={styles.submit}
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? 'Creating account...'
                : 'Create Account'}
            </button>
          </form>

          <p className={styles.login}>
            Already have an account?{' '}
            <a href="/login">
              Log in
            </a>
          </p>
        </motion.section>

        <LoginVisualCarousel />
      </div>
    </main>
  )
}
