import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import codenovaLogo from '../../assets/branding/codenova-logo.svg'
import LoginVisualCarousel from '../../components/auth/LoginVisualCarousel'

import { login } from '../../services/authService'
import { getSafeRedirectPath } from '../../utils/routeRedirect'
import { loginPageStyles } from './LoginPage.styles'

const EASE = [0.16, 1, 0.3, 1]
const {
  page: pageClass,
  topbar: topbarClass,
  logoLink: logoLinkClass,
  logoImage: logoImageClass,
  backLink: backLinkClass,
  layout: layoutClass,
  formIntro: formIntroClass,
  eyebrow: eyebrowClass,
  heading: headingClass,
  introText: introTextClass,
  form: formClass,
  field: fieldClass,
  label: labelClass,
  input: inputClass,
  passwordInput: passwordInputClass,
  labelRow: labelRowClass,
  forgot: forgotClass,
  passwordWrap: passwordWrapClass,
  passwordToggle: passwordToggleClass,
  error: errorClass,
  authError: authErrorClass,
  submit: submitClass,
  signup: signupClass,
  legal: legalClass,
  inlineLink: inlineLinkClass,
} = loginPageStyles

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
  const location = useLocation()
  const navigate = useNavigate()
  const redirectPath = getSafeRedirectPath(location.state?.from)

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

      navigate(redirectPath, { replace: true })
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

        navigate(`/verify-email?email=${encodeURIComponent(error.email)}`, {
          state: { from: redirectPath },
        })
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
    <main className={pageClass}>
      <div className={topbarClass}>
        <Link
          to="/"
          className={logoLinkClass}
          aria-label="Go to Code Nova home"
        >
          <img
            src={codenovaLogo}
            alt="Code Nova"
            className={logoImageClass}
            width="190"
            height="36"
          />
        </Link>

        <Link
          className={backLinkClass}
          to="/"
        >
          Back to CodeNova{' '}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className={layoutClass}>
        <motion.section
          className="w-full"
          {...reveal()}
          aria-labelledby="login-heading"
        >
          <div className={formIntroClass}>
            <p className={eyebrowClass}>
              DevPilot AI
            </p>

            <h1 id="login-heading" className={headingClass}>
              Welcome back
            </h1>

            <p className={introTextClass}>
              Log in to continue building with DevPilot AI.
            </p>
          </div>

          <form
            className={formClass}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* EMAIL */}

            <div className={fieldClass}>
              <label htmlFor="email" className={labelClass}>
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
                className={inputClass}
              />

              <span
                id="email-error"
                className={errorClass}
                role="alert"
              >
                {errors.email}
              </span>
            </div>

            {/* PASSWORD */}

            <div className={fieldClass}>
              <div className={labelRowClass}>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>

                <a
                  href="/forgot-password"
                  className={forgotClass}
                >
                  Forgot password?
                </a>
              </div>

              <div className={passwordWrapClass}>
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
                  className={passwordInputClass}
                />

                <button
                  type="button"
                  className={passwordToggleClass}
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
                className={errorClass}
                role="alert"
              >
                {errors.password}
              </span>
            </div>

            {/* AUTH ERROR */}

            {authError && (
              <p
                className={authErrorClass}
                role="alert"
              >
                {authError}
              </p>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className={submitClass}
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? 'Logging in...'
                : 'Log in'}
            </button>
          </form>

          <p className={signupClass}>
            Don't have an account?{' '}
            <Link to="/signup" className={inlineLinkClass}>
              Sign up
            </Link>
          </p>

          <p className={legalClass}>
            By continuing, you agree to CodeNova's{' '}
            <a href="/terms" className={inlineLinkClass}>
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className={inlineLinkClass}>
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
