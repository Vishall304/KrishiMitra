/** Development-only Firestore operation logging (no secrets). */
export const firestoreDevLog = {
  ok(collection: string, action: string, detail?: unknown) {
    if (import.meta.env.DEV) {
<<<<<<< HEAD
      console.info(`[KrishiMitra][Firestore][${collection}]`, action, detail ?? '')
=======
      console.info(`[AgriSathi][Firestore][${collection}]`, action, detail ?? '')
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    }
  },
  fail(collection: string, action: string, error: unknown) {
    if (import.meta.env.DEV) {
<<<<<<< HEAD
      console.error(`[KrishiMitra][Firestore][${collection}]`, action, error)
=======
      console.error(`[AgriSathi][Firestore][${collection}]`, action, error)
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    }
  },
}
