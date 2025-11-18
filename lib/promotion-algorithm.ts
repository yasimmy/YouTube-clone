// Video promotion algorithm
import { Video, User } from '@/types'
import { db } from './db'

export interface VideoScore {
  video: Video
  score: number
  factors: {
    views: number
    likes: number
    comments: number
    recency: number
    engagement: number
    channel: number
  }
}

// Calculate video promotion score
export function calculateVideoScore(video: Video): VideoScore {
  const now = Date.now()
  const videoDate = new Date(video.createdAt).getTime()
  const ageInHours = (now - videoDate) / (1000 * 60 * 60)
  
  // Recency factor (newer videos get boost)
  const recencyScore = Math.max(0, 100 - ageInHours * 2) // Decay over 50 hours
  
  // Engagement rate (likes + comments per view)
  const engagementRate = video.views > 0 
    ? ((video.likes + db.comments.findByVideoId(video.id).length) / video.views) * 100
    : 0
  const engagementScore = Math.min(100, engagementRate * 10)
  
  // Channel authority (subscribers, verified, etc.)
  const channelScore = calculateChannelScore(video.user)
  
  // Views score (logarithmic scale)
  const viewsScore = Math.min(100, Math.log10(video.views + 1) * 10)
  
  // Likes score
  const likesScore = Math.min(100, Math.log10(video.likes + 1) * 15)
  
  // Comments score
  const commentsCount = db.comments.findByVideoId(video.id).length
  const commentsScore = Math.min(100, commentsCount * 5)
  
  // Total score (weighted)
  const totalScore = 
    recencyScore * 0.2 +
    engagementScore * 0.25 +
    channelScore * 0.15 +
    viewsScore * 0.15 +
    likesScore * 0.15 +
    commentsScore * 0.1
  
  return {
    video,
    score: totalScore,
    factors: {
      views: viewsScore,
      likes: likesScore,
      comments: commentsScore,
      recency: recencyScore,
      engagement: engagementScore,
      channel: channelScore,
    },
  }
}

// Calculate channel authority score
function calculateChannelScore(user: User): number {
  let score = 50 // Base score
  
  // Subscribers boost
  if (user.subscribersCount > 0) {
    score += Math.min(30, Math.log10(user.subscribersCount + 1) * 5)
  }
  
  // Verified badge
  if (user.badges?.includes('verified')) {
    score += 20
  }
  
  // Premium badge
  if (user.badges?.includes('premium')) {
    score += 10
  }
  
  // Official channel
  if (user.isOfficial) {
    score += 30
  }
  
  return Math.min(100, score)
}

// Get promoted videos (trending)
export function getPromotedVideos(limit: number = 20): Video[] {
  const allVideos = db.videos.getPublic()
  
  // Calculate scores for all videos
  const scoredVideos = allVideos.map(calculateVideoScore)
  
  // Sort by score (descending)
  scoredVideos.sort((a, b) => b.score - a.score)
  
  // Return top videos
  return scoredVideos.slice(0, limit).map(sv => sv.video)
}

// Get recommended videos for user
export function getRecommendedVideos(userId: string | null, limit: number = 10): Video[] {
  if (!userId) {
    // For non-logged users, return trending
    return getPromotedVideos(limit)
  }
  
  const user = db.users.findById(userId)
  if (!user) return getPromotedVideos(limit)
  
  // Get user's watch history
  const history = db.watchHistory.findByUserId(userId)
  const watchedVideoIds = new Set(history.map(h => h.videoId))
  
  // Get user's subscriptions
  const subscriptions = db.subscriptions.findByUserId(userId)
  const subscribedChannelIds = new Set(subscriptions.map(s => s.channelId))
  
  // Get all public videos
  const allVideos = db.videos.getPublic()
  
  // Filter out watched videos
  const unwatchedVideos = allVideos.filter(v => !watchedVideoIds.has(v.id))
  
  // Calculate personalized scores
  const scoredVideos = unwatchedVideos.map(video => {
    const baseScore = calculateVideoScore(video)
    let personalizedScore = baseScore.score
    
    // Boost from subscribed channels
    if (subscribedChannelIds.has(video.userId)) {
      personalizedScore += 30
    }
    
    // Boost similar categories (if user watched videos in this category)
    const watchedCategories = history
      .map(h => {
        const v = db.videos.findById(h.videoId)
        return v?.category
      })
      .filter(Boolean) as string[]
    
    if (watchedCategories.includes(video.category)) {
      personalizedScore += 20
    }
    
    return {
      ...baseScore,
      score: personalizedScore,
    }
  })
  
  // Sort by personalized score
  scoredVideos.sort((a, b) => b.score - a.score)
  
  return scoredVideos.slice(0, limit).map(sv => sv.video)
}

// Get related videos
export function getRelatedVideos(videoId: string, limit: number = 10): Video[] {
  const video = db.videos.findById(videoId)
  if (!video) return []
  
  const allVideos = db.videos.getPublic()
  const related = allVideos
    .filter(v => v.id !== videoId)
    .map(v => {
      let score = 0
      
      // Same category
      if (v.category === video.category) score += 30
      
      // Same channel
      if (v.userId === video.userId) score += 40
      
      // Common tags
      const commonTags = v.tags.filter(tag => video.tags.includes(tag))
      score += commonTags.length * 10
      
      // Engagement score
      const engagement = calculateVideoScore(v)
      score += engagement.score * 0.2
      
      return { video: v, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.video)
  
  return related
}

