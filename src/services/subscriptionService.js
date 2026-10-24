import { createDemoCheckoutRequestBody } from './demoCheckoutPayload'
import { getCurrentUser, getCurrentUserRevision, setCurrentUser } from './authService'

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function requestDemoCheckout(method, body) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}/subscriptions/demo-checkout`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.success) throw new Error(data.message || 'Unable to complete demo checkout.')
  return data
}

export const getDemoCheckoutSummary = () => requestDemoCheckout('GET')
export const simulateDemoCheckout = (outcome) => requestDemoCheckout('POST', createDemoCheckoutRequestBody(outcome))

export async function refreshDemoSubscription() {
  const revision = getCurrentUserRevision()
  const summary = await getDemoCheckoutSummary()
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.email === summary.accountEmail && getCurrentUserRevision() === revision) {
    setCurrentUser({ ...currentUser, subscription: summary.subscription || null })
  }
  return summary
}

export async function cancelDemoSubscription() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}/subscriptions/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.success) throw new Error(data.message || 'Unable to cancel the demo subscription.')
  return data
}

