import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCardNumber, passesLuhn, validateCheckoutCard } from './checkoutValidation.js'

function validNumber(length) {
  const base = '8'.repeat(length - 1)
  for (let digit = 0; digit <= 9; digit += 1) {
    if (passesLuhn(`${base}${digit}`)) return `${base}${digit}`
  }
  throw new Error('Could not create a Luhn-valid test value')
}

test('formats ordinary card input and accepts Luhn-valid lengths from 13 through 19', () => {
  assert.equal(formatCardNumber('1234-5678 9012 3456 789'), '1234 5678 9012 3456 789')
  for (let length = 13; length <= 19; length += 1) assert.equal(passesLuhn(validNumber(length)), true)
  assert.equal(passesLuhn('1234 5678 9012'), false)
})

test('validates required name, expiry, and CVV without claiming card verification', () => {
  const now = new Date(2026, 9, 24)
  const valid = { cardholder: 'Sample Person', cardNumber: validNumber(16), expiry: '12/30', cvv: '123' }
  assert.deepEqual(validateCheckoutCard(valid, now), {})
  assert.match(validateCheckoutCard({ ...valid, cardholder: '  ' }, now).cardholder, /name/i)
  assert.match(validateCheckoutCard({ ...valid, expiry: '01/20' }, now).expiry, /unexpired/i)
  assert.match(validateCheckoutCard({ ...valid, cvv: '12' }, now).cvv, /3- or 4-digit/i)
})
