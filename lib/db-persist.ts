// Database persistence using localStorage
// This ensures data survives page reloads

import { User, Video, Comment, Playlist, Subscription, WatchHistory, Like } from '@/types'
import { Report } from '@/types/admin'

const DB_STORAGE_KEY = 'yt2-database'

interface DatabaseState {
  users: User[]
  videos: Video[]
  comments: Comment[]
  playlists: Playlist[]
  subscriptions: Subscription[]
  watchHistory: WatchHistory[]
  likes: Like[]
  reports: Report[]
  loginHistory: any[]
  activeSessions: any[]
}

export function loadDatabaseFromStorage(): DatabaseState | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(DB_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load database from storage:', e)
  }
  
  return null
}

export function saveDatabaseToStorage(data: DatabaseState) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save database to storage:', e)
  }
}

export function clearDatabaseStorage() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DB_STORAGE_KEY)
}

