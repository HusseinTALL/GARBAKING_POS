export const parseIsoDateTime = (value?: string | null | Date): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const parseIsoDate = (value?: string | null | Date): Date | null => {
  const parsed = parseIsoDateTime(value)
  if (!parsed) {
    return null
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

export const toIsoString = (value?: string | null | Date): string | null => {
  const parsed = parseIsoDateTime(value)
  return parsed ? parsed.toISOString() : null
}

export const formatDate = (
  value?: string | null | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const parsed = parseIsoDateTime(value)
  if (!parsed) {
    return ''
  }

  return new Intl.DateTimeFormat('en-GB', options).format(parsed)
}

export const formatDateTime = (
  value?: string | null | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const parsed = parseIsoDateTime(value)
  if (!parsed) {
    return ''
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }).format(parsed)
}

export const formatTime = (
  value?: string | null | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const parsed = parseIsoDateTime(value)
  if (!parsed) {
    return ''
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }).format(parsed)
}
