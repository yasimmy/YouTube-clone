// User media is stored by the server. Only the returned URL is kept in the client database.

export async function uploadFile(file: File, kind: 'image' | 'video'): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Not in browser')

  const body = new FormData()
  body.append('file', file)
  body.append('kind', kind)

  const response = await fetch('/api/uploads', { method: 'POST', body })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.url) {
    throw new Error(result.error || 'Не удалось загрузить файл')
  }
  return result.url
}

export function saveAvatar(_userId: string, file: File): Promise<string> { return uploadFile(file, 'image') }
export function saveBanner(_userId: string, file: File): Promise<string> { return uploadFile(file, 'image') }
export function saveThumbnail(_videoId: string, file: File): Promise<string> { return uploadFile(file, 'image') }
export function saveVideo(file: File): Promise<string> { return uploadFile(file, 'video') }

// Kept for compatibility with existing code. Media is no longer read from localStorage.
export function getImageFromStorage(_key: string): string | null { return null }
export function getAvatar(_userId: string): string | null { return null }
export function getBanner(_userId: string): string | null { return null }
export function getThumbnail(_videoId: string): string | null { return null }
export function deleteAvatar(_userId: string): void {}
export function deleteBanner(_userId: string): void {}
export function deleteThumbnail(_videoId: string): void {}
