import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { setCurrentUser, useCurrentUser } from '../../services/authService'
import { getDemoCheckoutSummary, simulateDemoCheckout } from '../../services/subscriptionService'
import { hasActiveProSubscription } from '../../utils/subscription'
import { formatCardNumber, validateCheckoutCard } from './checkoutValidation'

const formatPrice = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
const inputClass = 'min-h-12 w-full rounded-lg border border-[#d7d7d2] bg-white px-3.5 text-[15px] text-[#171717] outline-none transition placeholder:text-[#969691] hover:border-[#a6a6a0] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10 aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus:ring-red-600/10'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useCurrentUser()
  const cardNumberRef = useRef(null)
  const submitInFlight = useRef(false)
  const [summary, setSummary] = useState(null)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [values, setValues] = useState({ cardholder: '', cardNumber: '', expiry: '', cvv: '' })

  useEffect(() => {
    let active = true
    getDemoCheckoutSummary()
      .then((data) => { if (active) { setSummary(data); setStatus('ready') } })
      .catch((error) => { if (active) { setMessage(error.message); setStatus('error') } })
    return () => { active = false }
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    let nextValue = value
    if (name === 'cardNumber') {
      const digitsBeforeCaret = value.slice(0, event.target.selectionStart ?? value.length).replace(/\D/g, '').length
      nextValue = formatCardNumber(value)
      setValues((current) => ({ ...current, cardNumber: nextValue }))
      setErrors((current) => ({ ...current, cardNumber: '' }))
      setFormError('')
      requestAnimationFrame(() => {
        const input = cardNumberRef.current
        if (!input) return
        let caret = 0
        let digitsFound = 0
        while (caret < nextValue.length && digitsFound < digitsBeforeCaret) {
          if (/\d/.test(nextValue[caret])) digitsFound += 1
          caret += 1
        }
        input.setSelectionRange(caret, caret)
      })
      return
    }
    if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4)
      nextValue = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    }
    if (name === 'cvv') nextValue = value.replace(/\D/g, '').slice(0, 4)
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFormError('')
  }

  function handleCheckout(event) {
    event.preventDefault()
    if (!summary?.plan) return
    const nextErrors = validateCheckoutCard(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setConfirmOpen(true)
  }

  async function confirmPayment() {
    if (submitInFlight.current || busy) return
    submitInFlight.current = true
    setBusy(true)
    setFormError('')
    try {
      const result = await simulateDemoCheckout('success')
      if (!hasActiveProSubscription({ subscription: result.subscription })) {
        throw new Error('The server did not confirm an active Pro subscription. Your plan was not changed.')
      }
      setCurrentUser({ ...user, subscription: result.subscription })
      setValues({ cardholder: '', cardNumber: '', expiry: '', cvv: '' })
      setConfirmOpen(false)
      setMessage('Your Pro subscription is active.')
      setStatus('success')
    } catch (error) {
      setFormError(error.message || 'We could not confirm your subscription. Please try again.')
    } finally {
      setBusy(false)
      submitInFlight.current = false
    }
  }

  async function retrySummary() {
    setStatus('loading')
    setMessage('')
    try {
      setSummary(await getDemoCheckoutSummary())
      setStatus('ready')
    } catch (error) {
      setMessage(error.message || 'Could not load checkout details.')
      setStatus('error')
    }
  }

  const plan = summary?.plan
  const alreadyPro = hasActiveProSubscription({ subscription: summary?.subscription })
  const amount = plan ? formatPrice(plan.amount, plan.currency) : ''
  const total = plan ? formatPrice(Math.max(0, plan.amount - (plan.discount || 0)), plan.currency) : ''
  const maskedCard = `•••• •••• •••• ${values.cardNumber.replace(/\D/g, '').slice(-4)}`
  const cancelCheckout = () => navigate(location.state?.checkoutFrom || '/dashboard/pricing', { replace: true })

  return (
    <main className="min-h-dvh bg-white px-4 py-5 text-[#171717] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={cancelCheckout} className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-[#555] transition hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
          <span aria-hidden="true">←</span> Back
        </button>

        <header className="mb-6 mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8e8e4] pb-5 sm:mb-8 sm:pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#73736e]">DevPilot AI · Subscription</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.15rem]">Secure Checkout</h1>
          </div>
          <p className="max-w-lg text-sm leading-6 text-[#666]">Review your Pro subscription and enter card details to continue.</p>
        </header>

        <div className="mb-6 border-l-2 border-[#777] bg-[#f7f7f5] px-4 py-3 text-sm text-[#454540] sm:mb-8">
          Simulated transaction — no charge will be made.
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <section aria-labelledby="card-details-title" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="card-details-title" className="text-xl font-semibold tracking-tight">Card details</h2>
                <p className="mt-1 text-sm text-[#6a6a65]">Account: <span className="font-medium text-[#333]">{summary?.accountEmail || user?.email || 'Loading…'}</span></p>
              </div>
            </div>

            {status === 'loading' && <p className="py-6 text-sm text-[#666]" role="status">Loading checkout details…</p>}
            {status === 'error' && <div className="my-4 border-l-2 border-red-700 bg-red-50 px-4 py-3" role="alert"><p className="text-sm text-red-800">{message}</p><button type="button" onClick={retrySummary} className="mt-2 min-h-9 text-sm font-semibold text-red-900 underline underline-offset-4">Retry</button></div>}

            {status === 'success' ? (
              <div className="mt-7 border-y border-[#d9e9dc] bg-[#f5faf6] px-5 py-5" role="status" aria-live="polite">
                <h2 className="text-lg font-semibold">Pro is active</h2>
                <p className="mt-1 text-sm text-[#4f5e52]">{message}</p>
                <Link to="/dashboard" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#383838] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Go to dashboard</Link>
              </div>
            ) : status !== 'loading' && status !== 'error' && (
              <form className="border-t border-[#e8e8e4] pt-5" onSubmit={handleCheckout} noValidate>
                {alreadyPro && <p className="mb-4 bg-[#f4f4f2] px-3.5 py-3 text-sm text-[#4b4b46]">Your Pro subscription is already active.</p>}
                {formError && <p className="mb-4 border-l-2 border-red-700 bg-red-50 px-3.5 py-3 text-sm text-red-800" role="alert">{formError}</p>}

                <div className="grid gap-4 sm:gap-5">
                  <label className="grid gap-2 text-sm font-medium" htmlFor="cardholder">Cardholder name
                    <input id="cardholder" name="cardholder" autoComplete="off" value={values.cardholder} onChange={updateField} placeholder="Name on card" aria-invalid={Boolean(errors.cardholder)} aria-describedby={errors.cardholder ? 'cardholder-error' : undefined} className={inputClass} />
                    {errors.cardholder && <span id="cardholder-error" className="text-xs font-normal text-red-700">{errors.cardholder}</span>}
                  </label>
                  <label className="grid gap-2 text-sm font-medium" htmlFor="card-number">Card number
                    <input ref={cardNumberRef} id="card-number" name="cardNumber" inputMode="numeric" autoComplete="off" value={values.cardNumber} onChange={updateField} placeholder="Card number" aria-invalid={Boolean(errors.cardNumber)} aria-describedby={errors.cardNumber ? 'card-number-error' : 'card-number-help'} className={`${inputClass} tabular-nums tracking-[0.04em]`} />
                    {errors.cardNumber ? <span id="card-number-error" className="text-xs font-normal text-red-700">{errors.cardNumber}</span> : <span id="card-number-help" className="text-xs font-normal text-[#777]">Format validation only; this does not verify a card.</span>}
                  </label>
                  <div className="grid grid-cols-2 gap-4 sm:gap-5">
                    <label className="grid gap-2 text-sm font-medium" htmlFor="expiry">Expiry date
                      <input id="expiry" name="expiry" inputMode="numeric" autoComplete="off" value={values.expiry} onChange={updateField} placeholder="MM/YY" aria-invalid={Boolean(errors.expiry)} aria-describedby={errors.expiry ? 'expiry-error' : undefined} className={`${inputClass} tabular-nums`} />
                      {errors.expiry && <span id="expiry-error" className="text-xs font-normal text-red-700">{errors.expiry}</span>}
                    </label>
                    <label className="grid gap-2 text-sm font-medium" htmlFor="cvv">CVV
                      <input id="cvv" name="cvv" inputMode="numeric" autoComplete="off" maxLength={4} value={values.cvv} onChange={updateField} placeholder="CVV" aria-invalid={Boolean(errors.cvv)} aria-describedby={errors.cvv ? 'cvv-error' : undefined} className={`${inputClass} tabular-nums`} />
                      {errors.cvv && <span id="cvv-error" className="text-xs font-normal text-red-700">{errors.cvv}</span>}
                    </label>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button type="submit" disabled={!plan || busy || alreadyPro} className="min-h-12 rounded-lg bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#383838] active:bg-black disabled:cursor-not-allowed disabled:bg-[#bdbdb8] disabled:text-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Checkout</button>
                  <button type="button" onClick={cancelCheckout} className="min-h-12 rounded-lg border border-[#d5d5d0] px-5 py-3 text-sm font-medium text-[#41413d] transition hover:border-[#8b8b85] hover:bg-[#f7f7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Cancel Checkout</button>
                </div>
              </form>
            )}
          </section>

          <aside className="h-fit min-w-0 border-t border-[#e1e1dc] bg-[#f8f8f6] px-4 py-5 sm:px-5 lg:sticky lg:top-8 lg:border-0 lg:px-5" aria-labelledby="summary-title">
            <h2 id="summary-title" className="text-base font-semibold">Order summary</h2>
            {!plan ? <p className="mt-4 text-sm text-[#666]">Plan details will appear here.</p> : <>
              <div className="mt-4 flex items-start justify-between gap-4 border-b border-[#deded9] pb-4">
                <div><p className="font-medium">{plan.name} subscription</p><p className="mt-1 text-sm text-[#686863]">Billed {plan.interval}</p></div>
                <p className="shrink-0 font-semibold tabular-nums">{amount}</p>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm leading-5 text-[#555]">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><span aria-hidden="true" className="font-semibold text-[#555]">✓</span><span>{feature}</span></li>)}</ul>
              <dl className="mt-5 space-y-3 border-t border-[#deded9] pt-4 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-[#62625d]">Subtotal</dt><dd className="tabular-nums">{amount}</dd></div>
                {plan.discount > 0 && <div className="flex justify-between gap-3"><dt className="text-[#62625d]">Discount</dt><dd className="tabular-nums">−{formatPrice(plan.discount, plan.currency)}</dd></div>}
                <div className="flex justify-between gap-3 border-t border-[#deded9] pt-3 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{total}</dd></div>
              </dl>
            </>}
          </aside>
        </div>

        {confirmOpen && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setConfirmOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="confirm-payment-title" className="my-auto w-full max-w-md bg-white p-5 shadow-2xl sm:p-7" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) setConfirmOpen(false) }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#73736e]">Subscription confirmation</p>
            <h2 id="confirm-payment-title" className="mt-2 text-2xl font-semibold tracking-tight">Confirm your payment</h2>
            <dl className="mt-5 divide-y divide-[#e8e8e4] border-y border-[#e8e8e4] text-sm">
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Plan</dt><dd className="font-medium">{plan?.name}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Price</dt><dd className="font-medium">{total} / {plan?.interval}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Cardholder name</dt><dd className="text-right font-medium">{values.cardholder.trim()}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-[#666]">Card number</dt><dd className="font-medium tabular-nums">{maskedCard}</dd></div>
            </dl>
            {formError && <p className="mt-4 text-sm text-red-700" role="alert">{formError}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={busy} onClick={confirmPayment} className="min-h-12 rounded-lg bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#383838] disabled:cursor-not-allowed disabled:bg-[#bdbdb8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">{busy ? 'Confirming…' : 'Confirm Payment'}</button>
              <button type="button" disabled={busy} onClick={() => setConfirmOpen(false)} className="min-h-12 rounded-lg border border-[#d5d5d0] px-4 py-3 text-sm font-medium transition hover:bg-[#f7f7f5] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Go Back</button>
            </div>
          </section>
        </div>}
      </div>
    </main>
  )
}
