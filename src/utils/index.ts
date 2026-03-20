// utils

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
