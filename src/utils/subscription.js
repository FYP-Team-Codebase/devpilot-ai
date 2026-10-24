export function getCurrentPlanId(user) {
  const subscription = user?.subscription
  if (subscription?.status !== 'active') return 'free'
  const plan = String(subscription.plan || '').trim().toLowerCase()
  return plan === 'pro' || plan === 'team' ? plan : 'free'
}

export function hasActiveProSubscription(user) {
  return getCurrentPlanId(user) === 'pro'
}
