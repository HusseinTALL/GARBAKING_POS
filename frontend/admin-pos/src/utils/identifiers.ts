export const toNumericId = <T extends string | number | null | undefined>(value: T): number | null => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const assertNumericId = (value: string | number, context: string): number => {
  const parsed = toNumericId(value)
  if (parsed === null) {
    throw new Error(`Expected numeric id for ${context} but received: ${value}`)
  }
  return parsed
}
