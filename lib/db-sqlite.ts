// SQLite database initialization and schema
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(process.cwd(), 'data', 'yt2.db')

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize database
let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) {
    return db
  }

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  // Create tables
  initializeSchema(db)

  return db
}

function initializeSchema(database: Database.Database) {
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT,
      avatar TEXT,
      banner TEXT,
      description TEXT,
      subscribersCount INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      emailVerified INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      badges TEXT,
      avatarFrame TEXT DEFAULT 'none',
      socialLinks TEXT,
      isBlocked INTEGER DEFAULT 0,
      warnings INTEGER DEFAULT 0,
      blockedUntil TEXT,
      isOfficial INTEGER DEFAULT 0,
      nicknameHighlight TEXT
    )
  `)

  // Videos table
  database.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      videoUrl TEXT NOT NULL,
      thumbnailUrl TEXT,
      duration INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      category TEXT,
      tags TEXT,
      privacy TEXT DEFAULT 'public',
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Comments table
  database.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      userId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      parentId TEXT,
      likes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      isAuthorReply INTEGER DEFAULT 0,
      authorLiked INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (videoId) REFERENCES videos(id),
      FOREIGN KEY (parentId) REFERENCES comments(id)
    )
  `)

  // Playlists table
  database.exec(`
    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      userId TEXT NOT NULL,
      isPublic INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Playlist videos junction table
  database.exec(`
    CREATE TABLE IF NOT EXISTS playlist_videos (
      playlistId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      orderIndex INTEGER DEFAULT 0,
      PRIMARY KEY (playlistId, videoId),
      FOREIGN KEY (playlistId) REFERENCES playlists(id),
      FOREIGN KEY (videoId) REFERENCES videos(id)
    )
  `)

  // Subscriptions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(userId, channelId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (channelId) REFERENCES users(id)
    )
  `)

  // Watch history table
  database.exec(`
    CREATE TABLE IF NOT EXISTS watch_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      watchedAt TEXT NOT NULL,
      progress REAL DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (videoId) REFERENCES videos(id)
    )
  `)

  // Likes table
  database.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT,
      commentId TEXT,
      type TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(userId, videoId, commentId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (videoId) REFERENCES videos(id),
      FOREIGN KEY (commentId) REFERENCES comments(id)
    )
  `)

  // Reports table
  database.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT,
      channelId TEXT,
      reason TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      reviewedBy TEXT,
      reviewedAt TEXT,
      action TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (videoId) REFERENCES videos(id),
      FOREIGN KEY (channelId) REFERENCES users(id)
    )
  `)

  // Notifications table
  database.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // User badges table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      badge TEXT NOT NULL,
      earnedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Seasonal events table
  database.exec(`
    CREATE TABLE IF NOT EXISTS seasonal_events (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      season TEXT NOT NULL,
      eventType TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completedAt TEXT,
      reward TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Advent calendar table
  database.exec(`
    CREATE TABLE IF NOT EXISTS advent_calendar (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      day INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      reward TEXT,
      claimedAt TEXT NOT NULL,
      UNIQUE(userId, day, month, year),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_videos_userId ON videos(userId);
    CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
    CREATE INDEX IF NOT EXISTS idx_comments_videoId ON comments(videoId);
    CREATE INDEX IF NOT EXISTS idx_comments_parentId ON comments(parentId);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions(userId);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_channelId ON subscriptions(channelId);
    CREATE INDEX IF NOT EXISTS idx_likes_userId ON likes(userId);
    CREATE INDEX IF NOT EXISTS idx_likes_videoId ON likes(videoId);
    CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  `)
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}


