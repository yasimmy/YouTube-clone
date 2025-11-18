// File persistence utilities - save avatars, banners, thumbnails to localStorage as base64

export function saveImageToStorage(key: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      try {
        localStorage.setItem(key, base64)
        resolve(base64)
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function getImageFromStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

export function saveAvatar(userId: string, file: File): Promise<string> {
  return saveImageToStorage(`yt2-avatar-${userId}`, file)
}

export function saveBanner(userId: string, file: File): Promise<string> {
  return saveImageToStorage(`yt2-banner-${userId}`, file)
}

export function saveThumbnail(videoId: string, file: File): Promise<string> {
  return saveImageToStorage(`yt2-thumbnail-${videoId}`, file)
}

export function getAvatar(userId: string): string | null {
  return getImageFromStorage(`yt2-avatar-${userId}`)
}

export function getBanner(userId: string): string | null {
  return getImageFromStorage(`yt2-banner-${userId}`)
}

export function getThumbnail(videoId: string): string | null {
  return getImageFromStorage(`yt2-thumbnail-${videoId}`)
}

export function deleteAvatar(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`yt2-avatar-${userId}`)
}

export function deleteBanner(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`yt2-banner-${userId}`)
}

export function deleteThumbnail(videoId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`yt2-thumbnail-${videoId}`)
}


