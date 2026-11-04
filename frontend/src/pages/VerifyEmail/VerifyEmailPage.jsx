import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import codenovaLogo from '../../assets/branding/codenova-logo.svg'
import LoginVisualCarousel from '../../components/auth/LoginVisualCarousel'
import {
  resendVerification,
  verifyEmail,
} from '../../services/authService'
import { getSafeRedirectPath } from '../../utils/routeRedirect'
import { verifyEmailPageStyles } from './VerifyEmailPage.styles'

const EASE = [0.16, 1, 0.3, 1]
const CODE_LENGTH = 6
const DEFAULT_EXPIRES_IN_SECONDS = 600
const DEFAULT_RESEND_COOLDOWN_SECONDS = 60
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
  emailInput: emailInputClass,
  otpGroup: otpGroupClass,
  otpInput: otpInputClass,
  error: errorClass,
  authError: authErrorClass,
  notice: noticeClass,
  submit: submitClass,
  emailBadge: emailBadgeClass,
  timerBase: timerBaseClass,
  timerExpired: timerExpiredClass,
  successState: successStateClass,
  resend: resendClass,
  resendButton: resendButtonClass,
} = verifyEmailPageStyles

function getInitialEmail() {
  const params = new URLSearchParams(window.location.search)
  const emailFromUrl = params.get('email')
  const emailFromSession = sessionStorage.getItem(
    'pendingVerificationEmail'
  )

  return emailFromUrl || emailFromSession || ''
}

function getInitialDeadline(storageKey, fallbackSeconds) {
  const storedValue = Number(sessionStorage.getItem(storageKey))

  if (Number.isFinite(storedValue) && storedValue > Date.now()) {
    return storedValue
  }

  return Date.now() + fallbackSeconds * 1000
}

function getSecondsUntil(deadline) {
  return Math.max(Math.ceil((deadline - Date.now()) / 1000), 0)
}

function getFutureDeadline(seconds) {
  return Date.now() + seconds * 1000
}

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function validateCode(code) {
  if (!code.trim()) {
    return 'Enter the 6-digit verification code.'
  }

  if (!/^\d{6}$/.test(code.trim())) {
    return 'Enter a valid 6-digit code.'
  }

  return ''
}

export default function VerifyEmailPage() {
  const shouldReduceMotion = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const redirectPath = getSafeRedirectPath(location.state?.from)
  const inputRefs = useRef([])

  const [email, setEmail] = useState(getInitialEmail)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [authError, setAuthError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('idle')
  const [resendStatus, setResendStatus] = useState('idle')
  const [expiresAt, setExpiresAt] = useState(() =>
    getInitialDeadline(
      'pendingVerificationExpiresAt',
      DEFAULT_EXPIRES_IN_SECONDS
    )
  )
  const [resendAvailableAt, setResendAvailableAt] = useState(() =>
    getInitialDeadline(
      'pendingVerificationResendAt',
      DEFAULT_RESEND_COOLDOWN_SECONDS
    )
  )
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    getSecondsUntil(expiresAt)
  )
  const [resendSecondsRemaining, setResendSecondsRemaining] =
    useState(() => getSecondsUntil(resendAvailableAt))

  const isVerified = status === 'success'
  const codeDigits = Array.from({ length: CODE_LENGTH }, (_, index) =>
    code[index] || ''
  )

  useEffect(() => {
    if (!isVerified) return undefined

    const redirectTimer = window.setTimeout(() => {
      navigate(redirectPath, { replace: true })
    }, 1200)

    return () => window.clearTimeout(redirectTimer)
  }, [isVerified, navigate, redirectPath])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining(getSecondsUntil(expiresAt))
      setResendSecondsRemaining(getSecondsUntil(resendAvailableAt))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [expiresAt, resendAvailableAt])

  const description = useMemo(() => {
    if (email) {
      return "We've sent a 6-digit verification code to your email address."
    }

    return "Enter your email address and the 6-digit verification code we've sent you."
  }, [email])

  function clearMessages() {
    setCodeError('')
    setEmailError('')
    setAuthError('')
    setNotice('')
  }

  function updateEmail(event) {
    setEmail(event.target.value)
    clearMessages()
  }

  function focusInput(index) {
    inputRefs.current[index]?.focus()
    inputRefs.current[index]?.select()
  }

  function setDigit(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const nextDigits = codeDigits.slice()
    nextDigits[index] = digit

    setCode(nextDigits.join('').slice(0, CODE_LENGTH))
    clearMessages()

    if (digit && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  function handleDigitKeyDown(index, event) {
    if (event.key === 'Backspace' && !codeDigits[index] && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault()
      focusInput(index + 1)
    }
  }

  function handleCodePaste(event) {
    const pastedCode = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)

    if (!pastedCode) {
      return
    }

    event.preventDefault()
    setCode(pastedCode)
    clearMessages()
    focusInput(Math.min(pastedCode.length, CODE_LENGTH) - 1)
  }

  function storeVerificationTiming(data) {
    const expiresInSeconds =
      data?.expiresInSeconds || DEFAULT_EXPIRES_IN_SECONDS
    const resendCooldownSeconds =
      data?.resendCooldownSeconds ||
      DEFAULT_RESEND_COOLDOWN_SECONDS
    const nextExpiresAt = getFutureDeadline(expiresInSeconds)
    const nextResendAt = getFutureDeadline(resendCooldownSeconds)

    setExpiresAt(nextExpiresAt)
    setResendAvailableAt(nextResendAt)
    setSecondsRemaining(expiresInSeconds)
    setResendSecondsRemaining(resendCooldownSeconds)
    sessionStorage.setItem(
      'pendingVerificationExpiresAt',
      String(nextExpiresAt)
    )
    sessionStorage.setItem(
      'pendingVerificationResendAt',
      String(nextResendAt)
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()
    const nextCodeError = validateCode(code)
    const nextEmailError = normalizedEmail
      ? ''
      : 'Enter the email address you used for signup.'

    setCodeError(nextCodeError)
    setEmailError(nextEmailError)

    if (nextCodeError || nextEmailError) {
      return
    }

    setStatus('loading')
    setAuthError('')
    setNotice('')

    try {
      const data = await verifyEmail(normalizedEmail, code.trim())

      sessionStorage.removeItem('pendingVerificationEmail')
      sessionStorage.removeItem('pendingVerificationExpiresAt')
      sessionStorage.removeItem('pendingVerificationResendAt')
      setStatus('success')
      setNotice(data.message || 'Email verified successfully.')
    } catch (error) {
      setStatus('error')
      setAuthError(
        error.message || 'Email verification failed. Please try again.'
      )
    }
  }

  async function handleResend() {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setEmailError('Enter your email address before resending.')
      return
    }

    if (resendSecondsRemaining > 0) {
      setAuthError(
        `Too many requests. Please wait ${resendSecondsRemaining} seconds before requesting another code.`
      )
      return
    }

    setResendStatus('loading')
    setAuthError('')
    setNotice('')

    try {
      const data = await resendVerification(normalizedEmail)

      sessionStorage.setItem(
        'pendingVerificationEmail',
        normalizedEmail
      )

      storeVerificationTiming(data)
      setCode('')
      setResendStatus('success')
      setNotice(data.message || 'A new verification code has been sent.')
      focusInput(0)
    } catch (error) {
      if (error.retryAfterSeconds) {
        const nextResendAt = getFutureDeadline(
          error.retryAfterSeconds
        )
        setResendAvailableAt(nextResendAt)
        setResendSecondsRemaining(error.retryAfterSeconds)
        sessionStorage.setItem(
          'pendingVerificationResendAt',
          String(nextResendAt)
        )
      }

      setResendStatus('error')
      setAuthError(
        error.message || 'Could not resend the verification code.'
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

        <Link className={backLinkClass} to="/login" state={{ from: redirectPath }}>
          Back to login <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>

      <div className={layoutClass}>
        <motion.section
          className="w-full"
          {...reveal()}
          aria-labelledby="verify-heading"
        >
          <div className={formIntroClass}>
            <p className={eyebrowClass}>DevPilot AI</p>

            <h1 id="verify-heading" className={headingClass}>
              {isVerified ? 'Email verified' : 'Verify your email'}
            </h1>

            <p className={introTextClass}>
              {isVerified
                ? 'Your account is ready. Welcome to DevPilot AI.'
                : description}
            </p>
          </div>

          {isVerified ? (
            <div className={successStateClass} role="status">
              <p className="m-0 text-base font-bold text-dp-success-strong">{notice || 'Email verified successfully.'}</p>
              <span className="mt-2 block text-[13px] text-dp-success">Redirecting to your dashboard...</span>
            </div>
          ) : (
            <form
              className={formClass}
              onSubmit={handleSubmit}
              noValidate
            >
              {email ? (
                <div className={emailBadgeClass}>
                  <span className="text-[12px] leading-[1.2] text-dp-text">Email address</span>
                  <strong className="min-w-0 [overflow-wrap:anywhere] text-[15px] font-semibold leading-[1.35] text-dp-black">{email}</strong>
                </div>
              ) : (
                <div className={fieldClass}>
                  <label htmlFor="verify-email" className={labelClass}>
                    Email address
                  </label>

                  <input
                    id="verify-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={updateEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={
                      emailError
                        ? 'verify-email-error'
                        : undefined
                    }
                    className={emailInputClass}
                  />

                  <span
                    id="verify-email-error"
                    className={errorClass}
                    role="alert"
                  >
                    {emailError}
                  </span>
                </div>
              )}

              {emailError && email && (
                <span className={errorClass} role="alert">
                  {emailError}
                </span>
              )}

              <div className={fieldClass}>
                <label htmlFor="verification-code-0" className={labelClass}>
                  Verification code
                </label>

                <div
                  className={otpGroupClass}
                  onPaste={handleCodePaste}
                >
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element
                      }}
                      id={
                        index === 0
                          ? 'verification-code-0'
                          : undefined
                      }
                      type="text"
                      value={digit}
                      onChange={(event) =>
                        setDigit(index, event.target.value)
                      }
                      onKeyDown={(event) =>
                        handleDigitKeyDown(index, event)
                      }
                      inputMode="numeric"
                      autoComplete={
                        index === 0 ? 'one-time-code' : 'off'
                      }
                      maxLength={1}
                      aria-label={`Verification code digit ${
                        index + 1
                      }`}
                      aria-invalid={Boolean(codeError)}
                      className={otpInputClass}
                    />
                  ))}
                </div>

                <span className={errorClass} role="alert">
                  {codeError}
                </span>
              </div>

              <div
                className={`${timerBaseClass} ${
                  secondsRemaining === 0 ? timerExpiredClass : ''
                }`}
                role="status"
              >
                <span>
                  {secondsRemaining === 0
                    ? 'Verification code expired'
                    : 'Code expires in'}
                </span>
                <strong className={`font-mono text-[14px] font-bold ${secondsRemaining === 0 ? 'text-dp-error-text' : 'text-dp-black'}`}>{formatCountdown(secondsRemaining)}</strong>
              </div>

              {authError && (
                <p className={authErrorClass} role="alert">
                  {authError}
                </p>
              )}

              {notice && (
                <p className={noticeClass} role="status">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                className={submitClass}
                disabled={status === 'loading'}
              >
                {status === 'loading'
                  ? 'Verifying...'
                  : 'Verify Email'}
              </button>

              <div className={resendClass}>
                <span>Didn't receive the code?</span>

                <button
                  type="button"
                  onClick={handleResend}
                  className={resendButtonClass}
                  disabled={
                    resendStatus === 'loading' ||
                    resendSecondsRemaining > 0
                  }
                >
                  {resendStatus === 'loading'
                    ? 'Sending...'
                    : resendSecondsRemaining > 0
                      ? `Resend in ${resendSecondsRemaining}s`
                      : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </motion.section>

        <LoginVisualCarousel />
      </div>
    </main>
  )
}
