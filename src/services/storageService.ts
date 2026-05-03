import { getDownloadURL, ref, uploadBytes, type UploadMetadata } from 'firebase/storage'
import { getFirebaseStorage } from '../firebase/config'
import { storageDevLog } from '../lib/storageDevLog'

const MAX_IMAGE_BYTES = 15 * 1024 * 1024

function assertImageFile(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Please use a file under 15 MB.')
  }
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
}

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName && /^[a-z0-9]+$/i.test(fromName) && fromName.length <= 8) {
    return fromName.toLowerCase()
  }
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/gif') return 'gif'
  return 'jpg'
}

/**
 * Upload a profile image to `profileImages/{uid}/{timestamp}.{ext}` and return a download URL.
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  assertImageFile(file)
  const ext = extensionFor(file)
  const path = `profileImages/${uid}/${Date.now()}.${ext}`
  const storageRef = ref(getFirebaseStorage(), path)
  const metadata: UploadMetadata = {
    contentType: file.type || 'image/jpeg',
    customMetadata: { purpose: 'profile', uid },
  }
  try {
    await uploadBytes(storageRef, file, metadata)
    const url = await getDownloadURL(storageRef)
    storageDevLog.ok('uploadProfilePhoto', { path })
    return url
  } catch (e) {
    storageDevLog.fail('uploadProfilePhoto', e)
    throw e
  }
}

/**
 * Upload a crop photo to `cropImages/{uid}/{timestamp}.{ext}` and return a download URL.
 */
export async function uploadCropImage(uid: string, file: File): Promise<string> {
  assertImageFile(file)
  const ext = extensionFor(file)
  const path = `cropImages/${uid}/${Date.now()}.${ext}`
  const storageRef = ref(getFirebaseStorage(), path)
  const metadata: UploadMetadata = {
    contentType: file.type || 'image/jpeg',
    customMetadata: { purpose: 'crop', uid },
  }
  try {
    await uploadBytes(storageRef, file, metadata)
    const url = await getDownloadURL(storageRef)
    storageDevLog.ok('uploadCropImage', { path })
    return url
  } catch (e) {
    storageDevLog.fail('uploadCropImage', e)
    throw e
  }
}
