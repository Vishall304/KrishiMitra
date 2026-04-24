/** Development-only Firestore operation logging (no secrets). */
export const firestoreDevLog = {
  ok(collection: string, action: string, detail?: unknown) {
    if (import.meta.env.DEV) {
      console.info(`[KrishiMitra][Firestore][${collection}]`, action, detail ?? '')
    }
  },
  fail(collection: string, action: string, error: unknown) {
    if (import.meta.env.DEV) {
      console.error(`[KrishiMitra][Firestore][${collection}]`, action, error)
    }
  },
}
