export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  timeout = 250,
): (...args: Parameters<T>) => void {
  let timeoutID: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn(...args), timeout)
  }
}

export function getConfidenceClass(confidence: number): string {
  if (confidence >= 90) return 'text-success'
  if (confidence >= 70) return 'text-warning'
  return 'text-danger'
}

export function validateJSON(data: unknown): string[] {
  // AI WARNING
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return ['Expected a JSON object']
  }

  const record = data as Record<string, unknown>
  const requiredStrings = [
    'city',
    'state',
    'country',
    'location',
    'explanation',
    'description',
  ]
  const requiredNumbers = ['confidence', 'latitude', 'longitude']
  const errors: string[] = []

  for (const key of requiredStrings) {
    if (!(key in record)) errors.push(`Missing required field: "${key}"`)
    else if (typeof record[key] !== 'string' || record[key].trim() === '')
      errors.push(`"${key}" must be a non-empty string`)
  }

  for (const key of requiredNumbers) {
    if (!(key in record)) errors.push(`Missing required field: "${key}"`)
    else if (typeof record[key] !== 'number' || isNaN(record[key]))
      errors.push(`"${key}" must be a number`)
  }

  if (
    typeof record.confidence === 'number' &&
    (record.confidence < 0 || record.confidence > 100)
  )
    errors.push('confidence must be between 0 and 100')
  if (
    typeof record.latitude === 'number' &&
    (record.latitude < -90 || record.latitude > 90)
  )
    errors.push('latitude must be between -90 and 90')
  if (
    typeof record.longitude === 'number' &&
    (record.longitude < -180 || record.longitude > 180)
  )
    errors.push('longitude must be between -180 and 180')

  return errors
}
