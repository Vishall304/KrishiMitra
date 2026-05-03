/** Development-only Firebase Storage logging (paths only, no URLs). */
export const storageDevLog = {
  ok(action: string, detail?: unknown) {
    if (import.meta.env.DEV) {
<<<<<<< HEAD
      console.info('[KrishiMitra][Storage]', action, detail ?? '')
=======
      console.info('[AgriSathi][Storage]', action, detail ?? '')
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    }
  },
  fail(action: string, error: unknown) {
    if (import.meta.env.DEV) {
<<<<<<< HEAD
      console.error('[KrishiMitra][Storage]', action, error)
=======
      console.error('[AgriSathi][Storage]', action, error)
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    }
  },
}
