import test from 'node:test'
import assert from 'node:assert/strict'
import { getCurrentPlanId, hasActiveProSubscription } from './subscription.js'

test('only an active saved Pro subscription grants the Pro plan state', () => {
  assert.equal(getCurrentPlanId({ plan: 'pro', subscriptionPlan: 'pro' }), 'free')
  assert.equal(getCurrentPlanId({ subscription: { plan: 'pro', status: 'canceled', activatedAt: new Date().toISOString() } }), 'free')
  assert.equal(hasActiveProSubscription({ subscription: { plan: 'pro', status: 'active' } }), true)
  assert.equal(getCurrentPlanId({ subscription: { plan: 'pro', status: 'active' } }), 'pro')
})
