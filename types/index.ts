export type AdminRole = 
  | 'own'      // Главный админ - все права
  | 'admin'    // Совместимость со старой ролью администратора
  | 'admin1'   // Управление пользователями и каналами
  | 'admin2'   // Управление видео и контентом
  | 'admin3'   // Модерация жалоб
  | 'admin4'   // Управление комментариями
  | 'admin5'   // Статистика и аналитика
  | 'admin6'   // Управление категориями
  | 'admin7'   // Управление плейлистами
  | 'admin8'   // Техническая поддержка
  | 'admin9'   // Контент-модератор
  | 'admin10'  // Базовый модератор
  | 'tech-admin' // Технический админ - технические права

export type UserBadge = 
  | 'staff'        // Сотрудник YT
  | 'verified'     // Верифицированный
  | 'premium'      // Премиум
  | 'partner'      // Партнер
  | 'creator'      // Креатор
  | 'pumpkin'      // Тыквочка (осень)
  | 'golden-leaf'  // Золотой лист (осень)
  | 'santa'        // Санта (зима)
  | 'ice-master'   // Ледяной мастер (зима)
  | 'winter-king'  // Король зимы (зима)
  | 'february-heart' // Февральское сердце (зима)
  | 'sprout'       // Росточек (весна)
  | 'blooming'     // Цветущий (весна)
  | 'spring-keeper' // Хранитель Весны (весна)
  | 'beach-goer'   // Пляжник (лето)
  | 'sun-lord'     // Повелитель солнца (лето)

export type AvatarFrame = 
  | 'none'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'rainbow'
  | 'premium'
  | 'autumn-leaves'
  | 'autumn-gold'
  | 'autumn-pumpkin'
  | 'winter-snow'
  | 'winter-frost'
  | 'winter-holiday'
  | 'spring-flowers'
  | 'spring-petals'
  | 'spring-bloom'
  | 'summer-waves'
  | 'summer-sun'
  | 'summer-beach'
  | 'official-gold'

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  banner?: string
  description?: string
  subscribersCount: number
  createdAt: string
  emailVerified: boolean
  password?: string
  passwordHash?: string
  updatedAt?: string
  role?: 'user' | AdminRole
  badges?: UserBadge[]
  avatarFrame?: AvatarFrame
  socialLinks?: {
    youtube?: string
    twitter?: string
    instagram?: string
    website?: string
  }
  isBlocked?: boolean
  warnings?: number
  blockedUntil?: string
  isOfficial?: boolean
  nicknameHighlight?: string
}

export interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  views: number
  likes: number
  dislikes: number
  category: string
  tags: string[]
  privacy: 'public' | 'unlisted' | 'subscribers'
  userId: string
  user: User
  createdAt: string
  updatedAt: string
}

export interface Comment {
  isPinned?: boolean
  id: string
  text: string
  userId: string
  user: User
  videoId: string
  parentId?: string
  likes: number
  dislikes: number
  replies?: Comment[]
  createdAt: string
  updatedAt: string
  isAuthorReply?: boolean
  authorLiked?: boolean
}

export interface Playlist {
  id: string
  name: string
  description?: string
  userId: string
  videos: Video[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  channelId: string
  channel: User
  createdAt: string
}

export interface WatchHistory {
  id: string
  userId: string
  videoId: string
  video: Video
  watchedAt: string
  progress: number
}

export interface Like {
  id: string
  userId: string
  videoId?: string
  commentId?: string
  type: 'like' | 'dislike'
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'info' | 'new_video' | 'video_deleted' | 'warning' | 'channel_blocked' | 'badge_earned' | 'season_changed' | 'new_feature' | 'subscription'
  title: string
  message?: string
  link?: string
  read: boolean
  createdAt: string
}

export interface SeasonalEvent {
  id: string
  userId: string
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  eventType: string
  completed: boolean
  completedAt?: string
  reward?: string
}

export interface AdventCalendar {
  id: string
  userId: string
  day: number
  month: number
  year: number
  reward?: string
  claimedAt: string
}

