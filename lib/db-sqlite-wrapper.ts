// SQLite wrapper that provides the same interface as the in-memory db
// This allows gradual migration from localStorage to SQLite
import { User, Video, Comment, Playlist, Subscription, WatchHistory, Like } from '@/types'
import { Report } from '@/types/admin'

// Use API route for database operations (works on both client and server)
const API_BASE = '/api/db'

async function apiCall(action: string, data?: any) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API call failed for ${action}:`, error)
    // Fallback to localStorage if API fails
    throw error
  }
}

// Helper to migrate from localStorage to SQLite
async function migrateFromLocalStorage() {
  if (typeof window === 'undefined') return
  
  try {
    const storage = localStorage.getItem('yt2-storage')
    if (!storage) return
    
    const data = JSON.parse(storage)
    if (!data.state) return
    
    // Check if migration already done
    if (localStorage.getItem('yt2-sqlite-migrated') === 'true') return
    
    const { users, videos, comments, subscriptions, likes, reports } = data.state
    
    // Migrate users
    if (users && Array.isArray(users)) {
      for (const user of users) {
        try {
          await apiCall('users.create', {
            ...user,
            password: user.password || null,
          })
        } catch (e) {
          // User might already exist, try update
          try {
            await apiCall('users.update', { id: user.id, ...user })
          } catch (e2) {
            console.warn('Failed to migrate user:', user.id, e2)
          }
        }
      }
    }
    
    // Mark migration as done
    localStorage.setItem('yt2-sqlite-migrated', 'true')
    console.log('Migration from localStorage to SQLite completed')
  } catch (error) {
    console.error('Migration error:', error)
  }
}

// Initialize migration on client side
if (typeof window !== 'undefined') {
  // Run migration after a short delay to ensure API is ready
  setTimeout(() => {
    migrateFromLocalStorage()
  }, 1000)
}

export const db = {
  users: {
    create: async (user: Omit<User, 'id' | 'createdAt' | 'subscribersCount' | 'emailVerified'>) => {
      return await apiCall('users.create', user)
    },
    findById: async (id: string) => {
      return await apiCall('users.findById', { id })
    },
    findByEmail: async (email: string) => {
      return await apiCall('users.findByEmail', { email })
    },
    findByUsername: async (username: string) => {
      const all = await apiCall('users.getAll', {})
      return all.find((u: User) => u.username === username) || null
    },
    search: async (query: string) => {
      const all = await apiCall('users.getAll', {})
      const lowerQuery = query.toLowerCase()
      return all.filter((u: User) =>
        u.username.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery)
      )
    },
    update: async (id: string, data: Partial<User>) => {
      return await apiCall('users.update', { id, ...data })
    },
    getAll: async () => {
      return await apiCall('users.getAll', {})
    },
  },
  videos: {
    create: async (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'dislikes' | 'user'>) => {
      return await apiCall('videos.create', video)
    },
    findById: async (id: string) => {
      return await apiCall('videos.findById', { id })
    },
    findByUserId: async (userId: string) => {
      const all = await apiCall('videos.getAll', {})
      return all.filter((v: Video) => v.userId === userId)
    },
    getAll: async () => {
      return await apiCall('videos.getAll', {})
    },
    getPublic: async () => {
      const all = await apiCall('videos.getAll', {})
      return all.filter((v: Video) => v.privacy === 'public')
    },
    search: async (query: string) => {
      const all = await apiCall('videos.getAll', {})
      const lowerQuery = query.toLowerCase()
      return all.filter((v: Video) =>
        v.title.toLowerCase().includes(lowerQuery) ||
        v.description?.toLowerCase().includes(lowerQuery) ||
        v.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
    },
    update: async (id: string, data: Partial<Video>) => {
      // TODO: Implement in API
      const video = await apiCall('videos.findById', { id })
      if (!video) return null
      return { ...video, ...data, updatedAt: new Date().toISOString() }
    },
    incrementViews: async (id: string) => {
      await apiCall('videos.incrementViews', { id })
      return await apiCall('videos.findById', { id })
    },
    delete: async (id: string) => {
      // TODO: Implement in API
      return true
    },
  },
  comments: {
    create: async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes' | 'user' | 'isAuthorReply' | 'authorLiked'>) => {
      return await apiCall('comments.create', comment)
    },
    findByVideoId: async (videoId: string) => {
      return await apiCall('comments.findByVideoId', { videoId })
    },
    findById: async (id: string) => {
      // TODO: Implement in API
      return null
    },
    update: async (id: string, data: Partial<Comment>) => {
      // TODO: Implement in API
      return null
    },
    delete: async (id: string) => {
      // TODO: Implement in API
      return false
    },
  },
  // ... other methods would need similar async wrappers
  // For now, keeping the original db.ts for compatibility
}

