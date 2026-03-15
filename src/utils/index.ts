// utils

export function debounce(fn: Function, timeout = 250) {
  let timeoutID: ReturnType<typeof setTimeout>
  return (...args: unknown[]) => {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn(...args), timeout)
  }
}

export function getConfidenceClass(confidence: number): string {
  if (confidence >= 90) return 'text-success'
  if (confidence >= 70) return 'text-warning'
  return 'text-danger'
}
