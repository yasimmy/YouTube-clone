// Notification utilities
import { Notification } from '@/types'

export function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message?: string,
  link?: string
): Notification {
  const notification: Notification = {
    id: Date.now().toString(),
    userId,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  }

  // Save to localStorage (will be replaced with API)
  try {
    const stored = localStorage.getItem(`notifications_${userId}`)
    const notifications: Notification[] = stored ? JSON.parse(stored) : []
    notifications.unshift(notification)
    // Keep only last 100 notifications
    const limited = notifications.slice(0, 100)
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(limited))
  } catch (e) {
    console.error('Error saving notification:', e)
  }

  return notification
}

export function notifyNewVideo(userId: string, videoTitle: string, videoId: string, channelName: string) {
  return createNotification(
    userId,
    'new_video',
    `Новое видео от ${channelName}`,
    videoTitle,
    `/watch/${videoId}`
  )
}

export function notifyVideoDeleted(userId: string, videoTitle: string) {
  return createNotification(
    userId,
    'video_deleted',
    'Ваше видео удалено',
    `Видео "${videoTitle}" было удалено администратором`
  )
}

export function notifyWarning(userId: string, warnings: number) {
  return createNotification(
    userId,
    'warning',
    'Получено предупреждение',
    `У вас ${warnings} предупреждений. После 3 предупреждений канал будет заблокирован.`
  )
}

export function notifyChannelBlocked(userId: string, days?: number) {
  return createNotification(
    userId,
    'channel_blocked',
    'Канал заблокирован',
    days 
      ? `Ваш канал заблокирован на ${days} дней`
      : 'Ваш канал заблокирован навсегда'
  )
}

export function notifyBadgeEarned(userId: string, badgeName: string) {
  return createNotification(
    userId,
    'badge_earned',
    'Получен новый значок!',
    `Вы получили значок "${badgeName}"`,
    `/channel/${userId}`
  )
}

export function notifySeasonChanged(userId: string, seasonName: string) {
  return createNotification(
    userId,
    'season_changed',
    'Смена сезона!',
    `Наступил сезон: ${seasonName}. Новые возможности и награды ждут вас!`
  )
}

export function notifyNewFeature(userId: string, featureName: string) {
  return createNotification(
    userId,
    'new_feature',
    'Новая функция!',
    `Доступна новая функция: ${featureName}`
  )
}


