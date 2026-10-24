export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function passesLuhn(value) {
  const digits = value.replace(/[\s-]/g, '')
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  let doubleDigit = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (doubleDigit) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    doubleDigit = !doubleDigit
  }
  return sum % 10 === 0
}

export function validateCheckoutCard(values, now = new Date()) {
  const errors = {}
  if (!values.cardholder.trim()) errors.cardholder = 'Enter the cardholder name.'
  if (!passesLuhn(values.cardNumber)) errors.cardNumber = 'Enter a valid card number format (13–19 digits). This does not verify the card.'
  if (!/^\d{2}\/\d{2}$/.test(values.expiry)) errors.expiry = 'Enter expiry as MM/YY.'
  else {
    const [month, year] = values.expiry.split('/').map(Number)
    const currentYear = now.getFullYear() % 100
    if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < now.getMonth() + 1)) {
      errors.expiry = 'Enter a valid, unexpired date in MM/YY format.'
    }
  }
  if (!/^\d{3,4}$/.test(values.cvv)) errors.cvv = 'Enter a 3- or 4-digit CVV.'
  return errors
}
