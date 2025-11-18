// Automatic currency rewards system
import { addCurrency, CURRENCY_RULES } from './currency'
import { db } from './db'

// Track processed milestones to avoid duplicate rewards
const processedMilestones = new Set<string>()

// Award currency when video receives a like
export function rewardLikeToAuthor(videoId: string, userId: string) {
  const video = db.videos.findById(videoId)
  if (!video || video.userId === userId) return // Don't reward self-likes
  
  const authorId = video.userId
  addCurrency(authorId, CURRENCY_RULES.LIKE_RECEIVED, `Лайк на видео "${video.title}"`)
}

// Award currency when channel gains a subscriber
export function rewardSubscriberToAuthor(channelId: string) {
  const channel = db.users.findById(channelId)
  if (!channel) return
  
  addCurrency(channelId, CURRENCY_RULES.SUBSCRIBER_GAINED, 'Новый подписчик')
}

// Award currency when video receives a comment
export function rewardCommentToAuthor(videoId: string, commentUserId: string) {
  const video = db.videos.findById(videoId)
  if (!video || video.userId === commentUserId) return // Don't reward self-comments
  
  const authorId = video.userId
  addCurrency(authorId, CURRENCY_RULES.COMMENT_RECEIVED, `Комментарий на видео "${video.title}"`)
}

// Check and award view milestones
export function checkViewMilestones(videoId: string) {
  const video = db.videos.findById(videoId)
  if (!video) return
  
  const milestoneKey = `${videoId}-${video.views}`
  if (processedMilestones.has(milestoneKey)) return
  
  let reward = 0
  let reason = ''
  
  if (video.views === 100) {
    reward = CURRENCY_RULES.VIEW_MILESTONE_100
    reason = '100 просмотров'
    processedMilestones.add(milestoneKey)
  } else if (video.views === 1000) {
    reward = CURRENCY_RULES.VIEW_MILESTONE_1000
    reason = '1000 просмотров'
    processedMilestones.add(milestoneKey)
  } else if (video.views === 10000) {
    reward = CURRENCY_RULES.VIEW_MILESTONE_10000
    reason = '10000 просмотров'
    processedMilestones.add(milestoneKey)
  }
  
  if (reward > 0) {
    addCurrency(video.userId, reward, `Достижение: ${reason} на видео "${video.title}"`)
  }
}

// Daily login reward (call on app load if user is logged in)
export function rewardDailyLogin(userId: string) {
  if (typeof window === 'undefined') return
  
  const today = new Date().toDateString()
  const lastLogin = localStorage.getItem(`yt2-last-login-${userId}`)
  
  if (lastLogin !== today) {
    addCurrency(userId, CURRENCY_RULES.DAILY_LOGIN, 'Ежедневный вход')
    localStorage.setItem(`yt2-last-login-${userId}`, today)
  }
}

