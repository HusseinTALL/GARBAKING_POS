/**
 * Validation Utilities
 * Common validation functions for forms and user input
 */

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const re = /^\+?[\d\s-()]+$/
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Calculate strength
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isLongEnough = password.length >= 8

  const strengthScore = [hasUppercase, hasLowercase, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length

  if (strengthScore <= 2) {
    strength = 'weak'
  } else if (strengthScore <= 4) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength
  }
}

export const validateCardNumber = (cardNumber: string): boolean => {
  // Luhn algorithm
  const digits = cardNumber.replace(/\D/g, '')

  if (digits.length < 13 || digits.length > 19) {
    return false
  }

  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export const validateCVC = (cvc: string, cardType?: string): boolean => {
  const digits = cvc.replace(/\D/g, '')

  if (cardType === 'amex') {
    return digits.length === 4
  }

  return digits.length === 3
}

export const validateExpiryDate = (expiry: string): boolean => {
  const match = expiry.match(/^(\d{2})\/(\d{2,4})$/)

  if (!match) return false

  const month = parseInt(match[1])
  let year = parseInt(match[2])

  // Convert 2-digit year to 4-digit
  if (year < 100) {
    year += 2000
  }

  if (month < 1 || month > 12) {
    return false
  }

  const now = new Date()
  const expiryDate = new Date(year, month - 1)

  return expiryDate > now
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

export const validateMatch = (value1: string, value2: string): boolean => {
  return value1 === value2
}

export const getCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '')

  // Visa
  if (/^4/.test(number)) {
    return 'visa'
  }

  // Mastercard
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
    return 'mastercard'
  }

  // American Express
  if (/^3[47]/.test(number)) {
    return 'amex'
  }

  // Discover
  if (/^6(?:011|5)/.test(number)) {
    return 'discover'
  }

  return 'unknown'
}

export const formatCardNumber = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '')
  const cardType = getCardType(number)

  if (cardType === 'amex') {
    // American Express: 4-6-5 format
    return number.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim()
  }

  // Most cards: 4-4-4-4 format
  return number.replace(/(\d{4})/g, '$1 ').trim()
}

export const formatExpiryDate = (expiry: string): string => {
  const numbers = expiry.replace(/\D/g, '')

  if (numbers.length >= 2) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 6)}`
  }

  return numbers
}

export const maskCardNumber = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '')
  const lastFour = number.slice(-4)
  return `${'*'.repeat(Math.max(0, number.length - 4))}${lastFour}`
}
