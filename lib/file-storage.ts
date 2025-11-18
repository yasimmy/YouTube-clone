// File storage utilities for avatars, banners, and videos

export function getAvatarPath(userId: string, filename: string): string {
  return `/img/${userId}/${filename}`
}

export function getBannerPath(userId: string, filename: string): string {
  return `/img/${userId}/${filename}`
}

export function getVideoPath(userId: string, filename: string): string {
  return `/video/${userId}/${filename}`
}

export function ensureUserDirectories(userId: string): void {
  // This would create directories on the server side
  // For now, we'll just return the paths
  // In production, this would use fs.mkdirSync or similar
}


