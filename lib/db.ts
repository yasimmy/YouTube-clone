// In-memory database simulation with localStorage persistence
// In production, replace with real database (PostgreSQL, MongoDB, etc.)

import { User, Video, Comment, Playlist, Subscription, WatchHistory, Like } from '@/types'
import { Report } from '@/types/admin'
import { LoginHistory, ActiveSession } from '@/types/sessions'
import { loadDatabaseFromStorage, saveDatabaseToStorage } from './db-persist'

// Load from localStorage on initialization (only on client side)
// This needs to be done lazily to avoid SSR issues
interface DatabaseState {
  users: User[]
  videos: Video[]
  comments: Comment[]
  playlists: Playlist[]
      subscriptions: Subscription[]
      watchHistory: WatchHistory[]
      likes: Like[]
      reports: Report[]
      loginHistory: LoginHistory[]
      activeSessions: ActiveSession[]
}

let initialData: DatabaseState | null = null

// Initialize on first access (client-side only)
const getInitialData = (): DatabaseState => {
  if (initialData === null) {
    initialData = {
      users: [],
      videos: [],
      comments: [],
      playlists: [],
      subscriptions: [],
      watchHistory: [],
      likes: [],
      reports: [],
      loginHistory: [],
      activeSessions: [],
    }
    
    if (typeof window !== 'undefined') {
      const saved = loadDatabaseFromStorage()
      if (saved) {
        initialData = {
          users: saved.users || [],
          videos: saved.videos || [],
          comments: saved.comments || [],
          playlists: saved.playlists || [],
          subscriptions: saved.subscriptions || [],
          watchHistory: saved.watchHistory || [],
          likes: saved.likes || [],
          reports: saved.reports || [],
          loginHistory: saved.loginHistory || [],
          activeSessions: saved.activeSessions || [],
        }
      }
    }
  }
  return initialData
}

// Storage - lazy initialization
let users: User[] = []
let videos: Video[] = []
let comments: Comment[] = []
let playlists: Playlist[] = []
let subscriptions: Subscription[] = []
let watchHistory: WatchHistory[] = []
let likes: Like[] = []
let reports: Report[] = []
let loginHistory: LoginHistory[] = []
let activeSessions: ActiveSession[] = []

const normalizeUsername = (username: string): string => {
  const value = String(username || '').trim()
  const withoutDatabaseZero = value.replace(/\.0$/, '')
  return withoutDatabaseZero || value
}

const normalizeUser = (user: User): User => {
  const username = normalizeUsername(user.username)
  if (user.email === 'admin@yt2.com' && (username === 'admin0' || username === 'admin')) {
    return { ...user, username: 'admin' }
  }
  return { ...user, username }
}

// Initialize from localStorage on first access
let initialized = false
const initializeDB = () => {
  if (!initialized && typeof window !== 'undefined') {
    const data = getInitialData()
    users = (data.users || []).map(normalizeUser)
    videos = data.videos || []
    comments = data.comments || []
    playlists = data.playlists || []
      subscriptions = data.subscriptions || []
      watchHistory = data.watchHistory || []
      likes = data.likes || []
      reports = data.reports || []
      loginHistory = data.loginHistory || []
      activeSessions = data.activeSessions || []
    initialized = true
    console.log('DB initialized with', users.length, 'users')
  }
}

// Initialize immediately if on client
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    initializeDB()
  }, 0)
}

// Helper to save to localStorage
const persist = () => {
  if (typeof window !== 'undefined') {
    saveDatabaseToStorage({
      users,
      videos,
      comments,
      playlists,
      subscriptions,
      watchHistory,
      likes,
      reports,
      loginHistory,
      activeSessions,
    })
  }
}

// Users
export const db = {
  users: {
    create: (user: Omit<User, 'id' | 'createdAt' | 'subscribersCount'>) => {
      // Ensure DB is initialized
      if (typeof window !== 'undefined' && !initialized) {
        initializeDB()
      }
      
      const newUser: User = {
        ...user,
        username: normalizeUsername(user.username),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        subscribersCount: 0,
        emailVerified: user.emailVerified ?? false,
        updatedAt: new Date().toISOString(),
        role: user.role || 'user',
      }
      users.push(newUser)
      persist()
      return newUser
    },
    findById: (id: string) => {
      if (typeof window !== 'undefined' && !initialized) {
        initializeDB()
      }
      // Ensure DB is loaded
      const found = users.find((u) => u.id === id)
      // If not found and DB might not be initialized, try again
      if (!found && typeof window !== 'undefined') {
        initializeDB()
        return users.find((u) => u.id === id)
      }
      return found
    },
    findByEmail: (email: string) => {
      if (typeof window !== 'undefined' && !initialized) {
        initializeDB()
      }
      return users.find((u) => u.email === email)
    },
    findByUsername: (username: string) => {
      if (typeof window !== 'undefined' && !initialized) {
        initializeDB()
      }
      return users.find((u) => u.username === username)
    },
    search: (query: string) => {
      if (typeof window !== 'undefined' && !initialized) {
        initializeDB()
      }
      const lowerQuery = query.toLowerCase()
      return users.filter(
        (u) =>
          u.username.toLowerCase().includes(lowerQuery) ||
          u.email.toLowerCase().includes(lowerQuery)
      )
    },
    update: (id: string, data: Partial<User>) => {
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users[index] = normalizeUser({ ...users[index], ...data, username: data.username === undefined ? users[index].username : normalizeUsername(data.username) })
        persist()
        return users[index]
      }
      return null
    },
    getAll: () => {
      if (typeof window !== 'undefined') {
        // Always reload from storage to ensure sync
        if (!initialized) {
          initializeDB()
        } else {
          // Reload from storage to get latest data
          const data = getInitialData()
          users = (data.users || []).map(normalizeUser)
        }
      }
      return users
    },
    delete: (id: string) => {
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.splice(index, 1)
        persist()
        return true
      }
      return false
    },
  },
  videos: {
    create: (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'dislikes' | 'user'>) => {
      const user = users.find((u) => u.id === video.userId)
      if (!user) throw new Error('User not found')
      
      const newVideo: Video = {
        ...video,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        dislikes: 0,
        user,
      }
      videos.push(newVideo)
      persist()
      return newVideo
    },
    findById: (id: string) => videos.find((v) => v.id === id),
    findByUserId: (userId: string) => videos.filter((v) => v.userId === userId),
    getAll: () => videos,
    getPublic: () => videos.filter((v) => v.privacy === 'public'),
    search: (query: string) => {
      const lowerQuery = query.toLowerCase()
      return videos.filter(
        (v) =>
          v.title.toLowerCase().includes(lowerQuery) ||
          v.description.toLowerCase().includes(lowerQuery) ||
          v.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
    },
    update: (id: string, data: Partial<Video>) => {
      const index = videos.findIndex((v) => v.id === id)
      if (index !== -1) {
        videos[index] = { ...videos[index], ...data, updatedAt: new Date().toISOString() }
        persist()
        return videos[index]
      }
      return null
    },
    incrementViews: (id: string) => {
      const video = videos.find((v) => v.id === id)
      if (video) {
        video.views++
        persist()
        return video
      }
      return null
    },
    delete: (id: string) => {
      const index = videos.findIndex((v) => v.id === id)
      if (index !== -1) {
        videos.splice(index, 1)
        persist()
        return true
      }
      return false
    },
  },
  comments: {
    create: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes' | 'user' | 'isAuthorReply' | 'authorLiked'>) => {
      const user = users.find((u) => u.id === comment.userId)
      if (!user) throw new Error('User not found')
      
      // Check if user is video author
      const video = videos.find((v) => v.id === comment.videoId)
      const isAuthorReply = video && video.userId === comment.userId
      
      const newComment: Comment = {
        ...comment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        isAuthorReply: isAuthorReply || false,
        authorLiked: false,
        user,
      }
      comments.push(newComment)
      persist()
      return newComment
    },
    findByVideoId: (videoId: string) => {
      const videoComments = comments.filter((c) => c.videoId === videoId && !c.parentId)
      return videoComments.map((comment) => ({
        ...comment,
        replies: comments.filter((c) => c.parentId === comment.id),
      }))
    },
    findById: (id: string) => comments.find((c) => c.id === id),
    update: (id: string, data: Partial<Comment>) => {
      const index = comments.findIndex((c) => c.id === id)
      if (index !== -1) {
        comments[index] = { 
          ...comments[index], 
          ...data, 
          updatedAt: new Date().toISOString(),
          // Preserve user object
          user: comments[index].user,
        }
        persist()
        return comments[index]
      }
      return null
    },
    delete: (id: string) => {
      const index = comments.findIndex((c) => c.id === id)
      if (index !== -1) {
        comments.splice(index, 1)
        persist()
        return true
      }
      return false
    },
    getAll: () => comments,
  },
  playlists: {
    create: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'videos'>) => {
      const newPlaylist: Playlist = {
        ...playlist,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        videos: [],
      }
      playlists.push(newPlaylist)
      persist()
      return newPlaylist
    },
    findByUserId: (userId: string) => playlists.filter((p) => p.userId === userId),
    findById: (id: string) => playlists.find((p) => p.id === id),
    addVideo: (playlistId: string, videoId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId)
      const video = videos.find((v) => v.id === videoId)
      if (playlist && video && !playlist.videos.some((v) => v.id === videoId)) {
        playlist.videos.push(video)
        playlist.updatedAt = new Date().toISOString()
        persist()
        return playlist
      }
      return null
    },
    removeVideo: (playlistId: string, videoId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId)
      if (playlist) {
        playlist.videos = playlist.videos.filter((v) => v.id !== videoId)
        playlist.updatedAt = new Date().toISOString()
        persist()
        return playlist
      }
      return null
    },
    delete: (id: string) => {
      const index = playlists.findIndex((p) => p.id === id)
      if (index !== -1) {
        playlists.splice(index, 1)
        persist()
        return true
      }
      return false
    },
    getAll: () => playlists,
  },
  subscriptions: {
    create: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'channel'>) => {
      const channel = users.find((u) => u.id === subscription.channelId)
      if (!channel) throw new Error('Channel not found')
      
      const existing = subscriptions.find(
        (s) => s.userId === subscription.userId && s.channelId === subscription.channelId
      )
      if (existing) return existing
      
      const newSubscription: Subscription = {
        ...subscription,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        channel,
      }
      subscriptions.push(newSubscription)
      
      // Update subscriber count
      const channelUser = users.find((u) => u.id === subscription.channelId)
      if (channelUser) {
        channelUser.subscribersCount++
      }
      
      persist()
      return newSubscription
    },
    findByUserId: (userId: string) => subscriptions.filter((s) => s.userId === userId),
    findByChannelId: (channelId: string) => subscriptions.filter((s) => s.channelId === channelId),
    delete: (userId: string, channelId: string) => {
      const index = subscriptions.findIndex(
        (s) => s.userId === userId && s.channelId === channelId
      )
      if (index !== -1) {
        subscriptions.splice(index, 1)
        
        // Update subscriber count
        const channelUser = users.find((u) => u.id === channelId)
        if (channelUser && channelUser.subscribersCount > 0) {
          channelUser.subscribersCount--
        }
        
        persist()
        return true
      }
      return false
    },
    isSubscribed: (userId: string, channelId: string) => {
      return subscriptions.some((s) => s.userId === userId && s.channelId === channelId)
    },
    getAll: () => subscriptions,
  },
  watchHistory: {
    create: (history: Omit<WatchHistory, 'id' | 'video'>) => {
      const video = videos.find((v) => v.id === history.videoId)
      if (!video) throw new Error('Video not found')
      
      const existing = watchHistory.find(
        (h) => h.userId === history.userId && h.videoId === history.videoId
      )
      if (existing) {
        existing.watchedAt = new Date().toISOString()
        existing.progress = history.progress
        return existing
      }
      
      const newHistory: WatchHistory = {
        ...history,
        id: Date.now().toString(),
        video,
      }
      watchHistory.push(newHistory)
      persist()
      return newHistory
    },
    findByUserId: (userId: string) => watchHistory.filter((h) => h.userId === userId),
    delete: (id: string) => {
      const index = watchHistory.findIndex((h) => h.id === id)
      if (index !== -1) {
        watchHistory.splice(index, 1)
        persist()
        return true
      }
      return false
    },
    getAll: () => watchHistory,
  },
  likes: {
    toggle: (like: Omit<Like, 'id' | 'createdAt'>) => {
      const existing = likes.find(
        (l) =>
          l.userId === like.userId &&
          ((like.videoId && l.videoId === like.videoId) ||
            (like.commentId && l.commentId === like.commentId))
      )
      
      if (existing) {
        if (existing.type === like.type) {
          // Remove like/dislike
          const index = likes.findIndex((l) => l.id === existing.id)
          likes.splice(index, 1)
          persist()
          
          if (existing.videoId) {
            const video = videos.find((v) => v.id === existing.videoId)
            if (video) {
              if (existing.type === 'like') {
                video.likes = Math.max(0, video.likes - 1)
              } else {
                video.dislikes = Math.max(0, video.dislikes - 1)
              }
            }
          } else if (existing.commentId) {
            const comment = comments.find((c) => c.id === existing.commentId)
            if (comment) {
              if (existing.type === 'like') {
                comment.likes = Math.max(0, comment.likes - 1)
              } else {
                comment.dislikes = Math.max(0, comment.dislikes - 1)
              }
            }
          }
          
          return null
        } else {
          // Change type
          existing.type = like.type
          
          if (existing.videoId) {
            const video = videos.find((v) => v.id === existing.videoId)
            if (video) {
              if (existing.type === 'like') {
                video.likes++
                video.dislikes = Math.max(0, video.dislikes - 1)
              } else {
                video.dislikes++
                video.likes = Math.max(0, video.likes - 1)
              }
            }
          } else if (existing.commentId) {
            const comment = comments.find((c) => c.id === existing.commentId)
            if (comment) {
              if (existing.type === 'like') {
                comment.likes++
                comment.dislikes = Math.max(0, comment.dislikes - 1)
              } else {
                comment.dislikes++
                comment.likes = Math.max(0, comment.likes - 1)
              }
            }
          }
          
          persist()
          return existing
        }
      } else {
        // Create new like/dislike
        const newLike: Like = {
          ...like,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        likes.push(newLike)
        persist()
        
        if (like.videoId) {
          const video = videos.find((v) => v.id === like.videoId)
          if (video) {
            if (like.type === 'like') video.likes++
            else video.dislikes++
          }
        } else if (like.commentId) {
          const comment = comments.find((c) => c.id === like.commentId)
          if (comment) {
            if (like.type === 'like') comment.likes++
            else comment.dislikes++
          }
        }
        
        return newLike
      }
    },
    getUserLike: (userId: string, videoId?: string, commentId?: string) => {
      return likes.find(
        (l) =>
          l.userId === userId &&
          ((videoId && l.videoId === videoId) || (commentId && l.commentId === commentId))
      )
    },
    delete: (id: string) => {
      const index = likes.findIndex((l) => l.id === id)
      if (index !== -1) {
        likes.splice(index, 1)
        persist()
        return true
      }
      return false
    },
    getAll: () => {
      if (typeof window !== 'undefined' && !initialized) {
        initializeDB()
      }
      return likes
    },
  },
  reports: {
    create: (report: Omit<Report, 'id' | 'createdAt' | 'status'>) => {
      const newReport: Report = {
        ...report,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
      }
      reports.push(newReport)
      persist()
      return newReport
    },
    findById: (id: string) => reports.find((r) => r.id === id),
    findByVideoId: (videoId: string) => reports.filter((r) => r.videoId === videoId),
    findByChannelId: (channelId: string) => reports.filter((r) => r.channelId === channelId),
    getAll: () => reports,
    getPending: () => reports.filter((r) => r.status === 'pending'),
    update: (id: string, data: Partial<Report>) => {
      const index = reports.findIndex((r) => r.id === id)
      if (index !== -1) {
        reports[index] = { ...reports[index], ...data }
        if (data.status && data.status !== 'pending') {
          reports[index].reviewedAt = new Date().toISOString()
        }
        persist()
        return reports[index]
      }
      return null
    },
    delete: (id: string) => {
      const index = reports.findIndex((r) => r.id === id)
      if (index !== -1) {
        reports.splice(index, 1)
        persist()
        return true
      }
      return false
    },
  },
  loginHistory: {
    create: (history: Omit<LoginHistory, 'id'>) => {
      const newHistory: LoginHistory = {
        ...history,
        id: Date.now().toString(),
      }
      loginHistory.push(newHistory)
      // Keep only last 100 entries per user
      const userHistory = loginHistory.filter(h => h.userId === history.userId)
      if (userHistory.length > 100) {
        const toRemove = userHistory.slice(0, userHistory.length - 100)
        loginHistory = loginHistory.filter(h => !toRemove.includes(h))
      }
      persist()
      return newHistory
    },
    findByUserId: (userId: string) => {
      return loginHistory
        .filter(h => h.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    getAll: () => loginHistory,
    delete: (id: string) => {
      const index = loginHistory.findIndex(h => h.id === id)
      if (index !== -1) {
        loginHistory.splice(index, 1)
        persist()
        return true
      }
      return false
    },
  },
  sessions: {
    create: (session: Omit<ActiveSession, 'id'>) => {
      const newSession: ActiveSession = {
        ...session,
        id: Date.now().toString(),
      }
      activeSessions.push(newSession)
      persist()
      return newSession
    },
    findByUserId: (userId: string) => {
      return activeSessions
        .filter(s => s.userId === userId)
        .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    },
    findByToken: (token: string) => {
      return activeSessions.find(s => s.sessionToken === token)
    },
    updateActivity: (sessionId: string) => {
      const session = activeSessions.find(s => s.id === sessionId)
      if (session) {
        session.lastActivity = new Date().toISOString()
        persist()
        return session
      }
      return null
    },
    update: (sessionId: string, data: Partial<ActiveSession>) => {
      const index = activeSessions.findIndex(s => s.id === sessionId)
      if (index !== -1) {
        activeSessions[index] = { ...activeSessions[index], ...data }
        persist()
        return activeSessions[index]
      }
      return null
    },
    delete: (sessionId: string) => {
      const index = activeSessions.findIndex(s => s.id === sessionId)
      if (index !== -1) {
        activeSessions.splice(index, 1)
        persist()
        return true
      }
      return false
    },
    deleteAll: (userId: string, exceptSessionId?: string) => {
      activeSessions = activeSessions.filter(s => 
        s.userId !== userId || (exceptSessionId && s.id === exceptSessionId)
      )
      persist()
    },
    getAll: () => activeSessions,
  },
}

