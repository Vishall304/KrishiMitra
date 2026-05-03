export function formatAuthError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code ?? '')
    switch (code) {
      case 'auth/invalid-email':
        return 'That email doesn’t look valid.'
      case 'auth/user-disabled':
        return 'This account is disabled.'
      case 'auth/user-not-found':
        return 'No account found for this email.'
      case 'auth/wrong-password':
        return 'Incorrect password.'
      case 'auth/invalid-credential':
        return 'Invalid email or password.'
      case 'auth/email-already-in-use':
        return 'This email is already registered.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.'
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.'
      default:
        return (err instanceof Error ? err.message : null) || 'Something went wrong.'
    }
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}
