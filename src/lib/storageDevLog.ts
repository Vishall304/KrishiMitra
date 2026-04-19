/** Development-only Firebase Storage logging (paths only, no URLs). */
export const storageDevLog = {
  ok(action: string, detail?: unknown) {
    if (import.meta.env.DEV) {
      console.info('[AgriSathi][Storage]', action, detail ?? '')
    }
  },
  fail(action: string, error: unknown) {
    if (import.meta.env.DEV) {
      console.error('[AgriSathi][Storage]', action, error)
    }
  },
}
