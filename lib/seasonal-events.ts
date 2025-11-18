// Seasonal events and rewards system
import { getCurrentSeason } from './season'
import { db } from './db'
import { notifyBadgeEarned } from './notifications'
import { UserBadge, AvatarFrame } from '@/types'

export interface SeasonalEvent {
  id: string
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  eventType: string
  name: string
  description: string
  requirements: {
    videos?: number
    likes?: number
    comments?: number
    views?: number
    profileUpdate?: boolean
  }
  rewards: {
    badge?: UserBadge
    frame?: AvatarFrame
    highlight?: string
    effect?: string
  }
}

const seasonalEvents: SeasonalEvent[] = [
  // Autumn events
  {
    id: 'autumn-harvest',
    season: 'autumn',
    eventType: 'harvest',
    name: 'Сбор урожая',
    description: 'Получите значок "Тыквочка" за любую сезонную активность',
    requirements: {
      likes: 1,
      videos: 1,
      views: 50,
    },
    rewards: {
      badge: 'pumpkin',
    },
  },
  {
    id: 'autumn-golden-leaf',
    season: 'autumn',
    eventType: 'golden-leaf',
    name: 'Найди золотой листочек',
    description: 'Редкий секретный значок. Найдите золотой листочек в творческой студии',
    requirements: {},
    rewards: {
      badge: 'golden-leaf',
    },
  },
  // Winter events
  {
    id: 'winter-santa-quest',
    season: 'winter',
    eventType: 'santa-quest',
    name: 'Новогодний квест',
    description: 'Найдите 5 подарков по всему интерфейсу',
    requirements: {},
    rewards: {
      badge: 'santa',
    },
  },
  {
    id: 'winter-snowball-fight',
    season: 'winter',
    eventType: 'snowball-fight',
    name: 'Снежная битва',
    description: 'Кидайте снежки другим пользователям',
    requirements: {},
    rewards: {
      badge: 'ice-master',
    },
  },
  // Spring events
  {
    id: 'spring-awakening',
    season: 'spring',
    eventType: 'awakening',
    name: 'Пробуждение',
    description: 'Загрузите хотя бы одно видео весной',
    requirements: {
      videos: 1,
    },
    rewards: {
      badge: 'sprout',
      frame: 'spring-flowers',
    },
  },
  {
    id: 'spring-fresh',
    season: 'spring',
    eventType: 'fresh',
    name: 'Весенний фреш',
    description: 'Обновите свой профиль с весенними декорациями',
    requirements: {
      profileUpdate: true,
    },
    rewards: {
      badge: 'blooming',
      effect: 'flower-rain',
    },
  },
  {
    id: 'spring-blooming',
    season: 'spring',
    eventType: 'blooming',
    name: 'Цветение',
    description: 'Для самых активных: загрузите 3 видео, поставьте 50 лайков, напишите 10 комментариев',
    requirements: {
      videos: 3,
      likes: 50,
      comments: 10,
    },
    rewards: {
      badge: 'spring-keeper',
      frame: 'spring-bloom',
      highlight: 'sakura-gold',
      effect: 'sakura-vortex',
    },
  },
  // Summer events
  {
    id: 'summer-drive',
    season: 'summer',
    eventType: 'drive',
    name: 'Летний движ',
    description: 'Загрузите 1 видео',
    requirements: {
      videos: 1,
    },
    rewards: {
      badge: 'beach-goer',
    },
  },
  {
    id: 'summer-sun-hunt',
    season: 'summer',
    eventType: 'sun-hunt',
    name: 'Охота за солнцем',
    description: 'Собирайте солнечные жетоны',
    requirements: {},
    rewards: {
      badge: 'sun-lord',
    },
  },
]

export function checkSeasonalEvents(userId: string) {
  const season = getCurrentSeason()
  const user = db.users.findById(userId)
  if (!user) return

  const userBadges = user.badges || []
  const seasonEvents = seasonalEvents.filter((e) => e.season === season)

  seasonEvents.forEach((event) => {
    // Skip if already completed
    if (event.rewards.badge && userBadges.some((b) => event.rewards.badge === b)) {
      return
    }

    let completed = true

    // Check requirements
    if (event.requirements.videos) {
      const userVideos = db.videos.findByUserId(userId)
      const seasonVideos = userVideos.filter((v) => {
        const videoDate = new Date(v.createdAt)
        const videoMonth = videoDate.getMonth() + 1
        if (season === 'autumn' && videoMonth >= 9 && videoMonth <= 11) return true
        if (season === 'winter' && (videoMonth === 12 || videoMonth <= 2)) return true
        if (season === 'spring' && videoMonth >= 3 && videoMonth <= 5) return true
        if (season === 'summer' && videoMonth >= 6 && videoMonth <= 8) return true
        return false
      })
      if (seasonVideos.length < event.requirements.videos) completed = false
    }

    if (event.requirements.likes) {
      // Simplified check - count all likes for now
      // In production, would track seasonal likes
      const allLikes = db.likes.getAll()
      const userLikes = allLikes.filter((l) => l.userId === userId && l.type === 'like')
      if (userLikes.length < event.requirements.likes) completed = false
    }

    if (event.requirements.comments) {
      // Get all comments by getting all videos and their comments
      const allVideos = db.videos.getAll()
      const allComments: any[] = []
      allVideos.forEach((video) => {
        const videoComments = db.comments.findByVideoId(video.id)
        allComments.push(...videoComments)
      })
      const userComments = allComments.filter((c) => c.userId === userId)
      if (userComments.length < event.requirements.comments) completed = false
    }

    if (event.requirements.profileUpdate) {
      // Check if user has updated profile recently (simplified)
      const userUpdated = user.updatedAt && new Date(user.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (!userUpdated) completed = false
    }

    if (completed && event.rewards.badge) {
      // Award badge
      const updatedBadges = [...userBadges, event.rewards.badge]
      db.users.update(userId, {
        badges: updatedBadges,
      })
      notifyBadgeEarned(userId, event.rewards.badge)

      // Award frame if specified
      if (event.rewards.frame) {
        db.users.update(userId, {
          avatarFrame: event.rewards.frame,
        })
      }
    }
  })
}

export function getSeasonalEvents(season?: 'spring' | 'summer' | 'autumn' | 'winter') {
  const currentSeason = season || getCurrentSeason()
  return seasonalEvents.filter((e) => e.season === currentSeason)
}

