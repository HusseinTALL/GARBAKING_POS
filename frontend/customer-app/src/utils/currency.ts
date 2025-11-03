const DEFAULT_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0
})

export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return DEFAULT_FORMATTER.format(0)
  }

  return DEFAULT_FORMATTER.format(Math.round(amount))
}

export const formatCurrencyWithDecimals = (amount: number, fractionDigits = 2): string => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return DEFAULT_FORMATTER.format(0)
  }

  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits
  })

  return formatter.format(amount)
}
