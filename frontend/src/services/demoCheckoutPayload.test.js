import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoCheckoutRequestBody } from './demoCheckoutPayload.js'

test('demo checkout payload contains only the outcome, never card credentials', () => {
  const payload = createDemoCheckoutRequestBody('success')
  assert.deepEqual(payload, { outcome: 'success' })
  assert.equal('cardNumber' in payload, false)
  assert.equal('cvv' in payload, false)
})
