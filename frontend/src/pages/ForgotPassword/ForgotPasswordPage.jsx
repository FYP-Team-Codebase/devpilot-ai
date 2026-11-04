import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import codenovaLogo from '../../assets/branding/codenova-logo.svg'
import LoginVisualCarousel from '../../components/auth/LoginVisualCarousel'
import { requestPasswordReset, verifyPasswordResetOtp, resetPassword } from '../../services/authService'
import { loginPageStyles as styles } from '../Login/LoginPage.styles'
import { verifyEmailPageStyles as verificationStyles } from '../VerifyEmail/VerifyEmailPage.styles'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const headingRef = useRef(null)
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [visible, setVisible] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => { headingRef.current?.focus() }, [step])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  async function sendCode() {
    const data = await requestPasswordReset(email.trim().toLowerCase())
    setEmail(email.trim().toLowerCase())
    setResetToken('')
    setOtp('')
    setPassword('')
    setConfirmation('')
    setCooldown(Date.now() + data.resendCooldownSeconds * 1000)
    setDeadline(Date.now() + data.expiresInSeconds * 1000)
    setNotice(`${data.message} Check your inbox and spam folder. If it does not arrive, you can request another code.`)
    setStep('otp')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setError('')
    if (step === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    if (step === 'otp' && !/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit reset code.')
      return
    }
    if (step === 'password' && (password.length < 8 || !confirmation || password !== confirmation)) {
      setError(password.length < 8 ? 'Use at least 8 characters.' : 'The passwords must match.')
      return
    }
    setBusy(true)
    try {
      if (step === 'email') await sendCode()
      else if (step === 'otp') {
        const data = await verifyPasswordResetOtp(email, otp)
        setResetToken(data.resetToken)
        setOtp('')
        setDeadline(Date.now() + data.expiresInSeconds * 1000)
        setNotice('Code verified. Choose your new password.')
        setStep('password')
      } else {
        await resetPassword(resetToken, password)
        setResetToken('')
        setPassword('')
        setConfirmation('')
        navigate('/login', { replace: true, state: { passwordReset: true } })
      }
    } catch (failure) {
      setError(failure.message || 'Unable to complete password reset. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    if (busy || cooldown > Date.now()) return
    setBusy(true)
    setError('')
    try { await sendCode() }
    catch (failure) { setError(failure.message || 'Unable to request a code. Please try again.') }
    finally { setBusy(false) }
  }

  const expired = deadline > 0 && now >= deadline
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000))
  const resendSeconds = Math.max(0, Math.ceil((cooldown - now) / 1000))
  const heading = step === 'email' ? 'Forgot your password?' : step === 'otp' ? 'Check your email' : 'Create a new password'

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <Link to="/" className={styles.logoLink} aria-label="Go to Code Nova home">
          <img src={codenovaLogo} alt="Code Nova" className={styles.logoImage} width="190" height="36" />
        </Link>
        <Link to="/login" className={styles.backLink}>Back to login</Link>
      </div>
      <div className={styles.layout}>
        <section className="w-full" aria-labelledby="reset-heading">
          <div className={styles.formIntro}>
            <p className={styles.eyebrow}>DevPilot AI</p>
            <h1 id="reset-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>{heading}</h1>
            <p className={styles.introText}>
              {step === 'email' ? 'Enter your account email and we’ll send a verification code to help you reset your password.' : step === 'otp' ? `Enter the six-digit reset code for ${email}.` : 'Use at least 8 characters for your new password.'}
            </p>
          </div>
          <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
            {step === 'email' && (
              <div className={styles.field}>
                <label htmlFor="reset-email" className={styles.label}>Email address</label>
                <input id="reset-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} disabled={busy} className={styles.input} placeholder="you@example.com" aria-invalid={Boolean(error)} aria-describedby={error ? 'reset-error' : undefined} />
              </div>
            )}
            {step === 'otp' && (
              <div className={styles.field}>
                <label htmlFor="reset-otp" className={styles.label}>Verification code</label>
                <input id="reset-otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} disabled={busy} className={`${styles.input} font-mono tracking-[0.3em]`} aria-invalid={Boolean(error)} aria-describedby={error ? 'reset-error' : undefined} />
              </div>
            )}
            {step === 'password' && [
              { id: 'new-password', label: 'New password', value: password, setter: setPassword },
              { id: 'confirm-password', label: 'Confirm new password', value: confirmation, setter: setConfirmation },
            ].map(({ id, label, value, setter }) => (
              <div key={id} className={styles.field}>
                <label htmlFor={id} className={styles.label}>{label}</label>
                <div className={styles.passwordWrap}>
                  <input id={id} name={id} type={visible[id] ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={value} onChange={(event) => { setter(event.target.value); setError('') }} disabled={busy} className={styles.passwordInput} aria-invalid={Boolean(error)} aria-describedby={error ? 'reset-error' : undefined} />
                  <button type="button" className={styles.passwordToggle} aria-label={`${visible[id] ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={Boolean(visible[id])} onClick={() => setVisible((current) => ({ ...current, [id]: !current[id] }))}>{visible[id] ? 'Hide' : 'Show'}</button>
                </div>
              </div>
            ))}
            {step !== 'email' && <p className={verificationStyles.timerBase}>{expired ? 'This reset step has expired. Request a new code.' : `${step === 'otp' ? 'Code' : 'Reset authorization'} expires in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</p>}
            {notice && <p className={verificationStyles.notice} role="status">{notice}</p>}
            {error && <p id="reset-error" className={styles.authError} role="alert">{error}</p>}
            <button type="submit" className={styles.submit} disabled={busy || (step !== 'email' && expired)}>{busy ? 'Please wait...' : step === 'email' ? 'Send reset code' : step === 'otp' ? 'Verify code' : 'Reset password'}</button>
            {step !== 'email' && (
              <div className={verificationStyles.resend}>
                <button type="button" className={verificationStyles.resendButton} disabled={busy || resendSeconds > 0} onClick={resend}>{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Send a new code'}</button>
                <button type="button" className={verificationStyles.resendButton} disabled={busy} onClick={() => { setStep('email'); setResetToken(''); setOtp(''); setPassword(''); setConfirmation(''); setError(''); setNotice('') }}>Change email</button>
              </div>
            )}
          </form>
          <p className={styles.signup}><Link to="/login" className={styles.inlineLink}>Back to login</Link></p>
        </section>
        <LoginVisualCarousel />
      </div>
    </main>
  )
}
