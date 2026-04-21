/**
 * Convert a raw Firestore / Firebase error into a user-friendly message.
 * Keeps the original message as a fallback.
 */
export function formatFirestoreError(err: unknown, action = 'load data'): string {
  const rawMessage = err instanceof Error ? err.message : String(err ?? '')
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: string }).code ?? '')
      : ''

  const text = `${code} ${rawMessage}`.toLowerCase()

  if (text.includes('permission') || code === 'permission-denied') {
    return "We couldn't access your records yet. Please try again — if it keeps failing, your farm admin needs to publish the Firebase security rules."
  }
  if (text.includes('unavailable') || code === 'unavailable') {
    return `Service is unavailable right now. Check your internet and retry.`
  }
  if (text.includes('network') || code === 'network-request-failed') {
    return 'Network error. Check your connection and retry.'
  }
  if (code === 'not-found') {
    return 'Record not found.'
  }

  return rawMessage || `Could not ${action}. Please try again.`
}
