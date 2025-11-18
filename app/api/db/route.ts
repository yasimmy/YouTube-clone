// Universal API route for database operations
import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db-sqlite'
import { User, Video, Comment, Like, Notification } from '@/types'
import { sanitizeInput, checkRateLimit, getClientIP } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP()
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { action, table, data } = await request.json()
    
    // Sanitize all string inputs in data
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
          data[key] = sanitizeInput(data[key])
        }
      })
    }
    
    const db = getDatabase()

    switch (action) {
      case 'users.create': {
        const user = data as Omit<User, 'id' | 'createdAt' | 'subscribersCount' | 'emailVerified'>
        const id = Date.now().toString()
        const createdAt = new Date().toISOString()
        
        const stmt = db.prepare(`
          INSERT INTO users (id, email, username, password, avatar, banner, description, subscribersCount, createdAt, emailVerified, role, badges, avatarFrame, socialLinks, isBlocked, warnings, isOfficial, nicknameHighlight)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?, ?, ?, 0, 0, ?, ?)
        `)
        
        stmt.run(
          id,
          user.email,
          user.username,
          (user as any).password || null,
          user.avatar || null,
          user.banner || null,
          user.description || null,
          createdAt,
          user.role || 'user',
          JSON.stringify(user.badges || []),
          user.avatarFrame || 'none',
          JSON.stringify(user.socialLinks || {}),
          user.isOfficial ? 1 : 0,
          user.nicknameHighlight || null
        )
        
        return NextResponse.json({ id, createdAt, subscribersCount: 0, emailVerified: false, ...user })
      }

      case 'users.findById': {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
        const row = stmt.get(data.id) as any
        if (!row) return NextResponse.json(null)
        
        return NextResponse.json({
          ...row,
          emailVerified: row.emailVerified === 1,
          isBlocked: row.isBlocked === 1,
          isOfficial: row.isOfficial === 1,
          badges: row.badges ? JSON.parse(row.badges) : [],
          socialLinks: row.socialLinks ? JSON.parse(row.socialLinks) : {},
        })
      }

      case 'users.findByEmail': {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
        const row = stmt.get(data.email) as any
        if (!row) return NextResponse.json(null)
        
        return NextResponse.json({
          ...row,
          emailVerified: row.emailVerified === 1,
          isBlocked: row.isBlocked === 1,
          isOfficial: row.isOfficial === 1,
          badges: row.badges ? JSON.parse(row.badges) : [],
          socialLinks: row.socialLinks ? JSON.parse(row.socialLinks) : {},
        })
      }

      case 'users.getAll': {
        const stmt = db.prepare('SELECT * FROM users')
        const rows = stmt.all() as any[]
        
        return NextResponse.json(rows.map(row => ({
          ...row,
          emailVerified: row.emailVerified === 1,
          isBlocked: row.isBlocked === 1,
          isOfficial: row.isOfficial === 1,
          badges: row.badges ? JSON.parse(row.badges) : [],
          socialLinks: row.socialLinks ? JSON.parse(row.socialLinks) : {},
        })))
      }

      case 'users.update': {
        const { id, ...updateData } = data
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        
        const updated = {
          ...user,
          ...updateData,
          badges: updateData.badges ? JSON.stringify(updateData.badges) : user.badges,
          socialLinks: updateData.socialLinks ? JSON.stringify(updateData.socialLinks) : user.socialLinks,
          emailVerified: updateData.emailVerified !== undefined ? (updateData.emailVerified ? 1 : 0) : user.emailVerified,
          isBlocked: updateData.isBlocked !== undefined ? (updateData.isBlocked ? 1 : 0) : user.isBlocked,
          isOfficial: updateData.isOfficial !== undefined ? (updateData.isOfficial ? 1 : 0) : user.isOfficial,
        }
        
        const stmt = db.prepare(`
          UPDATE users SET 
            email = ?, username = ?, avatar = ?, banner = ?, description = ?,
            subscribersCount = ?, role = ?, badges = ?, avatarFrame = ?,
            socialLinks = ?, isBlocked = ?, warnings = ?, blockedUntil = ?,
            isOfficial = ?, nicknameHighlight = ?
          WHERE id = ?
        `)
        
        stmt.run(
          updated.email,
          updated.username,
          updated.avatar,
          updated.banner,
          updated.description,
          updated.subscribersCount,
          updated.role,
          updated.badges,
          updated.avatarFrame,
          updated.socialLinks,
          updated.isBlocked,
          updated.warnings,
          updated.blockedUntil,
          updated.isOfficial,
          updated.nicknameHighlight,
          id
        )
        
        return NextResponse.json({
          ...updated,
          emailVerified: updated.emailVerified === 1,
          isBlocked: updated.isBlocked === 1,
          isOfficial: updated.isOfficial === 1,
          badges: updated.badges ? JSON.parse(updated.badges) : [],
          socialLinks: updated.socialLinks ? JSON.parse(updated.socialLinks) : {},
        })
      }

      case 'videos.create': {
        const video = data as Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'dislikes' | 'user'>
        const id = Date.now().toString()
        const now = new Date().toISOString()
        
        const stmt = db.prepare(`
          INSERT INTO videos (id, title, description, videoUrl, thumbnailUrl, duration, views, likes, dislikes, category, tags, privacy, userId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, ?, ?)
        `)
        
        stmt.run(
          id,
          video.title,
          video.description,
          video.videoUrl,
          video.thumbnailUrl,
          video.duration,
          video.category,
          JSON.stringify(video.tags),
          video.privacy,
          video.userId,
          now,
          now
        )
        
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(video.userId) as any
        return NextResponse.json({
          id,
          ...video,
          createdAt: now,
          updatedAt: now,
          views: 0,
          likes: 0,
          dislikes: 0,
          user: user ? {
            ...user,
            emailVerified: user.emailVerified === 1,
            isBlocked: user.isBlocked === 1,
            badges: user.badges ? JSON.parse(user.badges) : [],
            socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : {},
          } : null,
        })
      }

      case 'videos.findById': {
        const stmt = db.prepare('SELECT * FROM videos WHERE id = ?')
        const row = stmt.get(data.id) as any
        if (!row) return NextResponse.json(null)
        
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.userId) as any
        
        return NextResponse.json({
          ...row,
          tags: row.tags ? JSON.parse(row.tags) : [],
          user: user ? {
            ...user,
            emailVerified: user.emailVerified === 1,
            isBlocked: user.isBlocked === 1,
            badges: user.badges ? JSON.parse(user.badges) : [],
            socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : {},
          } : null,
        })
      }

      case 'videos.getAll': {
        const stmt = db.prepare('SELECT * FROM videos')
        const rows = stmt.all() as any[]
        
        return NextResponse.json(rows.map(row => {
          const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.userId) as any
          return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            user: user ? {
              ...user,
              emailVerified: user.emailVerified === 1,
              isBlocked: user.isBlocked === 1,
              badges: user.badges ? JSON.parse(user.badges) : [],
              socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : {},
            } : null,
          }
        }))
      }

      case 'videos.incrementViews': {
        const stmt = db.prepare('UPDATE videos SET views = views + 1 WHERE id = ?')
        stmt.run(data.id)
        return NextResponse.json({ success: true })
      }

      case 'comments.create': {
        const comment = data as Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes' | 'user' | 'isAuthorReply' | 'authorLiked'>
        const id = Date.now().toString()
        const now = new Date().toISOString()
        
        // Check if user is video author
        const video = db.prepare('SELECT userId FROM videos WHERE id = ?').get(comment.videoId) as any
        const isAuthorReply = video && video.userId === comment.userId
        
        const stmt = db.prepare(`
          INSERT INTO comments (id, text, userId, videoId, parentId, likes, dislikes, createdAt, updatedAt, isAuthorReply, authorLiked)
          VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, 0)
        `)
        
        stmt.run(
          id,
          comment.text,
          comment.userId,
          comment.videoId,
          comment.parentId || null,
          now,
          now,
          isAuthorReply ? 1 : 0
        )
        
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(comment.userId) as any
        
        return NextResponse.json({
          id,
          ...comment,
          createdAt: now,
          updatedAt: now,
          likes: 0,
          dislikes: 0,
          isAuthorReply: isAuthorReply,
          authorLiked: false,
          user: user ? {
            ...user,
            emailVerified: user.emailVerified === 1,
            isBlocked: user.isBlocked === 1,
            badges: user.badges ? JSON.parse(user.badges) : [],
            socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : {},
          } : null,
        })
      }

      case 'comments.findByVideoId': {
        const stmt = db.prepare('SELECT * FROM comments WHERE videoId = ? AND parentId IS NULL ORDER BY createdAt DESC')
        const rows = stmt.all(data.videoId) as any[]
        
        const comments = rows.map(row => {
          const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.userId) as any
          const repliesStmt = db.prepare('SELECT * FROM comments WHERE parentId = ? ORDER BY createdAt ASC')
          const replies = repliesStmt.all(row.id) as any[]
          
          return {
            ...row,
            isAuthorReply: row.isAuthorReply === 1,
            authorLiked: row.authorLiked === 1,
            user: user ? {
              ...user,
              emailVerified: user.emailVerified === 1,
              isBlocked: user.isBlocked === 1,
              badges: user.badges ? JSON.parse(user.badges) : [],
              socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : {},
            } : null,
            replies: replies.map(reply => {
              const replyUser = db.prepare('SELECT * FROM users WHERE id = ?').get(reply.userId) as any
              return {
                ...reply,
                isAuthorReply: reply.isAuthorReply === 1,
                authorLiked: reply.authorLiked === 1,
                user: replyUser ? {
                  ...replyUser,
                  emailVerified: replyUser.emailVerified === 1,
                  isBlocked: replyUser.isBlocked === 1,
                  badges: replyUser.badges ? JSON.parse(replyUser.badges) : [],
                  socialLinks: replyUser.socialLinks ? JSON.parse(replyUser.socialLinks) : {},
                } : null,
              }
            }),
          }
        })
        
        return NextResponse.json(comments)
      }

      case 'notifications.create': {
        const notification = data as Omit<Notification, 'id' | 'createdAt' | 'read'>
        const id = Date.now().toString()
        const now = new Date().toISOString()
        
        const stmt = db.prepare(`
          INSERT INTO notifications (id, userId, type, title, message, link, read, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        `)
        
        stmt.run(
          id,
          notification.userId,
          notification.type,
          notification.title,
          notification.message || null,
          notification.link || null,
          now
        )
        
        return NextResponse.json({ id, ...notification, read: false, createdAt: now })
      }

      case 'notifications.findByUserId': {
        const stmt = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?')
        const rows = stmt.all(data.userId, data.limit || 50) as any[]
        
        return NextResponse.json(rows.map(row => ({
          ...row,
          read: row.read === 1,
        })))
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Database API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


